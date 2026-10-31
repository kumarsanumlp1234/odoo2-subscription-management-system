package com.brightloop.subscription.dto.dashboard;

import java.math.BigDecimal;

public class DashboardSummaryDto {

    private long totalCustomers;
    private long totalProducts;
    private long activeSubscriptions;
    private long pausedSubscriptions;
    private BigDecimal monthlyRecurringRevenue = BigDecimal.ZERO;
    private BigDecimal annualRecurringRevenue = BigDecimal.ZERO;
    private BigDecimal totalRevenueCollected = BigDecimal.ZERO;
    private BigDecimal outstandingAmount = BigDecimal.ZERO;
    private long overdueInvoices;
    private long totalInvoices;

    public DashboardSummaryDto() {}

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getActiveSubscriptions() { return activeSubscriptions; }
    public void setActiveSubscriptions(long activeSubscriptions) { this.activeSubscriptions = activeSubscriptions; }

    public long getPausedSubscriptions() { return pausedSubscriptions; }
    public void setPausedSubscriptions(long pausedSubscriptions) { this.pausedSubscriptions = pausedSubscriptions; }

    public BigDecimal getMonthlyRecurringRevenue() { return monthlyRecurringRevenue; }
    public void setMonthlyRecurringRevenue(BigDecimal monthlyRecurringRevenue) { this.monthlyRecurringRevenue = monthlyRecurringRevenue; }

    public BigDecimal getAnnualRecurringRevenue() { return annualRecurringRevenue; }
    public void setAnnualRecurringRevenue(BigDecimal annualRecurringRevenue) { this.annualRecurringRevenue = annualRecurringRevenue; }

    public BigDecimal getTotalRevenueCollected() { return totalRevenueCollected; }
    public void setTotalRevenueCollected(BigDecimal totalRevenueCollected) { this.totalRevenueCollected = totalRevenueCollected; }

    public BigDecimal getOutstandingAmount() { return outstandingAmount; }
    public void setOutstandingAmount(BigDecimal outstandingAmount) { this.outstandingAmount = outstandingAmount; }

    public long getOverdueInvoices() { return overdueInvoices; }
    public void setOverdueInvoices(long overdueInvoices) { this.overdueInvoices = overdueInvoices; }

    public long getTotalInvoices() { return totalInvoices; }
    public void setTotalInvoices(long totalInvoices) { this.totalInvoices = totalInvoices; }
}

