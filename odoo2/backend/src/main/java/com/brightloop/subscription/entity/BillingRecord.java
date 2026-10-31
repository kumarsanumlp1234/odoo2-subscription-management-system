package com.brightloop.subscription.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "billing_records", uniqueConstraints = {
    @UniqueConstraint(name = "uq_sub_billing_cycle", columnNames = {"subscription_id", "billing_period_start"})
})
public class BillingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    @Column(name = "billing_period_start", nullable = false)
    private LocalDate billingPeriodStart;

    @Column(name = "billing_period_end", nullable = false)
    private LocalDate billingPeriodEnd;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(name = "billed_at", updatable = false)
    private LocalDateTime billedAt = LocalDateTime.now();

    public BillingRecord() {}

    public BillingRecord(Subscription subscription, LocalDate billingPeriodStart, LocalDate billingPeriodEnd, Invoice invoice) {
        this.subscription = subscription;
        this.billingPeriodStart = billingPeriodStart;
        this.billingPeriodEnd = billingPeriodEnd;
        this.invoice = invoice;
        this.billedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Subscription getSubscription() { return subscription; }
    public void setSubscription(Subscription subscription) { this.subscription = subscription; }

    public LocalDate getBillingPeriodStart() { return billingPeriodStart; }
    public void setBillingPeriodStart(LocalDate billingPeriodStart) { this.billingPeriodStart = billingPeriodStart; }

    public LocalDate getBillingPeriodEnd() { return billingPeriodEnd; }
    public void setBillingPeriodEnd(LocalDate billingPeriodEnd) { this.billingPeriodEnd = billingPeriodEnd; }

    public Invoice getInvoice() { return invoice; }
    public void setInvoice(Invoice invoice) { this.invoice = invoice; }

    public LocalDateTime getBilledAt() { return billedAt; }
    public void setBilledAt(LocalDateTime billedAt) { this.billedAt = billedAt; }
}

