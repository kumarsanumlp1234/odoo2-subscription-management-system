package com.brightloop.subscription.entity;

import com.brightloop.subscription.enums.TaxType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "taxes")
public class Tax {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tax_name", nullable = false, length = 100)
    private String taxName;

    @Column(name = "tax_rate", nullable = false, precision = 6, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "tax_type", nullable = false, length = 50)
    private TaxType taxType = TaxType.PERCENTAGE;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Tax() {}

    public Tax(String taxName, BigDecimal taxRate, TaxType taxType, String description) {
        this.taxName = taxName;
        this.taxRate = taxRate;
        this.taxType = taxType;
        this.description = description;
        this.active = true;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTaxName() { return taxName; }
    public void setTaxName(String taxName) { this.taxName = taxName; }

    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }

    public TaxType getTaxType() { return taxType; }
    public void setTaxType(TaxType taxType) { this.taxType = taxType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

