package com.wagetrack.service;

import com.wagetrack.dto.WorkerRequestDTO;
import com.wagetrack.dto.WorkerResponseDTO;
import com.wagetrack.entity.Worker;
import com.wagetrack.exception.DuplicateResourceException;
import com.wagetrack.repository.WorkerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkerServiceTest {

    @Mock
    private WorkerRepository workerRepository;

    @InjectMocks
    private WorkerService workerService;

    private WorkerRequestDTO requestDTO;
    private Worker workerEntity;

    @BeforeEach
    void setUp() {
        requestDTO = WorkerRequestDTO.builder()
                .workerCode("WKR-101")
                .fullName("Suresh Sharma")
                .phoneNumber("9876543210")
                .address("Site 4, Rural Block")
                .standardDailyWage(new BigDecimal("750.00"))
                .standardWorkHours(new BigDecimal("8.00"))
                .active(true)
                .build();

        workerEntity = Worker.builder()
                .id(1L)
                .workerCode("WKR-101")
                .fullName("Suresh Sharma")
                .phoneNumber("9876543210")
                .address("Site 4, Rural Block")
                .standardDailyWage(new BigDecimal("750.00"))
                .standardWorkHours(new BigDecimal("8.00"))
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Create Worker Success")
    void testCreateWorkerSuccess() {
        when(workerRepository.existsByWorkerCode("WKR-101")).thenReturn(false);
        when(workerRepository.save(any(Worker.class))).thenReturn(workerEntity);

        WorkerResponseDTO response = workerService.createWorker(requestDTO);

        assertNotNull(response);
        assertEquals("WKR-101", response.getWorkerCode());
        assertEquals("Suresh Sharma", response.getFullName());
        verify(workerRepository, times(1)).save(any(Worker.class));
    }

    @Test
    @DisplayName("Create Worker Duplicate Code Exception")
    void testCreateWorkerDuplicateCode() {
        when(workerRepository.existsByWorkerCode("WKR-101")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> workerService.createWorker(requestDTO));
        verify(workerRepository, never()).save(any(Worker.class));
    }
}
