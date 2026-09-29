package com.wagetrack.mapper;

import com.wagetrack.dto.AttendanceResponseDTO;
import com.wagetrack.entity.Attendance;

public class AttendanceMapper {

    public static AttendanceResponseDTO toDTO(Attendance entity) {
        if (entity == null) return null;
        return AttendanceResponseDTO.builder()
                .id(entity.getId())
                .workerId(entity.getWorker() != null ? entity.getWorker().getId() : null)
                .workerCode(entity.getWorker() != null ? entity.getWorker().getWorkerCode() : null)
                .workerName(entity.getWorker() != null ? entity.getWorker().getFullName() : null)
                .standardDailyWage(entity.getWorker() != null ? entity.getWorker().getStandardDailyWage() : null)
                .worksiteId(entity.getWorksite() != null ? entity.getWorksite().getId() : null)
                .worksiteCode(entity.getWorksite() != null ? entity.getWorksite().getWorksiteCode() : null)
                .worksiteName(entity.getWorksite() != null ? entity.getWorksite().getName() : null)
                .attendanceDate(entity.getAttendanceDate())
                .status(entity.getStatus())
                .hoursWorked(entity.getHoursWorked())
                .overtimeHours(entity.getOvertimeHours())
                .regularPay(entity.getRegularPay())
                .overtimePay(entity.getOvertimePay())
                .totalPay(entity.getTotalPay())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
