package com.wagetrack.service;

import com.wagetrack.dto.AttendanceRequestDTO;
import com.wagetrack.dto.AttendanceResponseDTO;
import com.wagetrack.entity.Attendance;
import com.wagetrack.entity.AttendanceStatus;
import com.wagetrack.entity.Worker;
import com.wagetrack.entity.Worksite;
import com.wagetrack.exception.DuplicateResourceException;
import com.wagetrack.exception.InvalidBusinessRuleException;
import com.wagetrack.exception.ResourceNotFoundException;
import com.wagetrack.mapper.AttendanceMapper;
import com.wagetrack.repository.AttendanceRepository;
import com.wagetrack.repository.WorkerRepository;
import com.wagetrack.repository.WorksiteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final WorkerRepository workerRepository;
    private final WorksiteRepository worksiteRepository;
    private final AttendanceCalculationService calculationService;

    @Transactional
    public AttendanceResponseDTO recordAttendance(AttendanceRequestDTO dto) {
        log.info("Recording attendance for workerId: {}, worksiteId: {}, date: {}", dto.getWorkerId(), dto.getWorksiteId(), dto.getAttendanceDate());

        Worker worker = workerRepository.findById(dto.getWorkerId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + dto.getWorkerId()));

        if (!worker.isActive()) {
            throw new InvalidBusinessRuleException("Cannot record attendance for an inactive worker.");
        }

        Worksite worksite = worksiteRepository.findById(dto.getWorksiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Worksite not found with ID: " + dto.getWorksiteId()));

        if (!worksite.isActive()) {
            throw new InvalidBusinessRuleException("Cannot record attendance for an inactive worksite.");
        }

        if (attendanceRepository.existsByWorkerIdAndWorksiteIdAndAttendanceDate(dto.getWorkerId(), dto.getWorksiteId(), dto.getAttendanceDate())) {
            throw new DuplicateResourceException("Attendance record already exists for worker " + worker.getWorkerCode() + " on date " + dto.getAttendanceDate() + " at worksite " + worksite.getWorksiteCode());
        }

        // Calculation of wages and overtime via backend Service component
        AttendanceCalculationService.CalculationResult calc = calculationService.calculateWages(
                worker,
                dto.getStatus(),
                dto.getHoursWorked(),
                dto.getRegularPayOverride()
        );

        Attendance attendance = Attendance.builder()
                .worker(worker)
                .worksite(worksite)
                .attendanceDate(dto.getAttendanceDate())
                .status(dto.getStatus())
                .hoursWorked(calc.hoursWorked())
                .overtimeHours(calc.overtimeHours())
                .regularPay(calc.regularPay())
                .overtimePay(calc.overtimePay())
                .totalPay(calc.totalPay())
                .notes(dto.getNotes())
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        log.info("Attendance saved successfully with ID: {}, Total Pay: ₹{}", saved.getId(), saved.getTotalPay());
        return AttendanceMapper.toDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getAttendanceRecords(LocalDate startDate, LocalDate endDate, Long workerId, Long worksiteId, AttendanceStatus status) {
        List<Attendance> records;

        if (workerId != null && startDate != null && endDate != null) {
            records = attendanceRepository.findByWorkerIdAndAttendanceDateBetween(workerId, startDate, endDate);
        } else if (startDate != null && endDate != null) {
            records = attendanceRepository.findByAttendanceDateBetween(startDate, endDate);
        } else if (workerId != null) {
            records = attendanceRepository.findByWorkerId(workerId);
        } else if (worksiteId != null) {
            records = attendanceRepository.findByWorksiteId(worksiteId);
        } else {
            records = attendanceRepository.findAll();
        }

        return records.stream()
                .filter(a -> worksiteId == null || a.getWorksite().getId().equals(worksiteId))
                .filter(a -> status == null || a.getStatus() == status)
                .map(AttendanceMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AttendanceResponseDTO getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with ID: " + id));
        return AttendanceMapper.toDTO(attendance);
    }

    @Transactional
    public AttendanceResponseDTO updateAttendance(Long id, AttendanceRequestDTO dto) {
        log.info("Updating attendance ID: {}", id);
        Attendance existing = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with ID: " + id));

        Worker worker = workerRepository.findById(dto.getWorkerId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + dto.getWorkerId()));

        Worksite worksite = worksiteRepository.findById(dto.getWorksiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Worksite not found with ID: " + dto.getWorksiteId()));

        if (attendanceRepository.existsByWorkerIdAndWorksiteIdAndAttendanceDateAndIdNot(dto.getWorkerId(), dto.getWorksiteId(), dto.getAttendanceDate(), id)) {
            throw new DuplicateResourceException("Duplicate attendance record for worker " + worker.getWorkerCode() + " on " + dto.getAttendanceDate() + " at worksite " + worksite.getWorksiteCode());
        }

        AttendanceCalculationService.CalculationResult calc = calculationService.calculateWages(
                worker,
                dto.getStatus(),
                dto.getHoursWorked(),
                dto.getRegularPayOverride()
        );

        existing.setWorker(worker);
        existing.setWorksite(worksite);
        existing.setAttendanceDate(dto.getAttendanceDate());
        existing.setStatus(dto.getStatus());
        existing.setHoursWorked(calc.hoursWorked());
        existing.setOvertimeHours(calc.overtimeHours());
        existing.setRegularPay(calc.regularPay());
        existing.setOvertimePay(calc.overtimePay());
        existing.setTotalPay(calc.totalPay());
        existing.setNotes(dto.getNotes());

        Attendance updated = attendanceRepository.save(existing);
        log.info("Attendance updated successfully: {}", updated.getId());
        return AttendanceMapper.toDTO(updated);
    }

    @Transactional
    public void deleteAttendance(Long id) {
        log.info("Deleting attendance record ID: {}", id);
        Attendance existing = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with ID: " + id));
        attendanceRepository.delete(existing);
        log.info("Attendance record deleted: {}", id);
    }
}
