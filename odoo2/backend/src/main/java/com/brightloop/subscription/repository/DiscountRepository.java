package com.brightloop.subscription.repository;

import com.brightloop.subscription.entity.Discount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long> {

    Optional<Discount> findByDiscountName(String discountName);

    @Query("SELECT d FROM Discount d WHERE (:active IS NULL OR d.active = :active) AND (:search IS NULL OR LOWER(d.discountName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Discount> searchDiscounts(@Param("search") String search, @Param("active") Boolean active, Pageable pageable);

    List<Discount> findByActiveTrue();
}

