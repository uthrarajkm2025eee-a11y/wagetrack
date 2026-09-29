package com.wagetrack.service;

import com.wagetrack.config.AppProperties;
import com.wagetrack.entity.AttendanceStatus;
import com.wagetrack.entity.Worker;
import com.wagetrack.exception.InvalidBusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class AttendanceCalculationService {

    private final AppProperties appProperties;

    public CalculationResult calculateWages(Worker worker, AttendanceStatus status, BigDecimal hoursWorked, BigDecimal regularPayOverride) {
        if (worker == null) {
            throw new InvalidBusinessRuleException("Worker cannot be null for wage calculation.");
        }

        BigDecimal standardWorkday = appProperties.getStandardWorkdayHours();
        BigDecimal multiplier = appProperties.getOvertimeMultiplier();
        BigDecimal dailyWage = worker.getStandardDailyWage();
        BigDecimal standardHours = worker.getStandardWorkHours();

        if (dailyWage == null || dailyWage.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidBusinessRuleException("Worker standard daily wage must be positive.");
        }
        if (standardHours == null || standardHours.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidBusinessRuleException("Worker standard work hours must be positive.");
        }

        // Calculate hourly rate: dailyWage / standardHours
        BigDecimal hourlyWage = dailyWage.divide(standardHours, 4, RoundingMode.HALF_UP);

        BigDecimal regularPay;
        BigDecimal overtimeHours = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal overtimePay = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal actualHoursWorked = (hoursWorked != null ? hoursWorked : BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        if (actualHoursWorked.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidBusinessRuleException("Hours worked cannot be negative.");
        }

        switch (status) {
            case PRESENT:
                // Rule 1: Full daily wage
                regularPay = dailyWage.setScale(2, RoundingMode.HALF_UP);

                // Overtime calculation beyond standard workday hours
                if (actualHoursWorked.compareTo(standardWorkday) > 0) {
                    overtimeHours = actualHoursWorked.subtract(standardWorkday).setScale(2, RoundingMode.HALF_UP);
                    overtimePay = hourlyWage.multiply(multiplier).multiply(overtimeHours).setScale(2, RoundingMode.HALF_UP);
                }
                break;

            case HALF_DAY:
                // Rule 2: Exactly 50% of daily wage
                regularPay = dailyWage.multiply(new BigDecimal("0.5")).setScale(2, RoundingMode.HALF_UP);

                // Reject manual regularPay override attempts on HALF_DAY
                if (regularPayOverride != null && regularPayOverride.setScale(2, RoundingMode.HALF_UP).compareTo(regularPay) != 0) {
                    throw new InvalidBusinessRuleException("Half-day attendance automatically pays exactly 50% of the worker's standard daily wage.");
                }

                // Overtime calculation if hours worked beyond standard workday
                if (actualHoursWorked.compareTo(standardWorkday) > 0) {
                    overtimeHours = actualHoursWorked.subtract(standardWorkday).setScale(2, RoundingMode.HALF_UP);
                    overtimePay = hourlyWage.multiply(multiplier).multiply(overtimeHours).setScale(2, RoundingMode.HALF_UP);
                }
                break;

            case ABSENT:
                // Rule 3: ABSENT wage = 0, overtime = 0
                if (actualHoursWorked.compareTo(BigDecimal.ZERO) > 0) {
                    throw new InvalidBusinessRuleException("Worker cannot be marked absent with hours worked greater than zero.");
                }
                actualHoursWorked = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                regularPay = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                overtimeHours = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                overtimePay = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                break;

            default:
                throw new InvalidBusinessRuleException("Unknown attendance status: " + status);
        }

        BigDecimal totalPay = regularPay.add(overtimePay).setScale(2, RoundingMode.HALF_UP);

        return new CalculationResult(actualHoursWorked, overtimeHours, regularPay, overtimePay, totalPay);
    }

    public record CalculationResult(
            BigDecimal hoursWorked,
            BigDecimal overtimeHours,
            BigDecimal regularPay,
            BigDecimal overtimePay,
            BigDecimal totalPay
    ) {}
}
