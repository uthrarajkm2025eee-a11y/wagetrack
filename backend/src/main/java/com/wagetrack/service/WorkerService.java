package com.wagetrack.service;

import com.wagetrack.dto.WorkerRequestDTO;
import com.wagetrack.dto.WorkerResponseDTO;
import com.wagetrack.entity.Worker;
import com.wagetrack.exception.DuplicateResourceException;
import com.wagetrack.exception.ResourceNotFoundException;
import com.wagetrack.mapper.WorkerMapper;
import com.wagetrack.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkerService {

    private final WorkerRepository workerRepository;

    @Transactional
    public WorkerResponseDTO createWorker(WorkerRequestDTO dto) {
        log.info("Creating worker with code: {}", dto.getWorkerCode());
        if (workerRepository.existsByWorkerCode(dto.getWorkerCode())) {
            throw new DuplicateResourceException("Worker with code '" + dto.getWorkerCode() + "' already exists.");
        }

        Worker worker = WorkerMapper.toEntity(dto);
        Worker savedWorker = workerRepository.save(worker);
        log.info("Worker registered successfully with ID: {}", savedWorker.getId());
        return WorkerMapper.toDTO(savedWorker);
    }

    @Transactional(readOnly = true)
    public List<WorkerResponseDTO> getAllWorkers() {
        return workerRepository.findAll().stream()
                .map(WorkerMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkerResponseDTO getWorkerById(Long id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + id));
        return WorkerMapper.toDTO(worker);
    }

    @Transactional
    public WorkerResponseDTO updateWorker(Long id, WorkerRequestDTO dto) {
        log.info("Updating worker ID: {}", id);
        Worker existingWorker = workerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + id));

        if (workerRepository.existsByWorkerCodeAndIdNot(dto.getWorkerCode(), id)) {
            throw new DuplicateResourceException("Worker with code '" + dto.getWorkerCode() + "' already exists.");
        }

        WorkerMapper.updateEntityFromDTO(dto, existingWorker);
        Worker updatedWorker = workerRepository.save(existingWorker);
        log.info("Worker updated successfully: {}", updatedWorker.getId());
        return WorkerMapper.toDTO(updatedWorker);
    }

    @Transactional
    public void deleteWorker(Long id) {
        log.info("Deleting/deactivating worker ID: {}", id);
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + id));
        workerRepository.delete(worker);
        log.info("Worker deleted with ID: {}", id);
    }
}
