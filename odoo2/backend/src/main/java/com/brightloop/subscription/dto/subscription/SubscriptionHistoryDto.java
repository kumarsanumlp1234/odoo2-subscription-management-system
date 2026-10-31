package com.brightloop.subscription.dto.subscription;

import java.time.LocalDateTime;

public class SubscriptionHistoryDto {

    private Long id;
    private String previousState;
    private String newState;
    private String changedByName;
    private String reason;
    private LocalDateTime timestamp;

    public SubscriptionHistoryDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPreviousState() { return previousState; }
    public void setPreviousState(String previousState) { this.previousState = previousState; }

    public String getNewState() { return newState; }
    public void setNewState(String newState) { this.newState = newState; }

    public String getChangedByName() { return changedByName; }
    public void setChangedByName(String changedByName) { this.changedByName = changedByName; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}

