package com.wagetrack.service;

import com.wagetrack.dto.AttendanceResponseDTO;
import com.wagetrack.dto.DashboardSummaryDTO;
import com.wagetrack.dto.PaymentResponseDTO;
import com.wagetrack.entity.Attendance;
import com.wagetrack.entity.Worker;
import com.wagetrack.mapper.AttendanceMapper;
import com.wagetrack.mapper.PaymentMapper;
import com.wagetrack.repository.AttendanceRepository;
import com.wagetrack.repository.PaymentRecordRepository;
import com.wagetrack.repository.WorkerRepository;
import com.wagetrack.repository.WorksiteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final WorkerRepository workerRepository;
    private final WorksiteRepository worksiteRepository;
    private final AttendanceRepository attendanceRepository;
    private final PaymentRecordRepository paymentRecordRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getDashboardMetrics() {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        long totalWorkers = workerRepository.count();
        long activeWorkers = workerRepository.countByActive(true);
        long activeWorksites = worksiteRepository.countByActive(true);
        long todaysAttendanceCount = attendanceRepository.countByAttendanceDate(today);

        BigDecimal todaysPayableWages = attendanceRepository.sumTotalPayByAttendanceDate(today);
        if (todaysPayableWages == null) {
            todaysPayableWages = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal weeklyPayableAmount = attendanceRepository.sumTotalPayBetweenDates(weekStart, weekEnd);
        if (weeklyPayableAmount == null) {
            weeklyPayableAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        // Calculate pending payments across all active workers for the current week
        List<Worker> activeWorkerList = workerRepository.findByActive(true);
        BigDecimal totalGrossPayable = BigDecimal.ZERO;
        BigDecimal totalPaidForWeek = BigDecimal.ZERO;

        for (Worker worker : activeWorkerList) {
            BigDecimal workerGross = attendanceRepository.sumTotalPayByWorkerAndDateBetween(worker.getId(), weekStart, weekEnd);
            if (workerGross != null) {
                totalGrossPayable = totalGrossPayable.add(workerGross);
            }
            BigDecimal workerPaid = paymentRecordRepository.sumAmountByWorkerIdAndWeekRange(worker.getId(), weekStart, weekEnd);
            if (workerPaid != null) {
                totalPaidForWeek = totalPaidForWeek.add(workerPaid);
            }
        }

        BigDecimal pendingPayments = totalGrossPayable.subtract(totalPaidForWeek);
        if (pendingPayments.compareTo(BigDecimal.ZERO) < 0) {
            pendingPayments = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        List<PaymentResponseDTO> recentPayments = paymentRecordRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(PaymentMapper::toDTO)
                .collect(Collectors.toList());

        List<AttendanceResponseDTO> recentAttendance = attendanceRepository.findByAttendanceDate(today).stream()
                .map(AttendanceMapper::toDTO)
                .collect(Collectors.toList());

        return DashboardSummaryDTO.builder()
                .totalWorkers(totalWorkers)
                .activeWorkers(activeWorkers)
                .activeWorksites(activeWorksites)
                .todaysAttendanceCount(todaysAttendanceCount)
                .todaysPayableWages(todaysPayableWages)
                .weeklyPayableAmount(weeklyPayableAmount)
                .pendingPayments(pendingPayments)
                .recentPayments(recentPayments)
                .recentAttendance(recentAttendance)
                .build();
    }
}
