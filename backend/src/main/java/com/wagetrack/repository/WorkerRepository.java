package com.wagetrack.repository;

import com.wagetrack.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {

    Optional<Worker> findByWorkerCode(String workerCode);

    boolean existsByWorkerCode(String workerCode);

    boolean existsByWorkerCodeAndIdNot(String workerCode, Long id);

    List<Worker> findByActive(boolean active);

    long countByActive(boolean active);
}
