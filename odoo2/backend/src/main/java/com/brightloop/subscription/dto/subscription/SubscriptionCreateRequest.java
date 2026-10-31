package com.brightloop.subscription.dto.subscription;

import com.brightloop.subscription.enums.BillingFrequency;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class SubscriptionCreateRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Subscription Plan ID is required")
    private Long subscriptionPlanId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate = LocalDate.now();

    private LocalDate endDate;
    private BillingFrequency billingFrequency;
    private String paymentTerms = "Immediate";
    private BigDecimal overallDiscountPercent = BigDecimal.ZERO;
    private Long quotationId; // Optional, when converted from quotation

    @NotEmpty(message = "At least one subscription line item is required")
    private List<SubscriptionLineDto> lines = new ArrayList<>();

    public SubscriptionCreateRequest() {}

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getSubscriptionPlanId() { return subscriptionPlanId; }
    public void setSubscriptionPlanId(Long subscriptionPlanId) { this.subscriptionPlanId = subscriptionPlanId; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BillingFrequency getBillingFrequency() { return billingFrequency; }
    public void setBillingFrequency(BillingFrequency billingFrequency) { this.billingFrequency = billingFrequency; }

    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }

    public BigDecimal getOverallDiscountPercent() { return overallDiscountPercent; }
    public void setOverallDiscountPercent(BigDecimal overallDiscountPercent) { this.overallDiscountPercent = overallDiscountPercent; }

    public Long getQuotationId() { return quotationId; }
    public void setQuotationId(Long quotationId) { this.quotationId = quotationId; }

    public List<SubscriptionLineDto> getLines() { return lines; }
    public void setLines(List<SubscriptionLineDto> lines) { this.lines = lines; }
}

