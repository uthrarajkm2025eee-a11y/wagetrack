package com.wagetrack.dto;

import com.wagetrack.entity.AttendanceStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceResponseDTO {

    private Long id;
    private Long workerId;
    private String workerCode;
    private String workerName;
    private BigDecimal standardDailyWage;
    private Long worksiteId;
    private String worksiteCode;
    private String worksiteName;
    private LocalDate attendanceDate;
    private AttendanceStatus status;
    private BigDecimal hoursWorked;
    private BigDecimal overtimeHours;
    private BigDecimal regularPay;
    private BigDecimal overtimePay;
    private BigDecimal totalPay;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
