# WageTrack — Database Schema & Entity Design

WageTrack relies on a relational MySQL 8+ database schema designed with financial precision, strict transactional integrity, and proper indexing.

---

## Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    WORKERS ||--o{ ATTENDANCE : "has daily logs"
    WORKERS ||--o{ PAYMENT_RECORDS : "receives settlements"
    WORKSITES ||--o{ ATTENDANCE : "hosts daily work"

    WORKERS {
        bigint id PK
        string worker_code UK
        string full_name
        string phone_number
        string address
        decimal standard_daily_wage
        decimal standard_work_hours
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    WORKSITES {
        bigint id PK
        string worksite_code UK
        string name
        string location
        text description
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    ATTENDANCE {
        bigint id PK
        bigint worker_id FK
        bigint worksite_id FK
        date attendance_date
        string status
        decimal hours_worked
        decimal overtime_hours
        decimal regular_pay
        decimal overtime_pay
        decimal total_pay
        text notes
        timestamp created_at
        timestamp updated_at
    }

    PAYMENT_RECORDS {
        bigint id PK
        bigint worker_id FK
        date payment_date
        decimal amount
        string payment_method
        string reference_number
        date week_start_date
        date week_end_date
        text notes
        timestamp created_at
    }
```

---

## Schema Highlights

1. **Financial Precision (`DECIMAL(12, 2)`):**
   - All wage, pay, and payment amounts use `DECIMAL(12, 2)` instead of floating-point types (`FLOAT`/`DOUBLE`) to eliminate rounding inaccuracies.

2. **Unique Attendance Constraint (`uq_worker_worksite_date`):**
   - Prevents duplicate attendance logging for the same worker at the same worksite on the same calendar date.

3. **Performance Indexing:**
   - `workers`: Index on `worker_code`, `active`
   - `worksites`: Index on `worksite_code`, `active`
   - `attendance`: Index on `worker_id`, `worksite_id`, `attendance_date`
   - `payment_records`: Index on `worker_id`, `payment_date`
