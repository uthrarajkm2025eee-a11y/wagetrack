package com.wagetrack.mapper;

import com.wagetrack.dto.PaymentResponseDTO;
import com.wagetrack.entity.PaymentRecord;

public class PaymentMapper {

    public static PaymentResponseDTO toDTO(PaymentRecord entity) {
        if (entity == null) return null;
        return PaymentResponseDTO.builder()
                .id(entity.getId())
                .workerId(entity.getWorker() != null ? entity.getWorker().getId() : null)
                .workerCode(entity.getWorker() != null ? entity.getWorker().getWorkerCode() : null)
                .workerName(entity.getWorker() != null ? entity.getWorker().getFullName() : null)
                .paymentDate(entity.getPaymentDate())
                .amount(entity.getAmount())
                .paymentMethod(entity.getPaymentMethod())
                .referenceNumber(entity.getReferenceNumber())
                .weekStartDate(entity.getWeekStartDate())
                .weekEndDate(entity.getWeekEndDate())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
