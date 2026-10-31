package com.brightloop.subscription.repository;

import com.brightloop.subscription.entity.SubscriptionPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    @Query("SELECT sp FROM SubscriptionPlan sp WHERE (:active IS NULL OR sp.active = :active) AND (:search IS NULL OR LOWER(sp.planName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<SubscriptionPlan> searchPlans(@Param("search") String search, @Param("active") Boolean active, Pageable pageable);

    List<SubscriptionPlan> findByActiveTrue();
}

