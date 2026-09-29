package com.wagetrack.dto;

import com.wagetrack.entity.PaymentMethod;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDTO {

    private Long id;
    private Long workerId;
    private String workerCode;
    private String workerName;
    private LocalDate paymentDate;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private String referenceNumber;
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private String notes;
    private LocalDateTime createdAt;
}
