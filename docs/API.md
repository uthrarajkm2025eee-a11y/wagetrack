# WageTrack — REST API Documentation

The WageTrack backend provides a comprehensive RESTful API for managing workers, worksites, daily attendance, weekly payroll summaries, and payment settlements.

Base URL: `http://localhost:8080/api`
Swagger OpenAPI UI: `http://localhost:8080/swagger-ui.html`

---

## 1. Workers API

### `POST /api/workers`
Registers a new daily wage worker.

**Request Body (`WorkerRequestDTO`):**
```json
{
  "workerCode": "WKR-001",
  "fullName": "Ravi Kumar",
  "phoneNumber": "9876543210",
  "address": "Sector 4, Site Camp",
  "standardDailyWage": 800.00,
  "standardWorkHours": 8.00,
  "active": true
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "workerCode": "WKR-001",
  "fullName": "Ravi Kumar",
  "phoneNumber": "9876543210",
  "address": "Sector 4, Site Camp",
  "standardDailyWage": 800.00,
  "standardWorkHours": 8.00,
  "active": true,
  "createdAt": "2026-09-28T10:00:00",
  "updatedAt": "2026-09-28T10:00:00"
}
```

### `GET /api/workers`
Returns a list of all registered workers.

### `GET /api/workers/{id}`
Returns details for a specific worker by ID.

### `PUT /api/workers/{id}`
Updates worker information.

### `DELETE /api/workers/{id}`
Deletes/deactivates a worker record.

---

## 2. Worksites API

### `POST /api/worksites`
Creates a new worksite location.

**Request Body (`WorksiteRequestDTO`):**
```json
{
  "worksiteCode": "SITE-A",
  "name": "Metro Extension Sector 12",
  "location": "NH-44 Highway Road",
  "description": "Bridge foundation work",
  "active": true
}
```

### `GET /api/worksites`
Returns all worksites along with `activeWorkersCount`.

### `GET /api/worksites/{id}`
Returns worksite details by ID.

### `PUT /api/worksites/{id}`
Updates a worksite location.

### `DELETE /api/worksites/{id}`
Deletes a worksite.

---

## 3. Attendance API

### `POST /api/attendance`
Records daily worker attendance and calculates regular wage & overtime.

**Request Body (`AttendanceRequestDTO`):**
```json
{
  "workerId": 1,
  "worksiteId": 1,
  "attendanceDate": "2026-09-28",
  "status": "PRESENT",
  "hoursWorked": 10.0,
  "notes": "Foundation excavation"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "workerId": 1,
  "workerCode": "WKR-001",
  "workerName": "Ravi Kumar",
  "standardDailyWage": 800.00,
  "worksiteId": 1,
  "worksiteCode": "SITE-A",
  "worksiteName": "Metro Extension Sector 12",
  "attendanceDate": "2026-09-28",
  "status": "PRESENT",
  "hoursWorked": 10.00,
  "overtimeHours": 2.00,
  "regularPay": 800.00,
  "overtimePay": 300.00,
  "totalPay": 1100.00,
  "notes": "Foundation excavation",
  "createdAt": "2026-09-28T10:15:00"
}
```

### `GET /api/attendance`
Query attendance logs with optional filter parameters:
- `startDate` (YYYY-MM-DD)
- `endDate` (YYYY-MM-DD)
- `workerId` (Long)
- `worksiteId` (Long)
- `status` (`PRESENT`, `HALF_DAY`, `ABSENT`)

---

## 4. Weekly Payroll API

### `GET /api/workers/{workerId}/weekly-summary`
Calculates weekly gross wages, overtime pay, amount paid, and remaining payable for a worker.

**Query Parameters:**
- `startDate` (e.g. `2026-09-21`)
- `endDate` (e.g. `2026-09-27`)

**Response (200 OK):**
```json
{
  "workerId": 1,
  "workerName": "Ravi Kumar",
  "workerCode": "WKR-001",
  "weekStart": "2026-09-21",
  "weekEnd": "2026-09-27",
  "totalWorkingDays": 7,
  "presentDays": 5,
  "halfDays": 1,
  "absentDays": 1,
  "totalRegularPay": 4400.00,
  "totalOvertimeHours": 4.00,
  "totalOvertimePay": 600.00,
  "grossPayable": 5000.00,
  "amountPaid": 3000.00,
  "remainingPayable": 2000.00
}
```

### `GET /api/weekly-summaries`
Returns weekly wage summaries for all active workers.

---

## 5. Payments API

### `POST /api/payments`
Records actual payment settlement for a worker.

**Request Body (`PaymentRequestDTO`):**
```json
{
  "workerId": 1,
  "paymentDate": "2026-09-28",
  "amount": 2000.00,
  "paymentMethod": "UPI",
  "referenceNumber": "UPI987654321",
  "weekStartDate": "2026-09-21",
  "weekEndDate": "2026-09-27",
  "notes": "Weekly wage settlement"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "workerId": 1,
  "workerCode": "WKR-001",
  "workerName": "Ravi Kumar",
  "paymentDate": "2026-09-28",
  "amount": 2000.00,
  "paymentMethod": "UPI",
  "referenceNumber": "UPI987654321",
  "weekStartDate": "2026-09-21",
  "weekEndDate": "2026-09-27",
  "notes": "Weekly wage settlement",
  "createdAt": "2026-09-28T10:30:00"
}
```

### `GET /api/payments`
Returns full payment settlement audit log.
