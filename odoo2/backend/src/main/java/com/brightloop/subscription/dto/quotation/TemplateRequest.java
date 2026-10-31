package com.brightloop.subscription.dto.quotation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class TemplateRequest {

    @NotBlank(message = "Template name is required")
    private String templateName;

    private String description;

    @NotNull(message = "Validity days is required")
    private Integer validityDays = 30;

    private Long defaultPlanId;
    private BigDecimal defaultDiscount = BigDecimal.ZERO;

    public TemplateRequest() {}

    public String getTemplateName() { return templateName; }
    public void setTemplateName(String templateName) { this.templateName = templateName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getValidityDays() { return validityDays; }
    public void setValidityDays(Integer validityDays) { this.validityDays = validityDays; }

    public Long getDefaultPlanId() { return defaultPlanId; }
    public void setDefaultPlanId(Long defaultPlanId) { this.defaultPlanId = defaultPlanId; }

    public BigDecimal getDefaultDiscount() { return defaultDiscount; }
    public void setDefaultDiscount(BigDecimal defaultDiscount) { this.defaultDiscount = defaultDiscount; }
}

