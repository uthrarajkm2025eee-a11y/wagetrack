package com.wagetrack.repository;

import com.wagetrack.entity.Worksite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorksiteRepository extends JpaRepository<Worksite, Long> {

    Optional<Worksite> findByWorksiteCode(String worksiteCode);

    boolean existsByWorksiteCode(String worksiteCode);

    boolean existsByWorksiteCodeAndIdNot(String worksiteCode, Long id);

    List<Worksite> findByActive(boolean active);

    long countByActive(boolean active);
}
