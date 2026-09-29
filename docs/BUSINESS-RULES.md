# WageTrack — Business & Wage Calculation Rules

WageTrack guarantees rigorous business rule enforcement within the backend service layer (`AttendanceCalculationService`, `AttendanceService`, `PaymentService`, `PayrollService`).

---

## 1. Attendance & Wage Calculation Rules

### Standard Parameters
- `wagetrack.standard-workday-hours`: Default **8.0 hours**
- `wagetrack.overtime-multiplier`: Default **1.5x**

### Rule 1 — PRESENT
If attendance status is `PRESENT`:
- **Regular Pay:** Full daily wage ($ standardDailyWage $)
- **Hourly Rate:** $ \text{dailyWage} / \text{standardWorkHours} $
- **Overtime Hours:** $ \max(0, \text{hoursWorked} - \text{standardWorkdayHours}) $
- **Overtime Pay:** $ \text{hourlyRate} \times 1.5 \times \text{overtimeHours} $
- **Total Pay:** $ \text{regularPay} + \text{overtimePay} $

**Example:**
- Daily wage = ₹800, Standard work hours = 8h. Hourly rate = ₹100/hr.
- Worker works 10 hours (`PRESENT`).
- Regular Pay = ₹800.
- Overtime = 2 hours. Overtime Pay = $ 100 \times 1.5 \times 2 = ₹300 $.
- Total Pay = $ ₹800 + ₹300 = ₹1,100 $.

### Rule 2 — HALF DAY
If attendance status is `HALF_DAY`:
- **Regular Pay:** Exactly **50%** of daily wage ($ \text{dailyWage} \times 0.5 $)
- Client attempts to manually specify regular pay overrides are strictly rejected with HTTP 400 Bad Request.

### Rule 3 — ABSENT
If attendance status is `ABSENT`:
- **Regular Pay:** ₹0
- **Overtime Hours / Pay:** 0 hours, ₹0
- **Hours Worked:** Must be 0. Logging hours > 0 while absent is rejected.

---

## 2. Weekly Payroll & Payment Settlements

1. **Gross Payable Calculation:**
   Sum of all regular pay + overtime pay recorded for worker in the date range.

2. **Payment Deductions & Balance:**
   Sum of all `PaymentRecord` amounts logged for the worker in the selected period.
   $$\text{Remaining Payable} = \max(0, \text{Gross Payable} - \text{Amount Paid})$$

3. **Overpayment Prevention:**
   Payments exceeding the outstanding payable balance for the week are rejected by `PaymentService`.
