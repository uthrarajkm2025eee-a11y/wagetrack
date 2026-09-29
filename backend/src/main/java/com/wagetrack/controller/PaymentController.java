package com.wagetrack.controller;

import com.wagetrack.dto.PaymentRequestDTO;
import com.wagetrack.dto.PaymentResponseDTO;
import com.wagetrack.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "Payments API", description = "Endpoints for recording and fetching worker payment settlements")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/api/payments")
    @Operation(summary = "Record actual payment to worker")
    public ResponseEntity<PaymentResponseDTO> recordPayment(@Valid @RequestBody PaymentRequestDTO dto) {
        PaymentResponseDTO created = paymentService.recordPayment(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/api/payments")
    @Operation(summary = "Get all payment records")
    public ResponseEntity<List<PaymentResponseDTO>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/api/payments/{id}")
    @Operation(summary = "Get payment details by ID")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/api/workers/{workerId}/payments")
    @Operation(summary = "Get payment history for a specific worker")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByWorker(@PathVariable Long workerId) {
        return ResponseEntity.ok(paymentService.getPaymentsByWorker(workerId));
    }
}
