package com.wagetrack.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerRequestDTO {

    @NotBlank(message = "Worker code is required")
    @Size(max = 50, message = "Worker code must be under 50 characters")
    private String workerCode;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must be under 100 characters")
    private String fullName;

    @Size(max = 20, message = "Phone number must be under 20 characters")
    private String phoneNumber;

    @Size(max = 255, message = "Address must be under 255 characters")
    private String address;

    @NotNull(message = "Standard daily wage is required")
    @Positive(message = "Standard daily wage must be positive")
    private BigDecimal standardDailyWage;

    @NotNull(message = "Standard work hours is required")
    @Positive(message = "Standard work hours must be positive")
    private BigDecimal standardWorkHours;

    private Boolean active;
}
