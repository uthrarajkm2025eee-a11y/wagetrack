package com.wagetrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "workers", indexes = {
    @Index(name = "idx_worker_code", columnList = "worker_code"),
    @Index(name = "idx_worker_active", columnList = "active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "worker_code", nullable = false, unique = true, length = 50)
    private String workerCode;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "standard_daily_wage", nullable = false, precision = 12, scale = 2)
    private BigDecimal standardDailyWage;

    @Column(name = "standard_work_hours", nullable = false, precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal standardWorkHours = new BigDecimal("8.00");

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
