package com.wagetrack.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklySummaryDTO {

    private Long workerId;
    private String workerName;
    private String workerCode;
    private LocalDate weekStart;
    private LocalDate weekEnd;
    private long totalWorkingDays;
    private long presentDays;
    private long halfDays;
    private long absentDays;
    private BigDecimal totalRegularPay;
    private BigDecimal totalOvertimeHours;
    private BigDecimal totalOvertimePay;
    private BigDecimal grossPayable;
    private BigDecimal amountPaid;
    private BigDecimal remainingPayable;
}
