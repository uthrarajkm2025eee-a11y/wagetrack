-- WageTrack MySQL Database Schema Definition

CREATE DATABASE IF NOT EXISTS wagetrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wagetrack;

-- Table: workers
CREATE TABLE IF NOT EXISTS workers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    worker_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    address VARCHAR(255),
    standard_daily_wage DECIMAL(12, 2) NOT NULL,
    standard_work_hours DECIMAL(4, 2) NOT NULL DEFAULT 8.00,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_worker_code (worker_code),
    INDEX idx_worker_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: worksites
CREATE TABLE IF NOT EXISTS worksites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    worksite_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_worksite_code (worksite_code),
    INDEX idx_worksite_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: attendance
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    worker_id BIGINT NOT NULL,
    worksite_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    hours_worked DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
    overtime_hours DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
    regular_pay DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    overtime_pay DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_pay DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_worker FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_worksite FOREIGN KEY (worksite_id) REFERENCES worksites(id) ON DELETE CASCADE,
    CONSTRAINT uq_worker_worksite_date UNIQUE (worker_id, worksite_id, attendance_date),
    INDEX idx_attendance_worker_id (worker_id),
    INDEX idx_attendance_worksite_id (worksite_id),
    INDEX idx_attendance_date (attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: payment_records
CREATE TABLE IF NOT EXISTS payment_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    worker_id BIGINT NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    reference_number VARCHAR(100),
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_worker FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    INDEX idx_payment_worker_id (worker_id),
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
