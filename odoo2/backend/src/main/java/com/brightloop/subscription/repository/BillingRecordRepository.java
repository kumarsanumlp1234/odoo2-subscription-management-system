package com.brightloop.subscription.repository;

import com.brightloop.subscription.entity.BillingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface BillingRecordRepository extends JpaRepository<BillingRecord, Long> {
    boolean existsBySubscriptionIdAndBillingPeriodStart(Long subscriptionId, LocalDate billingPeriodStart);
    Optional<BillingRecord> findBySubscriptionIdAndBillingPeriodStart(Long subscriptionId, LocalDate billingPeriodStart);
}

