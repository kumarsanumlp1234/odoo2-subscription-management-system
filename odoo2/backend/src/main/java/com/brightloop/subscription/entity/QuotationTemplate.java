package com.brightloop.subscription.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "quotation_templates")
public class QuotationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_name", nullable = false, length = 150)
    private String templateName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "validity_days", nullable = false)
    private Integer validityDays = 30;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_plan_id")
    private SubscriptionPlan defaultPlan;

    @Column(name = "default_discount", precision = 6, scale = 2)
    private BigDecimal defaultDiscount = BigDecimal.ZERO;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public QuotationTemplate() {}

    public QuotationTemplate(String templateName, Integer validityDays, SubscriptionPlan defaultPlan) {
        this.templateName = templateName;
        this.validityDays = validityDays;
        this.defaultPlan = defaultPlan;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTemplateName() { return templateName; }
    public void setTemplateName(String templateName) { this.templateName = templateName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getValidityDays() { return validityDays; }
    public void setValidityDays(Integer validityDays) { this.validityDays = validityDays; }

    public SubscriptionPlan getDefaultPlan() { return defaultPlan; }
    public void setDefaultPlan(SubscriptionPlan defaultPlan) { this.defaultPlan = defaultPlan; }

    public BigDecimal getDefaultDiscount() { return defaultDiscount; }
    public void setDefaultDiscount(BigDecimal defaultDiscount) { this.defaultDiscount = defaultDiscount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

