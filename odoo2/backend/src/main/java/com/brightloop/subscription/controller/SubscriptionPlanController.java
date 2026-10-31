package com.brightloop.subscription.controller;

import com.brightloop.subscription.dto.common.ApiResponse;
import com.brightloop.subscription.dto.plan.PlanRequest;
import com.brightloop.subscription.dto.plan.PlanResponse;
import com.brightloop.subscription.service.SubscriptionPlanService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
public class SubscriptionPlanController {

    private final SubscriptionPlanService planService;

    public SubscriptionPlanController(SubscriptionPlanService planService) {
        this.planService = planService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PlanResponse>>> searchPlans(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<PlanResponse> page = planService.searchPlans(search, active, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<PlanResponse>>> getActivePlans() {
        List<PlanResponse> list = planService.getActivePlans();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PlanResponse>> getPlanById(@PathVariable Long id) {
        PlanResponse response = planService.getPlanById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PlanResponse>> createPlan(@Valid @RequestBody PlanRequest request) {
        PlanResponse response = planService.createPlan(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Subscription plan created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PlanResponse>> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody PlanRequest request) {
        PlanResponse response = planService.updatePlan(id, request);
        return ResponseEntity.ok(ApiResponse.success("Subscription plan updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable Long id) {
        planService.deletePlan(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription plan deactivated successfully", null));
    }
}

