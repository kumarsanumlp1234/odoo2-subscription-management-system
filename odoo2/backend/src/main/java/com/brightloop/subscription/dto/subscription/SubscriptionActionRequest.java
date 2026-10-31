package com.brightloop.subscription.dto.subscription;

public class SubscriptionActionRequest {

    private String reason;

    public SubscriptionActionRequest() {}

    public SubscriptionActionRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}

