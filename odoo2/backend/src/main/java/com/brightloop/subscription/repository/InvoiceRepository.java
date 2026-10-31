package com.brightloop.subscription.repository;

import com.brightloop.subscription.entity.Invoice;
import com.brightloop.subscription.enums.InvoiceStatus;
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
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT i FROM Invoice i WHERE (:customerId IS NULL OR i.customer.id = :customerId) AND (:status IS NULL OR i.status = :status) AND (:search IS NULL OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.customer.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Invoice> searchInvoices(@Param("customerId") Long customerId, @Param("status") InvoiceStatus status, @Param("search") String search, Pageable pageable);

    Page<Invoice> findByCustomerId(Long customerId, Pageable pageable);

    List<Invoice> findBySubscriptionId(Long subscriptionId);

    // Dashboard metrics
    @Query("SELECT COALESCE(SUM(i.paidAmount), 0) FROM Invoice i WHERE i.status <> 'CANCELLED'")
    BigDecimal sumTotalRevenueCollected();

    @Query("SELECT COALESCE(SUM(i.balanceDue), 0) FROM Invoice i WHERE i.status IN ('CONFIRMED', 'SENT', 'PARTIALLY_PAID', 'OVERDUE')")
    BigDecimal sumTotalOutstanding();

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status IN ('CONFIRMED', 'SENT', 'PARTIALLY_PAID', 'OVERDUE') AND i.dueDate < :today")
    long countOverdueInvoices(@Param("today") LocalDate today);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = :status")
    long countByStatus(@Param("status") InvoiceStatus status);

    @Query("SELECT i FROM Invoice i WHERE i.status IN ('CONFIRMED', 'SENT', 'PARTIALLY_PAID') AND i.dueDate < :today")
    List<Invoice> findUnpaidDueBefore(@Param("today") LocalDate today);
}

