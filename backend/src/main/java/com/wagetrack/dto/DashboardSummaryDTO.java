package com.wagetrack.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {

    private long totalWorkers;
    private long activeWorkers;
    private long activeWorksites;
    private long todaysAttendanceCount;
    private BigDecimal todaysPayableWages;
    private BigDecimal weeklyPayableAmount;
    private BigDecimal pendingPayments;
    private List<PaymentResponseDTO> recentPayments;
    private List<AttendanceResponseDTO> recentAttendance;
}
