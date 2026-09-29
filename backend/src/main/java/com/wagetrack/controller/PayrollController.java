package com.wagetrack.controller;

import com.wagetrack.dto.WeeklySummaryDTO;
import com.wagetrack.service.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "Weekly Payroll API", description = "Endpoints for weekly wage and payroll summary calculations")
public class PayrollController {

    private final PayrollService payrollService;

    @GetMapping("/api/workers/{workerId}/weekly-summary")
    @Operation(summary = "Get weekly wage summary for a specific worker")
    public ResponseEntity<WeeklySummaryDTO> getWeeklySummary(
            @PathVariable Long workerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        LocalDate defaultStart = startDate != null ? startDate : LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate defaultEnd = endDate != null ? endDate : LocalDate.now().with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        return ResponseEntity.ok(payrollService.getWeeklySummary(workerId, defaultStart, defaultEnd));
    }

    @GetMapping("/api/weekly-summaries")
    @Operation(summary = "Get weekly wage summaries for all active workers")
    public ResponseEntity<List<WeeklySummaryDTO>> getAllWeeklySummaries(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDate defaultStart = startDate != null ? startDate : LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate defaultEnd = endDate != null ? endDate : LocalDate.now().with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        return ResponseEntity.ok(payrollService.getAllWeeklySummaries(defaultStart, defaultEnd));
    }
}
