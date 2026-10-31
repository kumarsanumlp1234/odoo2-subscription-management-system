package com.brightloop.subscription.repository;

import com.brightloop.subscription.entity.QuotationLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuotationLineRepository extends JpaRepository<QuotationLine, Long> {
    List<QuotationLine> findByQuotationId(Long quotationId);
}

