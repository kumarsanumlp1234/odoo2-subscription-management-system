package com.brightloop.subscription.dto.plan;

import com.brightloop.subscription.enums.BillingFrequency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class PlanRequest {

    @NotBlank(message = "Plan name is required")
    private String planName;

    private String description;

    @NotNull(message = "Billing frequency is required")
    private BillingFrequency billingFrequency = BillingFrequency.MONTHLY;

    @NotNull(message = "Billing interval is required")
    private Integer billingInterval = 1;

    @NotNull(message = "Base price is required")
    private BigDecimal basePrice = BigDecimal.ZERO;

    private Integer minimumQuantity = 1;
    private LocalDate availableFrom;
    private LocalDate availableUntil;
    private Boolean autoClose = false;
    private Boolean allowEarlyClosure = true;
    private Boolean allowPause = true;
    private Boolean allowManualRenewal = true;
    private Boolean active = true;

    public PlanRequest() {}

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BillingFrequency getBillingFrequency() { return billingFrequency; }
    public void setBillingFrequency(BillingFrequency billingFrequency) { this.billingFrequency = billingFrequency; }

    public Integer getBillingInterval() { return billingInterval; }
    public void setBillingInterval(Integer billingInterval) { this.billingInterval = billingInterval; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public Integer getMinimumQuantity() { return minimumQuantity; }
    public void setMinimumQuantity(Integer minimumQuantity) { this.minimumQuantity = minimumQuantity; }

    public LocalDate getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDate availableFrom) { this.availableFrom = availableFrom; }

    public LocalDate getAvailableUntil() { return availableUntil; }
    public void setAvailableUntil(LocalDate availableUntil) { this.availableUntil = availableUntil; }

    public Boolean getAutoClose() { return autoClose; }
    public void setAutoClose(Boolean autoClose) { this.autoClose = autoClose; }

    public Boolean getAllowEarlyClosure() { return allowEarlyClosure; }
    public void setAllowEarlyClosure(Boolean allowEarlyClosure) { this.allowEarlyClosure = allowEarlyClosure; }

    public Boolean getAllowPause() { return allowPause; }
    public void setAllowPause(Boolean allowPause) { this.allowPause = allowPause; }

    public Boolean getAllowManualRenewal() { return allowManualRenewal; }
    public void setAllowManualRenewal(Boolean allowManualRenewal) { this.allowManualRenewal = allowManualRenewal; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}

