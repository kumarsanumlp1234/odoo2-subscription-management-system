package com.brightloop.subscription.repository;

import com.brightloop.subscription.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPaymentNumber(String paymentNumber);
    Optional<Payment> findByTransactionReference(String transactionReference);
    boolean existsByTransactionReference(String transactionReference);

    List<Payment> findByInvoiceId(Long invoiceId);

    @Query("SELECT p FROM Payment p WHERE (:customerId IS NULL OR p.customer.id = :customerId) AND (:search IS NULL OR LOWER(p.paymentNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.transactionReference) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.customer.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Payment> searchPayments(@Param("customerId") Long customerId, @Param("search") String search, Pageable pageable);

    Page<Payment> findByCustomerId(Long customerId, Pageable pageable);
}

