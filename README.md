# WageTrack — Daily Wage Worker Attendance & Payment Tracking System

WageTrack is a daily wage worker attendance and payment tracking web application tailored for construction worksites, agricultural farms, rural contractors, and labour supervisors.

It replaces error-prone paper registers with an automated digital workflow: registering workers, assigning them to worksites, logging daily attendance, automatically calculating regular wages and 1.5x overtime pay, computing weekly payroll summaries, and recording actual payment settlements.

---

## Key Features

- **Worker Management:** Register labourers with worker codes, daily wage rates, standard hours, phone numbers, and active status tracking.
- **Worksite Management:** Track construction sites, farm plots, and active field locations with live active worker counts.
- **Daily Attendance Logger:** Fast daily attendance logging with real-time backend calculation previews for `PRESENT` (100%), `HALF_DAY` (50%), and `ABSENT` (₹0).
- **Automated Overtime Calculation:** Automatically calculates overtime hours worked beyond standard workday hours (default: 8 hours) at configurable 1.5x multiplier.
- **Weekly Payroll Summaries:** Computes gross wages, present/half/absent days, total overtime pay, payments made, and remaining payable balances.
- **Payment Settlements Ledger:** Records settlements (UPI, Cash, Bank Transfer) with transaction reference numbers and prevents overpayments.
- **Executive Dashboard:** Displays real-time aggregated workforce metrics, financial distribution bar charts, today's attendance logs, and recent payment activity.

---

## Technology Stack

- **Backend:** Java 17, Spring Boot 3.2.5, Spring Data JPA, Spring Validation, MySQL Driver, Lombok, Maven, Swagger OpenAPI 3.0.
- **Database:** MySQL 8+ relational database with foreign key constraints, unique indexes, and `DECIMAL(12, 2)` precision for financial fields. (H2 supported for fast unit tests).
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons, Recharts.

---

## Business Calculation Rules

Wage calculations are strictly executed inside `AttendanceCalculationService`:

| Status | Regular Pay Formula | Overtime Rule (> 8h) | Overtime Rate |
| :--- | :--- | :--- | :--- |
| **PRESENT** | $ \text{Daily Wage} $ | $ \text{HoursWorked} - 8 $ | $ \text{Hourly Wage} \times 1.5 \times \text{OvertimeHours} $ |
| **HALF_DAY** | $ \text{Daily Wage} \times 0.5 $ | $ \text{HoursWorked} - 8 $ | $ \text{Hourly Wage} \times 1.5 \times \text{OvertimeHours} $ |
| **ABSENT** | ₹0 | 0 hours | ₹0 |

---

## Project Structure

```
c:/wagee/
├── backend/
│   ├── src/
│   │   ├── main/java/com/wagetrack/
│   │   │   ├── config/             # CorsConfig, AppProperties
│   │   │   ├── controller/         # Worker, Worksite, Attendance, Payroll, Payment, Dashboard REST Controllers
│   │   │   ├── dto/                # Request & Response DTOs
│   │   │   ├── entity/             # Worker, Worksite, Attendance, PaymentRecord JPA Entities
│   │   │   ├── exception/          # GlobalExceptionHandler & custom exception classes
│   │   │   ├── mapper/             # Entity-DTO mapping helpers
│   │   │   ├── repository/         # Spring Data JPA repositories
│   │   │   ├── service/            # Core business & calculation services
│   │   │   └── WageTrackApplication.java
│   │   └── main/resources/
│   │       ├── application.properties
│   │       └── schema.sql          # Full MySQL DDL DDL script
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Header, Sidebar, Modal, ConfirmDialog
│   │   ├── layouts/                # Main Layout wrapper
│   │   ├── pages/                  # Dashboard, Workers, WorkerDetails, Worksites, DailyAttendance, AttendanceRegister, WeeklyPayroll, Payments
│   │   ├── services/               # Axios API client & modular service modules
│   │   ├── types/                  # Strict TypeScript interfaces
│   │   └── router/                 # React Router v6 configuration
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                           # Documentation guides
│   ├── API.md                      # REST Endpoints API documentation
│   ├── DATABASE.md                 # Database schema & ER diagram
│   ├── SETUP.md                    # Setup & installation guide
│   └── BUSINESS-RULES.md           # Business rule equations
└── README.md
```

---

## Quick Start Guide

### 1. Database Setup
Create MySQL Database:
```sql
CREATE DATABASE wagetrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Start Backend Service
```bash
cd backend
mvn clean test
mvn spring-boot:run
```
Backend API runs at: `http://localhost:8080/api`  
Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Start Frontend App
```bash
cd frontend
npm install
npm run dev
```
Frontend App runs at: `http://localhost:5173`

---

## License & Author
Built for **WageTrack Workforce Management**. Designed and implemented with clean architecture, strict validation, and high performance.
