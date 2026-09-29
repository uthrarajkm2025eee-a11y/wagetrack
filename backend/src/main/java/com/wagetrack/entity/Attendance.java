package com.wagetrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_worker_worksite_date", columnNames = {"worker_id", "worksite_id", "attendance_date"})
    },
    indexes = {
        @Index(name = "idx_attendance_worker_id", columnList = "worker_id"),
        @Index(name = "idx_attendance_worksite_id", columnList = "worksite_id"),
        @Index(name = "idx_attendance_date", columnList = "attendance_date")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "worker_id", nullable = false, foreignKey = @ForeignKey(name = "fk_attendance_worker"))
    private Worker worker;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "worksite_id", nullable = false, foreignKey = @ForeignKey(name = "fk_attendance_worksite"))
    private Worksite worksite;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AttendanceStatus status;

    @Column(name = "hours_worked", nullable = false, precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal hoursWorked = BigDecimal.ZERO;

    @Column(name = "overtime_hours", nullable = false, precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal overtimeHours = BigDecimal.ZERO;

    @Column(name = "regular_pay", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal regularPay = BigDecimal.ZERO;

    @Column(name = "overtime_pay", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal overtimePay = BigDecimal.ZERO;

    @Column(name = "total_pay", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalPay = BigDecimal.ZERO;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
