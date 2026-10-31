package com.brightloop.subscription.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_history")
public class SubscriptionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    @Column(name = "previous_state", nullable = false, length = 50)
    private String previousState;

    @Column(name = "new_state", nullable = false, length = 50)
    private String newState;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private User changedBy;

    @Column(length = 255)
    private String reason;

    @Column(name = "timestamp", updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public SubscriptionHistory() {}

    public SubscriptionHistory(Subscription subscription, String previousState, String newState, User changedBy, String reason) {
        this.subscription = subscription;
        this.previousState = previousState;
        this.newState = newState;
        this.changedBy = changedBy;
        this.reason = reason;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Subscription getSubscription() { return subscription; }
    public void setSubscription(Subscription subscription) { this.subscription = subscription; }

    public String getPreviousState() { return previousState; }
    public void setPreviousState(String previousState) { this.previousState = previousState; }

    public String getNewState() { return newState; }
    public void setNewState(String newState) { this.newState = newState; }

    public User getChangedBy() { return changedBy; }
    public void setChangedBy(User changedBy) { this.changedBy = changedBy; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}

