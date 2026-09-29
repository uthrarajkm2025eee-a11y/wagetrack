# WageTrack — Setup & Environment Guide

This guide walks through setting up and launching WageTrack on a developer workspace or production machine.

---

## Prerequisites

- **Java JDK:** 17 or higher
- **Maven:** 3.8+
- **Node.js:** v18+ and `npm` v9+
- **MySQL Database Server:** MySQL 8.0+

---

## 1. Database Initialization

Run MySQL Server and execute the database creation script:

```sql
CREATE DATABASE wagetrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Optionally, run `backend/src/main/resources/schema.sql` to inspect or manually execute schema definitions.

---

## 2. Backend Setup & Running

Navigate to `backend/`:

```bash
cd backend
```

### Environment Variables (Optional Configuration)

Set environment variables to customize database credentials if different from default (`root`/`root`):

- `DB_HOST`: Hostname (default: `localhost`)
- `DB_PORT`: MySQL Port (default: `3306`)
- `DB_NAME`: Database Name (default: `wagetrack`)
- `DB_USERNAME`: Database Username (default: `root`)
- `DB_PASSWORD`: Database Password (default: `root` or empty)

### Build & Run Tests

```bash
mvn clean test
```

### Start Spring Boot Application

```bash
mvn spring-boot:run
```

The Spring Boot backend will start at `http://localhost:8080`.

---

## 3. Frontend Setup & Running

Navigate to `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start at `http://localhost:5173`.
