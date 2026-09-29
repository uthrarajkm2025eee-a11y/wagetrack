package com.wagetrack.service;

import com.wagetrack.dto.PaymentRequestDTO;
import com.wagetrack.dto.PaymentResponseDTO;
import com.wagetrack.dto.WeeklySummaryDTO;
import com.wagetrack.entity.PaymentRecord;
import com.wagetrack.entity.Worker;
import com.wagetrack.exception.InvalidBusinessRuleException;
import com.wagetrack.exception.ResourceNotFoundException;
import com.wagetrack.mapper.PaymentMapper;
import com.wagetrack.repository.PaymentRecordRepository;
import com.wagetrack.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRecordRepository paymentRecordRepository;
    private final WorkerRepository workerRepository;
    private final PayrollService payrollService;

    @Transactional
    public PaymentResponseDTO recordPayment(PaymentRequestDTO dto) {
        log.info("Recording payment for workerId: {}, amount: ₹{}", dto.getWorkerId(), dto.getAmount());

        Worker worker = workerRepository.findById(dto.getWorkerId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + dto.getWorkerId()));

        if (dto.getAmount() == null || dto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidBusinessRuleException("Payment amount must be greater than zero.");
        }

        if (dto.getWeekEndDate().isBefore(dto.getWeekStartDate())) {
            throw new InvalidBusinessRuleException("Week end date cannot be before week start date.");
        }

        // Validate that payment does not exceed outstanding payable balance for the week
        WeeklySummaryDTO summary = payrollService.getWeeklySummary(worker.getId(), dto.getWeekStartDate(), dto.getWeekEndDate());
        BigDecimal remainingPayable = summary.getRemainingPayable();

        if (dto.getAmount().compareTo(remainingPayable) > 0) {
            throw new InvalidBusinessRuleException(
                    String.format("Payment amount ₹%s exceeds the outstanding payable balance of ₹%s for the period %s to %s.",
                            dto.getAmount(), remainingPayable, dto.getWeekStartDate(), dto.getWeekEndDate())
            );
        }

        PaymentRecord paymentRecord = PaymentRecord.builder()
                .worker(worker)
                .paymentDate(dto.getPaymentDate())
                .amount(dto.getAmount())
                .paymentMethod(dto.getPaymentMethod())
                .referenceNumber(dto.getReferenceNumber())
                .weekStartDate(dto.getWeekStartDate())
                .weekEndDate(dto.getWeekEndDate())
                .notes(dto.getNotes())
                .build();

        PaymentRecord saved = paymentRecordRepository.save(paymentRecord);
        log.info("Payment of ₹{} recorded for worker {}.", saved.getAmount(), worker.getWorkerCode());
        return PaymentMapper.toDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponseDTO> getAllPayments() {
        return paymentRecordRepository.findAll().stream()
                .map(PaymentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentById(Long id) {
        PaymentRecord record = paymentRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with ID: " + id));
        return PaymentMapper.toDTO(record);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponseDTO> getPaymentsByWorker(Long workerId) {
        if (!workerRepository.existsById(workerId)) {
            throw new ResourceNotFoundException("Worker not found with ID: " + workerId);
        }
        return paymentRecordRepository.findByWorkerIdOrderByPaymentDateDesc(workerId).stream()
                .map(PaymentMapper::toDTO)
                .collect(Collectors.toList());
    }
}
