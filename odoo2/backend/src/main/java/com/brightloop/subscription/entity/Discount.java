package com.brightloop.subscription.entity;

import com.brightloop.subscription.enums.DiscountType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "discounts")
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "discount_name", nullable = false, length = 150)
    private String discountName;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType = DiscountType.PERCENTAGE;

    @Column(name = "discount_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue = BigDecimal.ZERO;

    @Column(name = "minimum_purchase_amount", precision = 12, scale = 2)
    private BigDecimal minimumPurchaseAmount = BigDecimal.ZERO;

    @Column(name = "minimum_quantity")
    private Integer minimumQuantity = 1;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "maximum_usage")
    private Integer maximumUsage = 0; // 0 means unlimited

    @Column(name = "usage_count", nullable = false)
    private Integer usageCount = 0;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "discount_products",
        joinColumns = @JoinColumn(name = "discount_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private Set<Product> applicableProducts = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "discount_plans",
        joinColumns = @JoinColumn(name = "discount_id"),
        inverseJoinColumns = @JoinColumn(name = "plan_id")
    )
    private Set<SubscriptionPlan> applicablePlans = new HashSet<>();

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Discount() {}

    public Discount(String discountName, DiscountType discountType, BigDecimal discountValue) {
        this.discountName = discountName;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.active = true;
    }

    public boolean isValidForDate(LocalDate date) {
        if (!active) return false;
        if (startDate != null && date.isBefore(startDate)) return false;
        if (endDate != null && date.isAfter(endDate)) return false;
        if (maximumUsage != null && maximumUsage > 0 && usageCount >= maximumUsage) return false;
        return true;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDiscountName() { return discountName; }
    public void setDiscountName(String discountName) { this.discountName = discountName; }

    public DiscountType getDiscountType() { return discountType; }
    public void setDiscountType(DiscountType discountType) { this.discountType = discountType; }

    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }

    public BigDecimal getMinimumPurchaseAmount() { return minimumPurchaseAmount; }
    public void setMinimumPurchaseAmount(BigDecimal minimumPurchaseAmount) { this.minimumPurchaseAmount = minimumPurchaseAmount; }

    public Integer getMinimumQuantity() { return minimumQuantity; }
    public void setMinimumQuantity(Integer minimumQuantity) { this.minimumQuantity = minimumQuantity; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Integer getMaximumUsage() { return maximumUsage; }
    public void setMaximumUsage(Integer maximumUsage) { this.maximumUsage = maximumUsage; }

    public Integer getUsageCount() { return usageCount; }
    public void setUsageCount(Integer usageCount) { this.usageCount = usageCount; }

    public Set<Product> getApplicableProducts() { return applicableProducts; }
    public void setApplicableProducts(Set<Product> applicableProducts) { this.applicableProducts = applicableProducts; }

    public Set<SubscriptionPlan> getApplicablePlans() { return applicablePlans; }
    public void setApplicablePlans(Set<SubscriptionPlan> applicablePlans) { this.applicablePlans = applicablePlans; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

