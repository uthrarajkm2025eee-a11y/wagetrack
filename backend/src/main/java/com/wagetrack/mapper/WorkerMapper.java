package com.wagetrack.mapper;

import com.wagetrack.dto.WorkerRequestDTO;
import com.wagetrack.dto.WorkerResponseDTO;
import com.wagetrack.entity.Worker;

import java.math.BigDecimal;

public class WorkerMapper {

    public static Worker toEntity(WorkerRequestDTO dto) {
        if (dto == null) return null;
        return Worker.builder()
                .workerCode(dto.getWorkerCode())
                .fullName(dto.getFullName())
                .phoneNumber(dto.getPhoneNumber())
                .address(dto.getAddress())
                .standardDailyWage(dto.getStandardDailyWage())
                .standardWorkHours(dto.getStandardWorkHours() != null ? dto.getStandardWorkHours() : new BigDecimal("8.00"))
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
    }

    public static WorkerResponseDTO toDTO(Worker entity) {
        if (entity == null) return null;
        return WorkerResponseDTO.builder()
                .id(entity.getId())
                .workerCode(entity.getWorkerCode())
                .fullName(entity.getFullName())
                .phoneNumber(entity.getPhoneNumber())
                .address(entity.getAddress())
                .standardDailyWage(entity.getStandardDailyWage())
                .standardWorkHours(entity.getStandardWorkHours())
                .active(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static void updateEntityFromDTO(WorkerRequestDTO dto, Worker entity) {
        if (dto == null || entity == null) return;
        entity.setWorkerCode(dto.getWorkerCode());
        entity.setFullName(dto.getFullName());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setAddress(dto.getAddress());
        entity.setStandardDailyWage(dto.getStandardDailyWage());
        if (dto.getStandardWorkHours() != null) {
            entity.setStandardWorkHours(dto.getStandardWorkHours());
        }
        if (dto.getActive() != null) {
            entity.setActive(dto.getActive());
        }
    }
}
