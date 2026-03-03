# Hierarchical Todo App

A powerful, real-time synchronized hierarchical todo list manager with PWA support and dark mode.

## 🚀 Running with Docker (Recommended)

The easiest way to run the app is using the pre-built images hosted on GitHub Container Registry (GHCR).

### Prerequisites
- Docker
- Docker Compose

### Fast Start
Create a `docker-compose.yml` file with the following content:

```yaml
services:
  frontend:
    image: ghcr.io/mtib/todos-frontend:main
    ports:
      - "8080:80"
    environment:
      - BACKEND_URL=http://localhost:3000
    depends_on:
      - backend

  backend:
    image: ghcr.io/mtib/todos-backend:main
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
```

Then run:
```bash
docker compose up -d
```
The app will be available at [http://localhost:8080](http://localhost:8080).

## 🛠️ Development

### Prerequisites
- [Bun](https://bun.sh) (latest)

### Installation
```bash
bun install
```

### Running Locally
1. Start the backend:
```bash
bun server.ts
```
2. Start the frontend:
```bash
bun run dev
```

## ✨ Features
- **Hierarchical Tasks**: Infinite nesting of tasks.
- **Real-time Sync**: Uses WebSockets for instant updates across devices.
- **PWA**: Installable on mobile and desktop with offline support.
- **Dark Mode**: Automatic theme detection and manual toggle.
- **Search**: Advanced search with `@labels`, text, and task IDs (`T42`).
- **Markdown Descriptions**: Rich text support for task details.

## 🏗️ CI/CD
This repository uses GitHub Actions to:
- Verify builds on every Pull Request.
- Automatically build and push Docker images to GHCR on pushes to `main`.

---
Built with ❤️ by mtib
