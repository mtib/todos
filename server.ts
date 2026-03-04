import { Database } from "bun:sqlite";
import path from "path";
import fs from "fs";

const dbDir = process.env.DB_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, "todos.db");
const db = new Database(dbPath, { create: true });

// Optimize SQLite for better concurrency and reliability
db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA synchronous = NORMAL;");
db.run("PRAGMA foreign_keys = ON;");

// Initialize database and handle migrations
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT 0,
    parent_id INTEGER REFERENCES todos(id) ON DELETE CASCADE,
    owner_id INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migrations for existing DBs
db.run("ALTER TABLE todos ADD COLUMN owner_id INTEGER REFERENCES users(id);");

db.run(`
  CREATE TABLE IF NOT EXISTS labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS todo_labels (
    todo_id INTEGER REFERENCES todos(id) ON DELETE CASCADE,
    label_id INTEGER REFERENCES labels(id) ON DELETE CASCADE,
    PRIMARY KEY (todo_id, label_id)
  )
`);

const extractLabels = (text: string) => {
    const matches = text.match(/@(\w+)/g);
    return matches ? matches.map(m => m.substring(1)) : [];
};

const updateLabels = (todoId: number, description: string) => {
    const labelNames = extractLabels(description);
    db.run("DELETE FROM todo_labels WHERE todo_id = ?", [todoId]);
    for (const name of labelNames) {
        db.run("INSERT OR IGNORE INTO labels (name) VALUES (?)", [name]);
        const label = db.query("SELECT id FROM labels WHERE name = ?").get(name) as { id: number };
        db.run("INSERT OR IGNORE INTO todo_labels (todo_id, label_id) VALUES (?, ?)", [todoId, label.id]);
    }
};

const getUser = (req: Request) => {
    const username = req.headers.get("Tailscale-User") || "anonymous";
    db.run("INSERT OR IGNORE INTO users (username) VALUES (?)", [username]);
    return db.query("SELECT * FROM users WHERE username = ?").get(username) as { id: number; username: string };
};

const server = Bun.serve({
    port: 3000,
    async fetch(req, server) {
        const url = new URL(req.url);
        const path = url.pathname;
        const method = req.method;

        // WebSocket upgrade
        if (path === "/api/ws") {
            if (server.upgrade(req)) return;
            return new Response("Upgrade failed", { status: 400 });
        }

        // Get current user for all API requests
        let currentUser = { id: 0, username: 'anonymous' };
        if (path.startsWith("/api/")) {
            currentUser = getUser(req);
        }

        // API Routes
        if (path === "/api/todos") {
            if (method === "GET") {
                const userFilter = url.searchParams.get("users");
                let query = `
                  SELECT t.*, GROUP_CONCAT(l.name) as labels, u.username as owner_name
                  FROM todos t
                  LEFT JOIN todo_labels tl ON t.id = tl.todo_id
                  LEFT JOIN labels l ON tl.label_id = l.id
                  LEFT JOIN users u ON t.owner_id = u.id
                `;

                const params: Array<string | number> = [];
                if (userFilter) {
                    const ids = userFilter.split(",").map(id => parseInt(id)).filter(id => !isNaN(id));
                    if (ids.length > 0) {
                        query += ` WHERE t.owner_id IN (${ids.map(() => "?").join(",")})`;
                        params.push(...ids);
                    }
                }

                query += ` GROUP BY t.id ORDER BY t.created_at ASC`;

                const todos = db.query(query).all(...params).map((t: { completed: number; labels: string | null; }) => ({
                    ...t,
                    completed: !!t.completed,
                    labels: t.labels ? t.labels.split(',') : []
                }));
                return Response.json(todos);
            }

            if (method === "POST") {
                const body = await req.json();
                if (!body.text) return new Response("Text is required", { status: 400 });

                const result = db.run("INSERT INTO todos (text, description, parent_id, owner_id) VALUES (?, ?, ?, ?)", [
                    body.text,
                    body.description || null,
                    body.parent_id || null,
                    currentUser.id
                ]);
                const todoId = result.lastInsertRowid as number;

                if (body.description) updateLabels(todoId, body.description);
                server.publish("todos", "update");
                return Response.json(db.query("SELECT * FROM todos WHERE id = ?").get(todoId), { status: 201 });
            }
        }

        if (path === "/api/users") {
            return Response.json(db.query("SELECT * FROM users").all());
        }

        if (path === "/api/stats") {
            const stats = {
                taskCount: (db.query("SELECT COUNT(*) as count FROM todos").get() as { count: number }).count,
                currentUserTasks: (db.query("SELECT COUNT(*) as count FROM todos WHERE owner_id = ?").get(currentUser.id) as { count: number }).count,
                dbSize: fs.statSync(dbPath).size,
                memory: process.memoryUsage().rss,
                username: currentUser.username
            };
            return Response.json(stats);
        }

        if (path.startsWith("/api/todos/")) {
            const id = parseInt(path.split("/").pop() || "");
            if (isNaN(id)) return new Response("Invalid ID", { status: 400 });

            if (method === "PATCH") {
                const body = await req.json();
                const sets = [];
                const params = [];
                if (body.text !== undefined) { sets.push("text = ?"); params.push(body.text); }
                if (body.description !== undefined) { sets.push("description = ?"); params.push(body.description); }
                if (body.completed !== undefined) { sets.push("completed = ?"); params.push(body.completed ? 1 : 0); }

                if (sets.length === 0) return new Response("No fields to update", { status: 400 });
                params.push(id);
                db.run(`UPDATE todos SET ${sets.join(", ")} WHERE id = ?`, params);
                if (body.description !== undefined) updateLabels(id, body.description);
                server.publish("todos", "update");
                return Response.json(db.query("SELECT * FROM todos WHERE id = ?").get(id));
            }

            if (method === "DELETE") {
                db.run("DELETE FROM todos WHERE id = ?", [id]);
                server.publish("todos", "update");
                return new Response(null, { status: 204 });
            }
        }

        // Serve static files from dist/
        if (method === "GET") {
            const file = Bun.file(`./dist${path === "/" ? "/index.html" : path}`);
            if (await file.exists()) return new Response(file);
        }

        return new Response("Not Found", { status: 404 });
    },
    websocket: {
        open(ws) { ws.subscribe("todos"); },
        message(_ws, _message) { },
        close(ws) { ws.unsubscribe("todos"); },
    },
});

console.log(`Server running at http://localhost:${server.port}`);
