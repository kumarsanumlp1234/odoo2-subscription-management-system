package com.brightloop.subscription.controller;

import com.brightloop.subscription.dto.common.ApiResponse;
import com.brightloop.subscription.dto.dashboard.DashboardSummaryDto;
import com.brightloop.subscription.dto.dashboard.RevenueAnalyticsDto;
import com.brightloop.subscription.dto.dashboard.SubscriptionAnalyticsDto;
import com.brightloop.subscription.service.BillingService;
import com.brightloop.subscription.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class DashboardController {

    private final DashboardService dashboardService;
    private final BillingService billingService;

    public DashboardController(DashboardService dashboardService, BillingService billingService) {
        this.dashboardService = dashboardService;
        this.billingService = billingService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboardSummary() {
        DashboardSummaryDto summary = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<RevenueAnalyticsDto>> getRevenueAnalytics() {
        RevenueAnalyticsDto analytics = dashboardService.getRevenueAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<ApiResponse<SubscriptionAnalyticsDto>> getSubscriptionAnalytics() {
        SubscriptionAnalyticsDto analytics = dashboardService.getSubscriptionAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @PostMapping("/trigger-billing")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerBillingCycle(
            @RequestParam(required = false) String date) {
        LocalDate asOfDate = (date != null && !date.isBlank()) ? LocalDate.parse(date) : LocalDate.now();
        int billed = billingService.processDueSubscriptions(asOfDate);
        return ResponseEntity.ok(ApiResponse.success("Recurring billing engine executed", Map.of(
                "date", asOfDate.toString(),
                "invoicesGenerated", billed
        )));
    }
}

