package com.brightloop.subscription.dto.tax;

import com.brightloop.subscription.enums.TaxType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TaxResponse {

    private Long id;
    private String taxName;
    private BigDecimal taxRate;
    private TaxType taxType;
    private String description;
    private Boolean active;
    private LocalDateTime createdAt;

    public TaxResponse() {}

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
}

