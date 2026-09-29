package com.wagetrack.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorksiteRequestDTO {

    @NotBlank(message = "Worksite code is required")
    @Size(max = 50, message = "Worksite code must be under 50 characters")
    private String worksiteCode;

    @NotBlank(message = "Worksite name is required")
    @Size(max = 100, message = "Worksite name must be under 100 characters")
    private String name;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location must be under 200 characters")
    private String location;

    private String description;

    private Boolean active;
}
