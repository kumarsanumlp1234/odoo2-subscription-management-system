package com.brightloop.subscription.dto.quotation;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TemplateResponse {

    private Long id;
    private String templateName;
    private String description;
    private Integer validityDays;
    private Long defaultPlanId;
    private String defaultPlanName;
    private BigDecimal defaultDiscount;
    private LocalDateTime createdAt;

    public TemplateResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTemplateName() { return templateName; }
    public void setTemplateName(String templateName) { this.templateName = templateName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getValidityDays() { return validityDays; }
    public void setValidityDays(Integer validityDays) { this.validityDays = validityDays; }

    public Long getDefaultPlanId() { return defaultPlanId; }
    public void setDefaultPlanId(Long defaultPlanId) { this.defaultPlanId = defaultPlanId; }

    public String getDefaultPlanName() { return defaultPlanName; }
    public void setDefaultPlanName(String defaultPlanName) { this.defaultPlanName = defaultPlanName; }

    public BigDecimal getDefaultDiscount() { return defaultDiscount; }
    public void setDefaultDiscount(BigDecimal defaultDiscount) { this.defaultDiscount = defaultDiscount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

