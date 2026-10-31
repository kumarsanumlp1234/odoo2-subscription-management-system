package com.brightloop.subscription.dto.dashboard;

import java.util.ArrayList;
import java.util.List;

public class SubscriptionAnalyticsDto {

    private long activeCount;
    private long pausedCount;
    private long closedCount;
    private long cancelledCount;
    private List<MonthlyTrend> growthTrend = new ArrayList<>();

    public SubscriptionAnalyticsDto() {}

    public static class MonthlyTrend {
        private String month;
        private long newSubscriptions;
        private long churnedSubscriptions;

        public MonthlyTrend() {}
        public MonthlyTrend(String month, long newSubscriptions, long churnedSubscriptions) {
            this.month = month;
            this.newSubscriptions = newSubscriptions;
            this.churnedSubscriptions = churnedSubscriptions;
        }

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }
        public long getNewSubscriptions() { return newSubscriptions; }
        public void setNewSubscriptions(long newSubscriptions) { this.newSubscriptions = newSubscriptions; }
        public long getChurnedSubscriptions() { return churnedSubscriptions; }
        public void setChurnedSubscriptions(long churnedSubscriptions) { this.churnedSubscriptions = churnedSubscriptions; }
    }

    public long getActiveCount() { return activeCount; }
    public void setActiveCount(long activeCount) { this.activeCount = activeCount; }

    public long getPausedCount() { return pausedCount; }
    public void setPausedCount(long pausedCount) { this.pausedCount = pausedCount; }

    public long getClosedCount() { return closedCount; }
    public void setClosedCount(long closedCount) { this.closedCount = closedCount; }

    public long getCancelledCount() { return cancelledCount; }
    public void setCancelledCount(long cancelledCount) { this.cancelledCount = cancelledCount; }

    public List<MonthlyTrend> getGrowthTrend() { return growthTrend; }
    public void setGrowthTrend(List<MonthlyTrend> growthTrend) { this.growthTrend = growthTrend; }
}

