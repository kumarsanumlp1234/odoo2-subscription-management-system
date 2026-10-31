package com.brightloop.subscription.dto.tax;

import com.brightloop.subscription.enums.TaxType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class TaxRequest {

    @NotBlank(message = "Tax name is required")
    private String taxName;

    @NotNull(message = "Tax rate is required")
    private BigDecimal taxRate;

    private TaxType taxType = TaxType.PERCENTAGE;
    private String description;
    private Boolean active = true;

    public TaxRequest() {}

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
}

