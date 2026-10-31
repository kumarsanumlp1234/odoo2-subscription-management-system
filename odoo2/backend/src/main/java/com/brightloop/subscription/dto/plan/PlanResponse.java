package com.brightloop.subscription.dto.plan;

import com.brightloop.subscription.enums.BillingFrequency;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PlanResponse {

    private Long id;
    private String planName;
    private String description;
    private BillingFrequency billingFrequency;
    private Integer billingInterval;
    private BigDecimal basePrice;
    private Integer minimumQuantity;
    private LocalDate availableFrom;
    private LocalDate availableUntil;
    private Boolean autoClose;
    private Boolean allowEarlyClosure;
    private Boolean allowPause;
    private Boolean allowManualRenewal;
    private Boolean active;
    private LocalDateTime createdAt;

    public PlanResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

