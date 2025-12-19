# SkyLit AI – Setup

Minimal steps to run the code locally.

## Prerequisites
- Node.js 18+
- npm
- Supabase (or PostgreSQL) credentials

## Clone
```bash
git clone https://github.com/GjergjBrestovci/Skylit.git
cd Skylit
```

## Backend setup
```bash
cd backend
npm install
cp .env.example .env
# fill SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, JWT secrets, Stripe keys (optional)
npm run db:migrate
npm run db:seed
npm run dev  # starts API on :5000
```

## Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env
# set VITE_API_URL=http://localhost:5000/api
npm run dev  # starts app on :5173
```

## Scripts
- Backend: `npm run dev`, `npm test`
- Frontend: `npm run dev`, `npm test`, `npm run build`

## Troubleshooting
- Port 5000 or 5173 in use → stop other processes or change ports in configs
- Missing env vars → verify `.env` matches the samples
