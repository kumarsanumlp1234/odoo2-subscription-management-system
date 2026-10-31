package com.brightloop.subscription.repository;

import com.brightloop.subscription.entity.SubscriptionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionHistoryRepository extends JpaRepository<SubscriptionHistory, Long> {
    List<SubscriptionHistory> findBySubscriptionIdOrderByTimestampDesc(Long subscriptionId);
}

