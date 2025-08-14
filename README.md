# Skylit.ai

AI-powered web app for generating basic websites.

## Stack
- Frontend: React + TypeScript + Tailwind CSS (dark theme)
- Backend: Node.js + Express (TypeScript)
- Database: MySQL

## Theme
- Background: #121212
- Text: #E0E0E0
- Accents: Cyan #00FFFF, Purple #BB86FC

## API Routes
- POST /api/generate-site
- POST /api/save-project
- GET /api/get-projects

## Database Schema
Users: id, name, email, password_hash
Projects: id, user_id, prompt, generated_code, created_at, updated_at

See `backend/schema.sql` for definitions.

## Scripts
- npm run start (runs frontend + backend concurrently)
- npm run dev:frontend
- npm run dev:backend

## Setup
1. Install root deps: `npm install`
2. Install frontend deps: `cd frontend && npm install`
3. Install backend deps: `npm install express cors mysql2 @types/express @types/cors @types/node` (from project root)
4. Configure environment variables for MySQL.
5. Run `mysql < backend/schema.sql` to create tables.
6. Start dev: `npm start`.

## Placeholder Components
Navbar, Sidebar, Dashboard placeholder will be added in `frontend/src/components`.

## Notes
Structure ready for future AI integration.
