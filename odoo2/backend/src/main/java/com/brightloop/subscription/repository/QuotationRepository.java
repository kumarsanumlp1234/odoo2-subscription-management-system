package com.brightloop.subscription.repository;

import com.brightloop.subscription.entity.Quotation;
import com.brightloop.subscription.enums.QuotationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    Optional<Quotation> findByQuotationNumber(String quotationNumber);

    @Query("SELECT q FROM Quotation q WHERE (:customerId IS NULL OR q.customer.id = :customerId) AND (:status IS NULL OR q.status = :status) AND (:search IS NULL OR LOWER(q.quotationNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(q.customer.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Quotation> searchQuotations(@Param("customerId") Long customerId, @Param("status") QuotationStatus status, @Param("search") String search, Pageable pageable);

    Page<Quotation> findByCustomerId(Long customerId, Pageable pageable);
}

