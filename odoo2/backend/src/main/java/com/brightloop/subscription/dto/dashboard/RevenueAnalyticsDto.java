package com.brightloop.subscription.dto.dashboard;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class RevenueAnalyticsDto {

    private List<MonthlyData> monthlyRevenue = new ArrayList<>();
    private List<CategoryData> revenueByPlan = new ArrayList<>();
    private List<CategoryData> revenueByProduct = new ArrayList<>();

    public RevenueAnalyticsDto() {}

    public static class MonthlyData {
        private String month;
        private BigDecimal billed = BigDecimal.ZERO;
        private BigDecimal collected = BigDecimal.ZERO;

        public MonthlyData() {}
        public MonthlyData(String month, BigDecimal billed, BigDecimal collected) {
            this.month = month;
            this.billed = billed;
            this.collected = collected;
        }

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }
        public BigDecimal getBilled() { return billed; }
        public void setBilled(BigDecimal billed) { this.billed = billed; }
        public BigDecimal getCollected() { return collected; }
        public void setCollected(BigDecimal collected) { this.collected = collected; }
    }

    public static class CategoryData {
        private String name;
        private BigDecimal amount = BigDecimal.ZERO;

        public CategoryData() {}
        public CategoryData(String name, BigDecimal amount) {
            this.name = name;
            this.amount = amount;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }

    public List<MonthlyData> getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(List<MonthlyData> monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }

    public List<CategoryData> getRevenueByPlan() { return revenueByPlan; }
    public void setRevenueByPlan(List<CategoryData> revenueByPlan) { this.revenueByPlan = revenueByPlan; }

    public List<CategoryData> getRevenueByProduct() { return revenueByProduct; }
    public void setRevenueByProduct(List<CategoryData> revenueByProduct) { this.revenueByProduct = revenueByProduct; }
}

