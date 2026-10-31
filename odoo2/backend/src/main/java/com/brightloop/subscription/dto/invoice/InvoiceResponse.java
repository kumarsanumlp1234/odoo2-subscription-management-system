package com.brightloop.subscription.dto.invoice;

import com.brightloop.subscription.enums.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class InvoiceResponse {

    private Long id;
    private String invoiceNumber;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long subscriptionId;
    private String subscriptionNumber;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate billingPeriodStart;
    private LocalDate billingPeriodEnd;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balanceDue;
    private InvoiceStatus status;
    private String pdfPath;
    private String notes;
    private List<InvoiceLineDto> lines = new ArrayList<>();
    private LocalDateTime createdAt;

    public InvoiceResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public Long getSubscriptionId() { return subscriptionId; }
    public void setSubscriptionId(Long subscriptionId) { this.subscriptionId = subscriptionId; }

    public String getSubscriptionNumber() { return subscriptionNumber; }
    public void setSubscriptionNumber(String subscriptionNumber) { this.subscriptionNumber = subscriptionNumber; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalDate getBillingPeriodStart() { return billingPeriodStart; }
    public void setBillingPeriodStart(LocalDate billingPeriodStart) { this.billingPeriodStart = billingPeriodStart; }

    public LocalDate getBillingPeriodEnd() { return billingPeriodEnd; }
    public void setBillingPeriodEnd(LocalDate billingPeriodEnd) { this.billingPeriodEnd = billingPeriodEnd; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }

    public BigDecimal getBalanceDue() { return balanceDue; }
    public void setBalanceDue(BigDecimal balanceDue) { this.balanceDue = balanceDue; }

    public InvoiceStatus getStatus() { return status; }
    public void setStatus(InvoiceStatus status) { this.status = status; }

    public String getPdfPath() { return pdfPath; }
    public void setPdfPath(String pdfPath) { this.pdfPath = pdfPath; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<InvoiceLineDto> getLines() { return lines; }
    public void setLines(List<InvoiceLineDto> lines) { this.lines = lines; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

