package com.brightloop.subscription.repository;

import com.brightloop.subscription.entity.Subscription;
import com.brightloop.subscription.enums.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findBySubscriptionNumber(String subscriptionNumber);

    @Query("SELECT s FROM Subscription s WHERE (:customerId IS NULL OR s.customer.id = :customerId) AND (:status IS NULL OR s.status = :status) AND (:search IS NULL OR LOWER(s.subscriptionNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.customer.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Subscription> searchSubscriptions(@Param("customerId") Long customerId, @Param("status") SubscriptionStatus status, @Param("search") String search, Pageable pageable);

    Page<Subscription> findByCustomerId(Long customerId, Pageable pageable);

    // CRITICAL: Used by Automated Recurring Billing Scheduler
    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.nextBillingDate <= :today AND (s.endDate IS NULL OR s.endDate >= s.nextBillingDate) ORDER BY s.id ASC")
    Page<Subscription> findDueForBilling(@Param("today") LocalDate today, Pageable pageable);

    long countByStatus(SubscriptionStatus status);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Subscription s WHERE s.status = 'ACTIVE'")
    BigDecimal sumActiveSubscriptionRevenue();

    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.customer.id = :customerId")
    long countByCustomerId(@Param("customerId") Long customerId);
}

