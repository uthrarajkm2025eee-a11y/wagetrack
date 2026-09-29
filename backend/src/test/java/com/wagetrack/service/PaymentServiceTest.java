package com.wagetrack.service;

import com.wagetrack.dto.PaymentRequestDTO;
import com.wagetrack.dto.PaymentResponseDTO;
import com.wagetrack.dto.WeeklySummaryDTO;
import com.wagetrack.entity.PaymentMethod;
import com.wagetrack.entity.PaymentRecord;
import com.wagetrack.entity.Worker;
import com.wagetrack.exception.InvalidBusinessRuleException;
import com.wagetrack.repository.PaymentRecordRepository;
import com.wagetrack.repository.WorkerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRecordRepository paymentRecordRepository;

    @Mock
    private WorkerRepository workerRepository;

    @Mock
    private PayrollService payrollService;

    @InjectMocks
    private PaymentService paymentService;

    private Worker sampleWorker;
    private PaymentRequestDTO paymentRequest;

    @BeforeEach
    void setUp() {
        sampleWorker = Worker.builder()
                .id(1L)
                .workerCode("WKR-001")
                .fullName("Ravi Kumar")
                .standardDailyWage(new BigDecimal("800.00"))
                .active(true)
                .build();

        paymentRequest = PaymentRequestDTO.builder()
                .workerId(1L)
                .paymentDate(LocalDate.of(2026, 9, 27))
                .amount(new BigDecimal("2000.00"))
                .paymentMethod(PaymentMethod.UPI)
                .referenceNumber("UPI12345678")
                .weekStartDate(LocalDate.of(2026, 9, 21))
                .weekEndDate(LocalDate.of(2026, 9, 27))
                .notes("Weekly settlement")
                .build();
    }

    @Test
    @DisplayName("Record Payment Success")
    void testRecordPaymentSuccess() {
        when(workerRepository.findById(1L)).thenReturn(Optional.of(sampleWorker));

        WeeklySummaryDTO mockSummary = WeeklySummaryDTO.builder()
                .workerId(1L)
                .remainingPayable(new BigDecimal("3000.00"))
                .build();
        when(payrollService.getWeeklySummary(eq(1L), any(LocalDate.class), any(LocalDate.class))).thenReturn(mockSummary);

        PaymentRecord savedRecord = PaymentRecord.builder()
                .id(100L)
                .worker(sampleWorker)
                .paymentDate(paymentRequest.getPaymentDate())
                .amount(paymentRequest.getAmount())
                .paymentMethod(paymentRequest.getPaymentMethod())
                .referenceNumber(paymentRequest.getReferenceNumber())
                .weekStartDate(paymentRequest.getWeekStartDate())
                .weekEndDate(paymentRequest.getWeekEndDate())
                .build();
        when(paymentRecordRepository.save(any(PaymentRecord.class))).thenReturn(savedRecord);

        PaymentResponseDTO response = paymentService.recordPayment(paymentRequest);

        assertNotNull(response);
        assertEquals(new BigDecimal("2000.00"), response.getAmount());
        assertEquals(PaymentMethod.UPI, response.getPaymentMethod());
        verify(paymentRecordRepository, times(1)).save(any(PaymentRecord.class));
    }

    @Test
    @DisplayName("Record Payment Overpayment Exception")
    void testRecordPaymentOverpayment() {
        when(workerRepository.findById(1L)).thenReturn(Optional.of(sampleWorker));

        WeeklySummaryDTO mockSummary = WeeklySummaryDTO.builder()
                .workerId(1L)
                .remainingPayable(new BigDecimal("1000.00")) // Remaining is only 1000, attempt to pay 2000
                .build();
        when(payrollService.getWeeklySummary(eq(1L), any(LocalDate.class), any(LocalDate.class))).thenReturn(mockSummary);

        assertThrows(InvalidBusinessRuleException.class, () -> paymentService.recordPayment(paymentRequest));
        verify(paymentRecordRepository, never()).save(any(PaymentRecord.class));
    }
}
