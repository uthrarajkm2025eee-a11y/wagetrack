package com.wagetrack.repository;

import com.wagetrack.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {

    List<PaymentRecord> findByWorkerId(Long workerId);

    List<PaymentRecord> findByWorkerIdOrderByPaymentDateDesc(Long workerId);

    List<PaymentRecord> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);

    List<PaymentRecord> findByWorkerIdAndPaymentDateBetween(Long workerId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0.00) FROM PaymentRecord p WHERE p.worker.id = :workerId AND p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByWorkerIdAndPaymentDateBetween(@Param("workerId") Long workerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0.00) FROM PaymentRecord p WHERE p.worker.id = :workerId AND p.weekStartDate = :weekStartDate AND p.weekEndDate = :weekEndDate")
    BigDecimal sumAmountByWorkerIdAndWeekRange(@Param("workerId") Long workerId, @Param("weekStartDate") LocalDate weekStartDate, @Param("weekEndDate") LocalDate weekEndDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0.00) FROM PaymentRecord p WHERE p.worker.id = :workerId")
    BigDecimal sumTotalPaidByWorkerId(@Param("workerId") Long workerId);

    @Query("SELECT COALESCE(SUM(p.amount), 0.00) FROM PaymentRecord p")
    BigDecimal sumTotalPaid();

    List<PaymentRecord> findTop10ByOrderByCreatedAtDesc();
}
