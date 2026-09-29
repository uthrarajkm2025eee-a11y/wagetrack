package com.wagetrack.dto;

import com.wagetrack.entity.AttendanceStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRequestDTO {

    @NotNull(message = "Worker ID is required")
    private Long workerId;

    @NotNull(message = "Worksite ID is required")
    private Long worksiteId;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    @NotNull(message = "Attendance status is required")
    private AttendanceStatus status;

    @Min(value = 0, message = "Hours worked cannot be negative")
    private BigDecimal hoursWorked;

    private BigDecimal regularPayOverride; // Used for validation check against client manual overrides

    private String notes;
}
