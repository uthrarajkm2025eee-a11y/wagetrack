package com.wagetrack.service;

import com.wagetrack.config.AppProperties;
import com.wagetrack.entity.AttendanceStatus;
import com.wagetrack.entity.Worker;
import com.wagetrack.exception.InvalidBusinessRuleException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class AttendanceCalculationServiceTest {

    private AttendanceCalculationService calculationService;
    private Worker sampleWorker;

    @BeforeEach
    void setUp() {
        AppProperties appProperties = new AppProperties();
        appProperties.setStandardWorkdayHours(new BigDecimal("8.0"));
        appProperties.setOvertimeMultiplier(new BigDecimal("1.5"));

        calculationService = new AttendanceCalculationService(appProperties);

        sampleWorker = Worker.builder()
                .id(1L)
                .workerCode("WKR-001")
                .fullName("Ravi Kumar")
                .standardDailyWage(new BigDecimal("800.00"))
                .standardWorkHours(new BigDecimal("8.00"))
                .active(true)
                .build();
    }

    @Test
    @DisplayName("PRESENT: Should calculate full daily wage with zero overtime for 8 hours")
    void testPresentStatusStandardHours() {
        var result = calculationService.calculateWages(sampleWorker, AttendanceStatus.PRESENT, new BigDecimal("8.0"), null);

        assertEquals(new BigDecimal("800.00"), result.regularPay());
        assertEquals(new BigDecimal("0.00"), result.overtimeHours());
        assertEquals(new BigDecimal("0.00"), result.overtimePay());
        assertEquals(new BigDecimal("800.00"), result.totalPay());
    }

    @Test
    @DisplayName("PRESENT + Overtime: 10 hours should yield 2h overtime @ 1.5x (₹300 overtime, ₹1100 total)")
    void testPresentStatusWithOvertime() {
        var result = calculationService.calculateWages(sampleWorker, AttendanceStatus.PRESENT, new BigDecimal("10.0"), null);

        assertEquals(new BigDecimal("800.00"), result.regularPay());
        assertEquals(new BigDecimal("2.00"), result.overtimeHours());
        assertEquals(new BigDecimal("300.00"), result.overtimePay()); // (800/8) * 1.5 * 2 = 100 * 1.5 * 2 = 300
        assertEquals(new BigDecimal("1100.00"), result.totalPay());
    }

    @Test
    @DisplayName("HALF_DAY: Must strictly pay exactly 50% of daily wage (₹400)")
    void testHalfDayStatus() {
        var result = calculationService.calculateWages(sampleWorker, AttendanceStatus.HALF_DAY, new BigDecimal("4.0"), null);

        assertEquals(new BigDecimal("400.00"), result.regularPay());
        assertEquals(new BigDecimal("0.00"), result.overtimeHours());
        assertEquals(new BigDecimal("0.00"), result.overtimePay());
        assertEquals(new BigDecimal("400.00"), result.totalPay());
    }

    @Test
    @DisplayName("HALF_DAY Override Rejection: Attempting to supply custom regular pay must throw Exception")
    void testHalfDayManualOverrideRejection() {
        BigDecimal invalidOverride = new BigDecimal("500.00");
        assertThrows(InvalidBusinessRuleException.class, () ->
                calculationService.calculateWages(sampleWorker, AttendanceStatus.HALF_DAY, new BigDecimal("4.0"), invalidOverride)
        );
    }

    @Test
    @DisplayName("ABSENT: Must set regular pay, overtime, and total pay to 0")
    void testAbsentStatus() {
        var result = calculationService.calculateWages(sampleWorker, AttendanceStatus.ABSENT, new BigDecimal("0.0"), null);

        assertEquals(new BigDecimal("0.00"), result.regularPay());
        assertEquals(new BigDecimal("0.00"), result.overtimeHours());
        assertEquals(new BigDecimal("0.00"), result.overtimePay());
        assertEquals(new BigDecimal("0.00"), result.totalPay());
    }

    @Test
    @DisplayName("ABSENT Rejection: Marking absent with hours > 0 must throw Exception")
    void testAbsentWithPositiveHoursRejection() {
        assertThrows(InvalidBusinessRuleException.class, () ->
                calculationService.calculateWages(sampleWorker, AttendanceStatus.ABSENT, new BigDecimal("5.0"), null)
        );
    }

    @Test
    @DisplayName("Negative Hours Rejection: Negative hours worked must throw Exception")
    void testNegativeHoursRejection() {
        assertThrows(InvalidBusinessRuleException.class, () ->
                calculationService.calculateWages(sampleWorker, AttendanceStatus.PRESENT, new BigDecimal("-2.0"), null)
        );
    }
}
