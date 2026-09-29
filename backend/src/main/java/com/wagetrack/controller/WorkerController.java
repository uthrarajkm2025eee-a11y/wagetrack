package com.wagetrack.controller;

import com.wagetrack.dto.WorkerRequestDTO;
import com.wagetrack.dto.WorkerResponseDTO;
import com.wagetrack.service.WorkerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
@Tag(name = "Workers API", description = "Endpoints for managing daily wage workers")
public class WorkerController {

    private final WorkerService workerService;

    @PostMapping
    @Operation(summary = "Create a new daily wage worker")
    public ResponseEntity<WorkerResponseDTO> createWorker(@Valid @RequestBody WorkerRequestDTO dto) {
        WorkerResponseDTO created = workerService.createWorker(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all workers")
    public ResponseEntity<List<WorkerResponseDTO>> getAllWorkers() {
        return ResponseEntity.ok(workerService.getAllWorkers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get worker details by ID")
    public ResponseEntity<WorkerResponseDTO> getWorkerById(@PathVariable Long id) {
        return ResponseEntity.ok(workerService.getWorkerById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing worker")
    public ResponseEntity<WorkerResponseDTO> updateWorker(@PathVariable Long id, @Valid @RequestBody WorkerRequestDTO dto) {
        return ResponseEntity.ok(workerService.updateWorker(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete or deactivate a worker")
    public ResponseEntity<Void> deleteWorker(@PathVariable Long id) {
        workerService.deleteWorker(id);
        return ResponseEntity.noContent().build();
    }
}
