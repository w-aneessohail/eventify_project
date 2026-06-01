# Eventify

Event management platform with three roles: **Attendee**, **Organizer**, and **Admin**.

- **Attendees** browse events, book tickets, and pay online.
- **Organizers** post events and manage bookings/reviews.
- **Admins** oversee the system (dashboard features are still being expanded).

## Repository structure

```
eventify_project/
├── backend/    # Express + TypeORM + PostgreSQL
└── frontend/   # React + Vite
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

## Environment variables

Copy the example files and fill in your values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

| Variable | Location | Description |
|----------|----------|-------------|
| `PORT` | backend | API port (default `5002`) |
| `DB_*` | backend | PostgreSQL connection |
| `JWT_SECRET` | backend | Secret for access/refresh tokens |
| `SALT_ROUNDS` | backend | bcrypt salt rounds |
| `MAIL_*` | backend | SMTP for OTP emails |
| `VITE_API_BASE_URL` | frontend | e.g. `http://localhost:5002/api` |

**Do not commit `backend/.env`.** If it was ever pushed to a public remote, rotate DB passwords, JWT secret, and mail credentials.

## Database setup

1. Create a PostgreSQL database, e.g. `eventify_db`.
2. Set `DB_NAME`, `DB_USER`, `DB_PASSWORD` in `backend/.env`.
3. On first run, TypeORM `synchronize: true` creates tables from entities (dev only).

## Run backend

```bash
cd backend
npm install
npm run dev
```

API: **http://localhost:5002**  
Routes are under **http://localhost:5002/api**  
Uploaded images: **http://localhost:5002/image/...**

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

App: **http://localhost:5173**

## Common local URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Login | http://localhost:5173/login |
| Attendee home | http://localhost:5173/attendee |
| Organizer dashboard | http://localhost:5173/organizer/dashboard |
| Admin dashboard | http://localhost:5173/admin/dashboard |
| API health (example) | http://localhost:5002/api/categories |

## CORS

Backend allows `http://localhost:5173` with credentials (cookies). Change `origin` in `backend/src/index.ts` if you use another frontend port.
