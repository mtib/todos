import { Database } from "bun:sqlite";
import path from "path";

const dbDir = process.env.DB_DIR || process.cwd();
const dbPath = path.join(dbDir, "todos.db");
const db = new Database(dbPath, { create: true });

// Optimize SQLite for better concurrency and reliability
db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA synchronous = NORMAL;");
db.run("PRAGMA foreign_keys = ON;");

// Initialize database and handle migrations
try {
    db.run("ALTER TABLE todos ADD COLUMN description TEXT;");
} catch (e) {
    // Column already exists or table doesn't exist yet
}

db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT 0,
    parent_id INTEGER REFERENCES todos(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

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

    // Clear existing labels for this todo
    db.run("DELETE FROM todo_labels WHERE todo_id = ?", [todoId]);

    for (const name of labelNames) {
        db.run("INSERT OR IGNORE INTO labels (name) VALUES (?)", [name]);
        const label = db.query("SELECT id FROM labels WHERE name = ?").get(name) as { id: number };
        db.run("INSERT OR IGNORE INTO todo_labels (todo_id, label_id) VALUES (?, ?)", [todoId, label.id]);
    }
};

const server = Bun.serve({
    port: 3000,
    async fetch(req, server) {
        const url = new URL(req.url);
        const path = url.pathname;
        const method = req.method;

        // WebSocket upgrade
        if (path === "/api/ws") {
            if (server.upgrade(req)) {
                return;
            }
            return new Response("Upgrade failed", { status: 400 });
        }

        // API Routes
        if (path === "/api/todos") {
            if (method === "GET") {
                const todos = db.query(`
                  SELECT t.*, GROUP_CONCAT(l.name) as labels
                  FROM todos t
                  LEFT JOIN todo_labels tl ON t.id = tl.todo_id
                  LEFT JOIN labels l ON tl.label_id = l.id
                  GROUP BY t.id
                  ORDER BY t.created_at ASC
                `).all().map((t: any) => ({
                    ...t,
                    completed: !!t.completed,
                    labels: t.labels ? t.labels.split(',') : []
                }));
                return Response.json(todos);
            }

            if (method === "POST") {
                const body = await req.json();
                if (!body.text) {
                    return new Response("Text is required", { status: 400 });
                }
                const result = db.run("INSERT INTO todos (text, description, parent_id) VALUES (?, ?, ?)", [
                    body.text,
                    body.description || null,
                    body.parent_id || null
                ]);
                const todoId = result.lastInsertRowid as number;

                if (body.description) {
                    updateLabels(todoId, body.description);
                }

                const newTodo = db.query("SELECT * FROM todos WHERE id = ?").get(todoId);

                // Broadcast update
                server.publish("todos", "update");

                return Response.json(newTodo, { status: 201 });
            }
        }

        if (path.startsWith("/api/todos/")) {
            const id = parseInt(path.split("/").pop() || "");
            if (isNaN(id)) return new Response("Invalid ID", { status: 400 });

            if (method === "PATCH") {
                const body = await req.json();
                const sets = [];
                const params = [];
                if (body.text !== undefined) {
                    sets.push("text = ?");
                    params.push(body.text);
                }
                if (body.description !== undefined) {
                    sets.push("description = ?");
                    params.push(body.description);
                }
                if (body.completed !== undefined) {
                    sets.push("completed = ?");
                    params.push(body.completed ? 1 : 0);
                }

                if (sets.length === 0) return new Response("No fields to update", { status: 400 });

                params.push(id);
                db.run(`UPDATE todos SET ${sets.join(", ")} WHERE id = ?`, params);

                if (body.description !== undefined) {
                    updateLabels(id, body.description);
                }

                // Broadcast update
                server.publish("todos", "update");

                const updatedTodo = db.query("SELECT * FROM todos WHERE id = ?").get(id);
                return Response.json(updatedTodo);
            }

            if (method === "DELETE") {
                db.run("DELETE FROM todos WHERE id = ?", [id]);

                // Broadcast update
                server.publish("todos", "update");

                return new Response(null, { status: 204 });
            }
        }

        // Serve static files from dist/
        if (method === "GET") {
            const file = Bun.file(`./dist${path === "/" ? "/index.html" : path}`);
            if (await file.exists()) {
                return new Response(file);
            }
        }

        return new Response("Not Found", { status: 404 });
    },
    websocket: {
        open(ws) {
            ws.subscribe("todos");
        },
        message(ws, message) {
            // Not expecting client messages for now
        },
        close(ws) {
            ws.unsubscribe("todos");
        },
    },
});


console.log(`Server running at http://localhost:${server.port}`);
