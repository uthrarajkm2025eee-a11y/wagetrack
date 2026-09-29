package com.wagetrack.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorksiteResponseDTO {

    private Long id;
    private String worksiteCode;
    private String name;
    private String location;
    private String description;
    private boolean active;
    private long activeWorkersCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
