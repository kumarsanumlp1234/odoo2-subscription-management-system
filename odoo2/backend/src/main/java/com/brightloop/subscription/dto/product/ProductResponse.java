package com.brightloop.subscription.dto.product;

import com.brightloop.subscription.dto.tax.TaxResponse;
import com.brightloop.subscription.enums.ProductType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ProductResponse {

    private Long id;
    private String name;
    private ProductType productType;
    private BigDecimal salesPrice;
    private BigDecimal costPrice;
    private String description;
    private String notes;
    private Boolean active;
    private List<ProductVariantDto> variants = new ArrayList<>();
    private List<TaxResponse> taxes = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public List<TaxResponse> getTaxes() { return taxes; }
    public void setTaxes(List<TaxResponse> taxes) { this.taxes = taxes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

