package com.brightloop.subscription.dto.subscription;

import com.brightloop.subscription.enums.BillingFrequency;
import com.brightloop.subscription.enums.SubscriptionStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class SubscriptionResponse {

    private Long id;
    private String subscriptionNumber;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long subscriptionPlanId;
    private String planName;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextBillingDate;
    private BillingFrequency billingFrequency;
    private String paymentTerms;
    private SubscriptionStatus status;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal totalAmount;
    private String createdByName;
    private List<SubscriptionLineDto> lines = new ArrayList<>();
    private List<SubscriptionHistoryDto> history = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public SubscriptionResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubscriptionNumber() { return subscriptionNumber; }
    public void setSubscriptionNumber(String subscriptionNumber) { this.subscriptionNumber = subscriptionNumber; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public Long getSubscriptionPlanId() { return subscriptionPlanId; }
    public void setSubscriptionPlanId(Long subscriptionPlanId) { this.subscriptionPlanId = subscriptionPlanId; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public LocalDate getNextBillingDate() { return nextBillingDate; }
    public void setNextBillingDate(LocalDate nextBillingDate) { this.nextBillingDate = nextBillingDate; }

    public BillingFrequency getBillingFrequency() { return billingFrequency; }
    public void setBillingFrequency(BillingFrequency billingFrequency) { this.billingFrequency = billingFrequency; }

    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }

    public SubscriptionStatus getStatus() { return status; }
    public void setStatus(SubscriptionStatus status) { this.status = status; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }

    public BigDecimal getTax() { return tax; }
    public void setTax(BigDecimal tax) { this.tax = tax; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public List<SubscriptionLineDto> getLines() { return lines; }
    public void setLines(List<SubscriptionLineDto> lines) { this.lines = lines; }

    public List<SubscriptionHistoryDto> getHistory() { return history; }
    public void setHistory(List<SubscriptionHistoryDto> history) { this.history = history; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

