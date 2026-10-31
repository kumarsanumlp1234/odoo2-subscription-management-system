package com.brightloop.subscription.dto.quotation;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class QuotationRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Subscription Plan ID is required")
    private Long subscriptionPlanId;

    private LocalDate quotationDate = LocalDate.now();
    private LocalDate expiryDate;

    private BigDecimal overallDiscountPercent = BigDecimal.ZERO;
    private String notes;

    @NotEmpty(message = "At least one product line item is required")
    private List<QuotationLineDto> lines = new ArrayList<>();

    public QuotationRequest() {}

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getSubscriptionPlanId() { return subscriptionPlanId; }
    public void setSubscriptionPlanId(Long subscriptionPlanId) { this.subscriptionPlanId = subscriptionPlanId; }

    public LocalDate getQuotationDate() { return quotationDate; }
    public void setQuotationDate(LocalDate quotationDate) { this.quotationDate = quotationDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public BigDecimal getOverallDiscountPercent() { return overallDiscountPercent; }
    public void setOverallDiscountPercent(BigDecimal overallDiscountPercent) { this.overallDiscountPercent = overallDiscountPercent; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<QuotationLineDto> getLines() { return lines; }
    public void setLines(List<QuotationLineDto> lines) { this.lines = lines; }
}

