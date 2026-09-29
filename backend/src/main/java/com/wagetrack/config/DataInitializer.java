package com.wagetrack.config;

import com.wagetrack.entity.*;
import com.wagetrack.repository.*;
import com.wagetrack.service.AttendanceCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final WorkerRepository workerRepository;
    private final WorksiteRepository worksiteRepository;
    private final AttendanceRepository attendanceRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final AttendanceCalculationService calculationService;
    private final AppProperties appProperties;

    @Override
    public void run(String... args) {
        if (!appProperties.isSeedData() || workerRepository.count() > 0) {
            log.info("Skipping sample data seeding (database already initialized or seed-data disabled).");
            return;
        }

        log.info("Seeding initial WageTrack demonstration data...");

        // 1. Create Worksites
        Worksite site1 = worksiteRepository.save(Worksite.builder()
                .worksiteCode("SITE-101")
                .name("Metro Extension Sector 12")
                .location("NH-44 Highway Corridor")
                .description("Elevated metro pillar foundation and concrete reinforcement")
                .active(true)
                .build());

        Worksite site2 = worksiteRepository.save(Worksite.builder()
                .worksiteCode("SITE-102")
                .name("GreenValley Solar Farm")
                .location("Rural Agricultural Block B")
                .description("Solar panel mounting structure and land trenching")
                .active(true)
                .build());

        // 2. Create Workers
        Worker worker1 = workerRepository.save(Worker.builder()
                .workerCode("WKR-001")
                .fullName("Ravi Kumar")
                .phoneNumber("9876543210")
                .address("Sector 4 Labour Camp, Block 12")
                .standardDailyWage(new BigDecimal("800.00"))
                .standardWorkHours(new BigDecimal("8.00"))
                .active(true)
                .build());

        Worker worker2 = workerRepository.save(Worker.builder()
                .workerCode("WKR-002")
                .fullName("Suresh Sharma")
                .phoneNumber("9876543211")
                .address("Village Rampur, Post Box 4")
                .standardDailyWage(new BigDecimal("750.00"))
                .standardWorkHours(new BigDecimal("8.00"))
                .active(true)
                .build());

        Worker worker3 = workerRepository.save(Worker.builder()
                .workerCode("WKR-003")
                .fullName("Anil Verma")
                .phoneNumber("9876543212")
                .address("Labour Colony Gate 2")
                .standardDailyWage(new BigDecimal("900.00"))
                .standardWorkHours(new BigDecimal("8.00"))
                .active(true)
                .build());

        // 3. Seed Attendance Records for current week
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate twoDaysAgo = today.minusDays(2);

        // Worker 1 (Ravi) - 10h PRESENT yesterday (2h OT)
        var calc1 = calculationService.calculateWages(worker1, AttendanceStatus.PRESENT, new BigDecimal("10.0"), null);
        attendanceRepository.save(Attendance.builder()
                .worker(worker1)
                .worksite(site1)
                .attendanceDate(yesterday)
                .status(AttendanceStatus.PRESENT)
                .hoursWorked(calc1.hoursWorked())
                .overtimeHours(calc1.overtimeHours())
                .regularPay(calc1.regularPay())
                .overtimePay(calc1.overtimePay())
                .totalPay(calc1.totalPay())
                .notes("Pillar foundation shuttering")
                .build());

        // Worker 1 (Ravi) - HALF_DAY today
        var calc1Today = calculationService.calculateWages(worker1, AttendanceStatus.HALF_DAY, new BigDecimal("4.0"), null);
        attendanceRepository.save(Attendance.builder()
                .worker(worker1)
                .worksite(site1)
                .attendanceDate(today)
                .status(AttendanceStatus.HALF_DAY)
                .hoursWorked(calc1Today.hoursWorked())
                .overtimeHours(calc1Today.overtimeHours())
                .regularPay(calc1Today.regularPay())
                .overtimePay(calc1Today.overtimePay())
                .totalPay(calc1Today.totalPay())
                .notes("Half-day site inspection")
                .build());

        // Worker 2 (Suresh) - 8h PRESENT today
        var calc2 = calculationService.calculateWages(worker2, AttendanceStatus.PRESENT, new BigDecimal("8.0"), null);
        attendanceRepository.save(Attendance.builder()
                .worker(worker2)
                .worksite(site2)
                .attendanceDate(today)
                .status(AttendanceStatus.PRESENT)
                .hoursWorked(calc2.hoursWorked())
                .overtimeHours(calc2.overtimeHours())
                .regularPay(calc2.regularPay())
                .overtimePay(calc2.overtimePay())
                .totalPay(calc2.totalPay())
                .notes("Solar trench digging")
                .build());

        // 4. Seed Payment Record
        paymentRecordRepository.save(PaymentRecord.builder()
                .worker(worker1)
                .paymentDate(today)
                .amount(new BigDecimal("1000.00"))
                .paymentMethod(PaymentMethod.UPI)
                .referenceNumber("UPI123456789")
                .weekStartDate(today.minusDays(6))
                .weekEndDate(today)
                .notes("Advance weekly settlement")
                .build());

        log.info("WageTrack demonstration data seeded successfully!");
    }
}
