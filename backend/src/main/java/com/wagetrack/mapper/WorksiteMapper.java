package com.wagetrack.mapper;

import com.wagetrack.dto.WorksiteRequestDTO;
import com.wagetrack.dto.WorksiteResponseDTO;
import com.wagetrack.entity.Worksite;

public class WorksiteMapper {

    public static Worksite toEntity(WorksiteRequestDTO dto) {
        if (dto == null) return null;
        return Worksite.builder()
                .worksiteCode(dto.getWorksiteCode())
                .name(dto.getName())
                .location(dto.getLocation())
                .description(dto.getDescription())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
    }

    public static WorksiteResponseDTO toDTO(Worksite entity, long activeWorkersCount) {
        if (entity == null) return null;
        return WorksiteResponseDTO.builder()
                .id(entity.getId())
                .worksiteCode(entity.getWorksiteCode())
                .name(entity.getName())
                .location(entity.getLocation())
                .description(entity.getDescription())
                .active(entity.isActive())
                .activeWorkersCount(activeWorkersCount)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static void updateEntityFromDTO(WorksiteRequestDTO dto, Worksite entity) {
        if (dto == null || entity == null) return;
        entity.setWorksiteCode(dto.getWorksiteCode());
        entity.setName(dto.getName());
        entity.setLocation(dto.getLocation());
        entity.setDescription(dto.getDescription());
        if (dto.getActive() != null) {
            entity.setActive(dto.getActive());
        }
    }
}
