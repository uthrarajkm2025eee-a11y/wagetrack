package com.wagetrack.service;

import com.wagetrack.dto.WorksiteRequestDTO;
import com.wagetrack.dto.WorksiteResponseDTO;
import com.wagetrack.entity.Worksite;
import com.wagetrack.exception.DuplicateResourceException;
import com.wagetrack.exception.ResourceNotFoundException;
import com.wagetrack.mapper.WorksiteMapper;
import com.wagetrack.repository.AttendanceRepository;
import com.wagetrack.repository.WorksiteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorksiteService {

    private final WorksiteRepository worksiteRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional
    public WorksiteResponseDTO createWorksite(WorksiteRequestDTO dto) {
        log.info("Creating worksite with code: {}", dto.getWorksiteCode());
        if (worksiteRepository.existsByWorksiteCode(dto.getWorksiteCode())) {
            throw new DuplicateResourceException("Worksite with code '" + dto.getWorksiteCode() + "' already exists.");
        }

        Worksite worksite = WorksiteMapper.toEntity(dto);
        Worksite savedWorksite = worksiteRepository.save(worksite);
        log.info("Worksite created with ID: {}", savedWorksite.getId());
        return WorksiteMapper.toDTO(savedWorksite, 0);
    }

    @Transactional(readOnly = true)
    public List<WorksiteResponseDTO> getAllWorksites() {
        return worksiteRepository.findAll().stream()
                .map(w -> {
                    long activeCount = attendanceRepository.countActiveWorkersByWorksiteId(w.getId());
                    return WorksiteMapper.toDTO(w, activeCount);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorksiteResponseDTO getWorksiteById(Long id) {
        Worksite worksite = worksiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worksite not found with ID: " + id));
        long activeCount = attendanceRepository.countActiveWorkersByWorksiteId(id);
        return WorksiteMapper.toDTO(worksite, activeCount);
    }

    @Transactional
    public WorksiteResponseDTO updateWorksite(Long id, WorksiteRequestDTO dto) {
        log.info("Updating worksite ID: {}", id);
        Worksite existingWorksite = worksiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worksite not found with ID: " + id));

        if (worksiteRepository.existsByWorksiteCodeAndIdNot(dto.getWorksiteCode(), id)) {
            throw new DuplicateResourceException("Worksite with code '" + dto.getWorksiteCode() + "' already exists.");
        }

        WorksiteMapper.updateEntityFromDTO(dto, existingWorksite);
        Worksite updatedWorksite = worksiteRepository.save(existingWorksite);
        long activeCount = attendanceRepository.countActiveWorkersByWorksiteId(id);
        log.info("Worksite updated: {}", updatedWorksite.getId());
        return WorksiteMapper.toDTO(updatedWorksite, activeCount);
    }

    @Transactional
    public void deleteWorksite(Long id) {
        log.info("Deleting worksite ID: {}", id);
        Worksite worksite = worksiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worksite not found with ID: " + id));
        worksiteRepository.delete(worksite);
        log.info("Worksite deleted: {}", id);
    }
}
