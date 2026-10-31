package com.brightloop.subscription.controller;

import com.brightloop.subscription.dto.common.ApiResponse;
import com.brightloop.subscription.dto.subscription.SubscriptionActionRequest;
import com.brightloop.subscription.dto.subscription.SubscriptionCreateRequest;
import com.brightloop.subscription.dto.subscription.SubscriptionResponse;
import com.brightloop.subscription.enums.SubscriptionStatus;
import com.brightloop.subscription.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Page<SubscriptionResponse>>> searchSubscriptions(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) SubscriptionStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<SubscriptionResponse> page = subscriptionService.searchSubscriptions(customerId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> getSubscriptionById(@PathVariable Long id) {
        SubscriptionResponse response = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> createSubscription(@Valid @RequestBody SubscriptionCreateRequest request) {
        SubscriptionResponse response = subscriptionService.createSubscription(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Subscription created successfully", response));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> confirmSubscription(@PathVariable Long id) {
        SubscriptionResponse response = subscriptionService.confirmSubscription(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription confirmed", response));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> activateSubscription(@PathVariable Long id) {
        SubscriptionResponse response = subscriptionService.activateSubscription(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription activated", response));
    }

    @PostMapping("/{id}/pause")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> pauseSubscription(
            @PathVariable Long id,
            @RequestBody(required = false) SubscriptionActionRequest action) {
        String reason = action != null ? action.getReason() : "Paused by user";
        SubscriptionResponse response = subscriptionService.pauseSubscription(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Subscription paused", response));
    }

    @PostMapping("/{id}/resume")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> resumeSubscription(@PathVariable Long id) {
        SubscriptionResponse response = subscriptionService.resumeSubscription(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription resumed", response));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> closeSubscription(
            @PathVariable Long id,
            @RequestBody(required = false) SubscriptionActionRequest action) {
        String reason = action != null ? action.getReason() : "Closed by request";
        SubscriptionResponse response = subscriptionService.closeSubscription(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Subscription closed", response));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> cancelSubscription(
            @PathVariable Long id,
            @RequestBody(required = false) SubscriptionActionRequest action) {
        String reason = action != null ? action.getReason() : "Cancelled";
        SubscriptionResponse response = subscriptionService.cancelSubscription(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Subscription cancelled", response));
    }

    @PostMapping("/{id}/renew")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> renewSubscription(@PathVariable Long id) {
        SubscriptionResponse response = subscriptionService.renewSubscription(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription renewed", response));
    }
}

