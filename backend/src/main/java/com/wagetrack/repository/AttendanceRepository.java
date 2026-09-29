package com.wagetrack.repository;

import com.wagetrack.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    boolean existsByWorkerIdAndWorksiteIdAndAttendanceDate(Long workerId, Long worksiteId, LocalDate attendanceDate);

    boolean existsByWorkerIdAndWorksiteIdAndAttendanceDateAndIdNot(Long workerId, Long worksiteId, LocalDate attendanceDate, Long id);

    List<Attendance> findByWorkerId(Long workerId);

    List<Attendance> findByWorksiteId(Long worksiteId);

    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);

    List<Attendance> findByWorkerIdAndAttendanceDateBetween(Long workerId, LocalDate startDate, LocalDate endDate);

    List<Attendance> findByAttendanceDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT COUNT(DISTINCT a.worker.id) FROM Attendance a WHERE a.worksite.id = :worksiteId AND a.worksite.active = true")
    long countActiveWorkersByWorksiteId(@Param("worksiteId") Long worksiteId);

    long countByAttendanceDate(LocalDate attendanceDate);

    @Query("SELECT COALESCE(SUM(a.totalPay), 0.00) FROM Attendance a WHERE a.attendanceDate = :date")
    BigDecimal sumTotalPayByAttendanceDate(@Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(a.totalPay), 0.00) FROM Attendance a WHERE a.attendanceDate BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalPayBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(a.totalPay), 0.00) FROM Attendance a WHERE a.worker.id = :workerId AND a.attendanceDate BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalPayByWorkerAndDateBetween(@Param("workerId") Long workerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
