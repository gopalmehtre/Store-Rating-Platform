# Roxiler Store Rating System

A fullstack web application for managing stores and user ratings, featuring role-based dashboards for Admin, User, and Owner. Built with Node.js, Express, PostgreSQL (backend), and React, Vite, Tailwind CSS (frontend).

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Frontend Overview](#frontend-overview)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)

---

## Features
- User authentication (JWT-based)
- Role-based access: Admin, User, Owner
- Store management and ratings
- Responsive dashboards for each role
- PostgreSQL database with Docker support
- Modern UI with React, Vite, and Tailwind CSS

---

## Architecture
- **Backend:** Node.js, Express, PostgreSQL
- **Frontend:** React, Vite, Tailwind CSS
- **Database:** PostgreSQL (with Docker Compose)
- **API:** RESTful endpoints for authentication, user, admin, and owner operations

---

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) (for easy DB setup)

---

## Setup & Installation

### 1. Clone the Repository
```sh
git clone <repo-url>
cd Roxiler system
```

### 2. Start PostgreSQL with Docker
```sh
docker-compose up -d
```
- This will start PostgreSQL and pgAdmin, and initialize the schema from `backend/src/config/init.sql`.
- pgAdmin: [http://localhost:5050](http://localhost:5050) (default: admin@store.com / admin123)

### 3. Configure Environment Variables
- Copy `.env.example` to `.env` in `backend/` and set DB credentials if needed.
- Default DB config matches Docker Compose setup.

### 4. Install Dependencies
#### Backend
```sh
cd backend
npm install
```
#### Frontend
```sh
cd ../frontend
npm install
```

---

## Running the Application

### 1. Start Backend
```sh
cd backend
npm start
```
- Runs on [http://localhost:5000](http://localhost:5000)

### 2. Start Frontend
```sh
cd frontend
npm run dev
```
- Runs on [http://localhost:3000](http://localhost:3000)
- Vite proxy is set up for API calls to backend

---

## Project Structure

```
Roxiler system/
│
├── backend/
│   ├── src/
│   │   ├── app.js           # Express app setup
│   │   ├── server.js        # Server entry, DB check
│   │   ├── config/
│   │   │   ├── db.js        # PostgreSQL connection
│   │   │   └── init.sql     # DB schema
│   │   ├── controllers/     # Route handlers (admin, auth, owner, user)
│   │   ├── middlewares/     # Auth & role middlewares
│   │   ├── routes/          # Express routers
│   │   └── utils/           # Hashing, validation
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Dashboard & auth pages
│   │   ├── services/        # API service (axios)
│   │   ├── App.jsx, main.jsx
│   │   └── index.css
│   ├── public/              # Static assets
│   └── package.json
│
├── docker-compose.yml       # DB & pgAdmin setup
└── Readme.md
```

---

## Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_rating_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:5000/api
```

---

## API Overview

- **Auth:** `/api/auth/register`, `/api/auth/login`
- **Admin:** `/api/admin/dashboard`, `/api/admin/users`, `/api/admin/stores`
- **User:** `/api/user/stores`, `/api/user/ratings`, `/api/user/password`
- **Owner:** `/api/owner/my-store/ratings`, `/api/owner/password`

All protected routes require JWT in `Authorization: Bearer <token>` header.

---

## Frontend Overview
- Built with React, Vite, Tailwind CSS
- Role-based dashboards: Admin, User, Owner
- AuthContext for global authentication state
- API service with axios and interceptors for auth
- Modern, responsive UI components

---

## Database Schema
- See `backend/src/config/init.sql` for full schema
- Main tables: `users`, `stores`, `ratings`
- Roles: `ADMIN`, `USER`, `OWNER`

---

## Troubleshooting
- Ensure Docker containers are running for DB
- Check `.env` files for correct config
- Use `docker-compose logs` for DB errors
- For frontend issues, check browser console and Vite logs

---

## Author
Gopal Mehtre.
-(This project is an assesment for Roxiler Systems).
