package com.wagetrack.controller;

import com.wagetrack.dto.AttendanceRequestDTO;
import com.wagetrack.dto.AttendanceResponseDTO;
import com.wagetrack.entity.AttendanceStatus;
import com.wagetrack.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "Attendance API", description = "Endpoints for daily worker attendance and wage logging")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/api/attendance")
    @Operation(summary = "Record daily attendance and calculate wages")
    public ResponseEntity<AttendanceResponseDTO> recordAttendance(@Valid @RequestBody AttendanceRequestDTO dto) {
        AttendanceResponseDTO created = attendanceService.recordAttendance(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/api/attendance")
    @Operation(summary = "Get attendance records with optional filtering")
    public ResponseEntity<List<AttendanceResponseDTO>> getAttendanceRecords(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long workerId,
            @RequestParam(required = false) Long worksiteId,
            @RequestParam(required = false) AttendanceStatus status) {
        return ResponseEntity.ok(attendanceService.getAttendanceRecords(startDate, endDate, workerId, worksiteId, status));
    }

    @GetMapping("/api/attendance/{id}")
    @Operation(summary = "Get attendance details by ID")
    public ResponseEntity<AttendanceResponseDTO> getAttendanceById(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getAttendanceById(id));
    }

    @PutMapping("/api/attendance/{id}")
    @Operation(summary = "Update an attendance record")
    public ResponseEntity<AttendanceResponseDTO> updateAttendance(@PathVariable Long id, @Valid @RequestBody AttendanceRequestDTO dto) {
        return ResponseEntity.ok(attendanceService.updateAttendance(id, dto));
    }

    @DeleteMapping("/api/attendance/{id}")
    @Operation(summary = "Delete an attendance record")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/workers/{workerId}/attendance")
    @Operation(summary = "Get all attendance records for a specific worker")
    public ResponseEntity<List<AttendanceResponseDTO>> getAttendanceByWorker(@PathVariable Long workerId) {
        return ResponseEntity.ok(attendanceService.getAttendanceRecords(null, null, workerId, null, null));
    }

    @GetMapping("/api/worksites/{worksiteId}/attendance")
    @Operation(summary = "Get all attendance records for a specific worksite")
    public ResponseEntity<List<AttendanceResponseDTO>> getAttendanceByWorksite(@PathVariable Long worksiteId) {
        return ResponseEntity.ok(attendanceService.getAttendanceRecords(null, null, null, worksiteId, null));
    }
}
