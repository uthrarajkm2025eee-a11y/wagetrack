package com.wagetrack.service;

import com.wagetrack.dto.WeeklySummaryDTO;
import com.wagetrack.entity.Attendance;
import com.wagetrack.entity.AttendanceStatus;
import com.wagetrack.entity.Worker;
import com.wagetrack.exception.InvalidBusinessRuleException;
import com.wagetrack.exception.ResourceNotFoundException;
import com.wagetrack.repository.AttendanceRepository;
import com.wagetrack.repository.PaymentRecordRepository;
import com.wagetrack.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayrollService {

    private final WorkerRepository workerRepository;
    private final AttendanceRepository attendanceRepository;
    private final PaymentRecordRepository paymentRecordRepository;

    @Transactional(readOnly = true)
    public WeeklySummaryDTO getWeeklySummary(Long workerId, LocalDate startDate, LocalDate endDate) {
        log.info("Calculating weekly summary for workerId: {} between {} and {}", workerId, startDate, endDate);
        
        if (startDate == null || endDate == null) {
            throw new InvalidBusinessRuleException("Start date and end date are required for weekly summary.");
        }
        if (endDate.isBefore(startDate)) {
            throw new InvalidBusinessRuleException("End date cannot be before start date.");
        }

        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + workerId));

        List<Attendance> attendances = attendanceRepository.findByWorkerIdAndAttendanceDateBetween(workerId, startDate, endDate);

        long presentDays = attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long halfDays = attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.HALF_DAY).count();
        long absentDays = attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        long totalWorkingDays = attendances.size();

        BigDecimal totalRegularPay = attendances.stream()
                .map(Attendance::getRegularPay)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalOvertimeHours = attendances.stream()
                .map(Attendance::getOvertimeHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalOvertimePay = attendances.stream()
                .map(Attendance::getOvertimePay)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal grossPayable = totalRegularPay.add(totalOvertimePay).setScale(2, RoundingMode.HALF_UP);

        // Calculate total payments made for this worker matching the week range
        BigDecimal amountPaid = paymentRecordRepository.sumAmountByWorkerIdAndWeekRange(workerId, startDate, endDate);
        if (amountPaid == null) {
            amountPaid = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal remainingPayable = grossPayable.subtract(amountPaid);
        if (remainingPayable.compareTo(BigDecimal.ZERO) < 0) {
            remainingPayable = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        return WeeklySummaryDTO.builder()
                .workerId(worker.getId())
                .workerName(worker.getFullName())
                .workerCode(worker.getWorkerCode())
                .weekStart(startDate)
                .weekEnd(endDate)
                .totalWorkingDays(totalWorkingDays)
                .presentDays(presentDays)
                .halfDays(halfDays)
                .absentDays(absentDays)
                .totalRegularPay(totalRegularPay)
                .totalOvertimeHours(totalOvertimeHours)
                .totalOvertimePay(totalOvertimePay)
                .grossPayable(grossPayable)
                .amountPaid(amountPaid)
                .remainingPayable(remainingPayable)
                .build();
    }

    @Transactional(readOnly = true)
    public List<WeeklySummaryDTO> getAllWeeklySummaries(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching weekly summaries for all active workers between {} and {}", startDate, endDate);
        List<Worker> activeWorkers = workerRepository.findByActive(true);
        List<WeeklySummaryDTO> summaries = new ArrayList<>();

        for (Worker worker : activeWorkers) {
            summaries.add(getWeeklySummary(worker.getId(), startDate, endDate));
        }

        return summaries;
    }
}
