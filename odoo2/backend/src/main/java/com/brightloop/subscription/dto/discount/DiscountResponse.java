package com.brightloop.subscription.dto.discount;

import com.brightloop.subscription.enums.DiscountType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

public class DiscountResponse {

    private Long id;
    private String discountName;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minimumPurchaseAmount;
    private Integer minimumQuantity;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer maximumUsage;
    private Integer usageCount;
    private Boolean active;
    private Set<Long> applicableProductIds = new HashSet<>();
    private Set<Long> applicablePlanIds = new HashSet<>();
    private LocalDateTime createdAt;

    public DiscountResponse() {}

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

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Set<Long> getApplicableProductIds() { return applicableProductIds; }
    public void setApplicableProductIds(Set<Long> applicableProductIds) { this.applicableProductIds = applicableProductIds; }

    public Set<Long> getApplicablePlanIds() { return applicablePlanIds; }
    public void setApplicablePlanIds(Set<Long> applicablePlanIds) { this.applicablePlanIds = applicablePlanIds; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

