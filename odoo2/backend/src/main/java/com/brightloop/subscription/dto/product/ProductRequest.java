package com.brightloop.subscription.dto.product;

import com.brightloop.subscription.enums.ProductType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    @NotNull(message = "Product type is required")
    private ProductType productType = ProductType.SERVICE;

    @NotNull(message = "Sales price is required")
    private BigDecimal salesPrice = BigDecimal.ZERO;

    @NotNull(message = "Cost price is required")
    private BigDecimal costPrice = BigDecimal.ZERO;

    private String description;
    private String notes;
    private Boolean active = true;

    private List<ProductVariantDto> variants = new ArrayList<>();
    private Set<Long> taxIds = new HashSet<>();

    public ProductRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public ProductType getProductType() { return productType; }
    public void setProductType(ProductType productType) { this.productType = productType; }

    public BigDecimal getSalesPrice() { return salesPrice; }
    public void setSalesPrice(BigDecimal salesPrice) { this.salesPrice = salesPrice; }

    public BigDecimal getCostPrice() { return costPrice; }
    public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public List<ProductVariantDto> getVariants() { return variants; }
    public void setVariants(List<ProductVariantDto> variants) { this.variants = variants; }

    public Set<Long> getTaxIds() { return taxIds; }
    public void setTaxIds(Set<Long> taxIds) { this.taxIds = taxIds; }
}

