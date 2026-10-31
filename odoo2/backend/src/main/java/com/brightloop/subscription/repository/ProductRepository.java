package com.brightloop.subscription.repository;

import com.brightloop.subscription.entity.Product;
import com.brightloop.subscription.enums.ProductType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE (:active IS NULL OR p.active = :active) AND (:productType IS NULL OR p.productType = :productType) AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> searchProducts(@Param("search") String search, @Param("productType") ProductType productType, @Param("active") Boolean active, Pageable pageable);

    List<Product> findByActiveTrue();
    long countByActiveTrue();
}

