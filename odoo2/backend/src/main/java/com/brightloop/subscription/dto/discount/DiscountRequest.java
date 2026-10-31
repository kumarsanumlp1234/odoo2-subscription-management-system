package com.brightloop.subscription.dto.discount;

import com.brightloop.subscription.enums.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

public class DiscountRequest {

    @NotBlank(message = "Discount name is required")
    private String discountName;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType = DiscountType.PERCENTAGE;

    @NotNull(message = "Discount value is required")
    private BigDecimal discountValue = BigDecimal.ZERO;

    private BigDecimal minimumPurchaseAmount = BigDecimal.ZERO;
    private Integer minimumQuantity = 1;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer maximumUsage = 0;
    private Boolean active = true;

    private Set<Long> applicableProductIds = new HashSet<>();
    private Set<Long> applicablePlanIds = new HashSet<>();

    public DiscountRequest() {}

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

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Set<Long> getApplicableProductIds() { return applicableProductIds; }
    public void setApplicableProductIds(Set<Long> applicableProductIds) { this.applicableProductIds = applicableProductIds; }

    public Set<Long> getApplicablePlanIds() { return applicablePlanIds; }
    public void setApplicablePlanIds(Set<Long> applicablePlanIds) { this.applicablePlanIds = applicablePlanIds; }
}

