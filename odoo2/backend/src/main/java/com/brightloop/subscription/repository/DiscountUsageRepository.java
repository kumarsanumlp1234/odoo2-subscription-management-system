package com.brightloop.subscription.repository;

import com.brightloop.subscription.entity.DiscountUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscountUsageRepository extends JpaRepository<DiscountUsage, Long> {
    boolean existsByDiscountIdAndInvoiceId(Long discountId, Long invoiceId);
    List<DiscountUsage> findByInvoiceId(Long invoiceId);
    List<DiscountUsage> findByCustomerId(Long customerId);
}

