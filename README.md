# Skylit.ai

Skylit.ai is an AI-powered web app that turns your ideas into functional, modern, responsive websites. Provide a prompt describing your desired site (e.g., landing page, portfolio, blog, SaaS), and the platform (future feature) will generate starter code you can iterate on.

## Stack
- Frontend: React + TypeScript + Tailwind CSS (dark theme)
- Backend: Node.js + Express (TypeScript)
- Database: MySQL

## Theme
- Background: `#121212`
- Text: `#E0E0E0`
- Accents: Cyan `#00FFFF`, Purple `#BB86FC`

## Current Status
Scaffolded project with placeholder API endpoints and UI components (Navbar, Sidebar, Dashboard). AI generation logic not yet implemented.

## API Routes (placeholders)
- `POST /api/generate-site` – future AI generation
- `POST /api/save-project` – save generated project metadata
- `GET /api/get-projects` – list saved projects

## Database Schema
Tables (see `backend/schema.sql`):
- `users`: id, name, email, password_hash
- `projects`: id, user_id, prompt, generated_code, created_at, updated_at

## Scripts
- `npm run start` – run frontend & backend concurrently
- `npm run dev` – alias for the same concurrent start
- `npm run dev:frontend` – frontend only (Vite dev server)
- `npm run dev:backend` – backend only (Express via ts-node-dev)
- Backend standalone (inside `backend`): `npm run dev`

## Setup
1. Install dependencies: `npm install`
2. (If needed) Install backend-only deps: `cd backend && npm install`
3. Create `.env` in project root (optional for now):
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=skylit_ai
```
4. Create database & tables: `mysql < backend/schema.sql`
5. Start development: `npm run dev`
6. Open frontend at printed Vite dev URL (e.g., http://localhost:5173) and backend at http://localhost:5000

## Directory Structure (simplified)
```
frontend/
  src/components/ (Navbar, Sidebar, Dashboard)
backend/
  controllers/
  routes/
  db.ts
  server.ts
backend/schema.sql
```

## Future Roadmap
- AI generation service (`services/ai` layer)
- Auth (JWT / sessions)
- Project export & deployment integrations
- User dashboard with history & editing tools

## Notes
This codebase is prepared for iterative AI feature integration while maintaining strict TypeScript typing across layers.
