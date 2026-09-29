package com.wagetrack.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerResponseDTO {

    private Long id;
    private String workerCode;
    private String fullName;
    private String phoneNumber;
    private String address;
    private BigDecimal standardDailyWage;
    private BigDecimal standardWorkHours;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
