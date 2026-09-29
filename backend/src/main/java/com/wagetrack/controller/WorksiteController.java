package com.wagetrack.controller;

import com.wagetrack.dto.WorksiteRequestDTO;
import com.wagetrack.dto.WorksiteResponseDTO;
import com.wagetrack.service.WorksiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/worksites")
@RequiredArgsConstructor
@Tag(name = "Worksites API", description = "Endpoints for managing worksites and locations")
public class WorksiteController {

    private final WorksiteService worksiteService;

    @PostMapping
    @Operation(summary = "Create a new worksite")
    public ResponseEntity<WorksiteResponseDTO> createWorksite(@Valid @RequestBody WorksiteRequestDTO dto) {
        WorksiteResponseDTO created = worksiteService.createWorksite(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all worksites")
    public ResponseEntity<List<WorksiteResponseDTO>> getAllWorksites() {
        return ResponseEntity.ok(worksiteService.getAllWorksites());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get worksite details by ID")
    public ResponseEntity<WorksiteResponseDTO> getWorksiteById(@PathVariable Long id) {
        return ResponseEntity.ok(worksiteService.getWorksiteById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing worksite")
    public ResponseEntity<WorksiteResponseDTO> updateWorksite(@PathVariable Long id, @Valid @RequestBody WorksiteRequestDTO dto) {
        return ResponseEntity.ok(worksiteService.updateWorksite(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a worksite")
    public ResponseEntity<Void> deleteWorksite(@PathVariable Long id) {
        worksiteService.deleteWorksite(id);
        return ResponseEntity.noContent().build();
    }
}
