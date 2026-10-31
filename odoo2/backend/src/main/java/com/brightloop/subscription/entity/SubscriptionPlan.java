package com.brightloop.subscription.entity;

import com.brightloop.subscription.enums.BillingFrequency;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "plan_name", nullable = false, length = 150)
    private String planName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_frequency", nullable = false, length = 20)
    private BillingFrequency billingFrequency = BillingFrequency.MONTHLY;

    @Column(name = "billing_interval", nullable = false)
    private Integer billingInterval = 1;

    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice = BigDecimal.ZERO;

    @Column(name = "minimum_quantity", nullable = false)
    private Integer minimumQuantity = 1;

    @Column(name = "available_from")
    private LocalDate availableFrom;

    @Column(name = "available_until")
    private LocalDate availableUntil;

    @Column(name = "auto_close", nullable = false)
    private Boolean autoClose = false;

    @Column(name = "allow_early_closure", nullable = false)
    private Boolean allowEarlyClosure = true;

    @Column(name = "allow_pause", nullable = false)
    private Boolean allowPause = true;

    @Column(name = "allow_manual_renewal", nullable = false)
    private Boolean allowManualRenewal = true;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public SubscriptionPlan() {}

    public SubscriptionPlan(String planName, BillingFrequency billingFrequency, Integer billingInterval, BigDecimal basePrice) {
        this.planName = planName;
        this.billingFrequency = billingFrequency;
        this.billingInterval = billingInterval;
        this.basePrice = basePrice;
        this.active = true;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

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

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

