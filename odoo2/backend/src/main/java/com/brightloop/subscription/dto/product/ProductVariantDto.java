package com.brightloop.subscription.dto.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ProductVariantDto {

    private Long id;

    @NotBlank(message = "Variant name is required")
    private String variantName;

    @NotNull(message = "Additional price is required")
    private BigDecimal additionalPrice = BigDecimal.ZERO;

    private String sku;
    private String description;
    private Boolean active = true;

    public ProductVariantDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVariantName() { return variantName; }
    public void setVariantName(String variantName) { this.variantName = variantName; }

    public BigDecimal getAdditionalPrice() { return additionalPrice; }
    public void setAdditionalPrice(BigDecimal additionalPrice) { this.additionalPrice = additionalPrice; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}

