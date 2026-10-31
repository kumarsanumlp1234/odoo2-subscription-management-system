package com.brightloop.subscription.service;

import com.brightloop.subscription.dto.plan.PlanRequest;
import com.brightloop.subscription.dto.plan.PlanResponse;
import com.brightloop.subscription.entity.SubscriptionPlan;
import com.brightloop.subscription.exception.ResourceNotFoundException;
import com.brightloop.subscription.repository.SubscriptionPlanRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubscriptionPlanService {

    private final SubscriptionPlanRepository planRepository;

    public SubscriptionPlanService(SubscriptionPlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Transactional(readOnly = true)
    public Page<PlanResponse> searchPlans(String search, Boolean active, Pageable pageable) {
        return planRepository.searchPlans(search, active, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<PlanResponse> getActivePlans() {
        return planRepository.findByActiveTrue().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PlanResponse getPlanById(Long id) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found with id: " + id));
        return mapToResponse(plan);
    }

    @Transactional
    public PlanResponse createPlan(PlanRequest request) {
        SubscriptionPlan plan = new SubscriptionPlan(
                request.getPlanName(),
                request.getBillingFrequency(),
                request.getBillingInterval() != null ? request.getBillingInterval() : 1,
                request.getBasePrice()
        );
        plan.setDescription(request.getDescription());
        plan.setMinimumQuantity(request.getMinimumQuantity() != null ? request.getMinimumQuantity() : 1);
        plan.setAvailableFrom(request.getAvailableFrom());
        plan.setAvailableUntil(request.getAvailableUntil());
        plan.setAutoClose(request.getAutoClose() != null ? request.getAutoClose() : false);
        plan.setAllowEarlyClosure(request.getAllowEarlyClosure() != null ? request.getAllowEarlyClosure() : true);
        plan.setAllowPause(request.getAllowPause() != null ? request.getAllowPause() : true);
        plan.setAllowManualRenewal(request.getAllowManualRenewal() != null ? request.getAllowManualRenewal() : true);
        plan.setActive(request.getActive() != null ? request.getActive() : true);

        SubscriptionPlan saved = planRepository.save(plan);
        return mapToResponse(saved);
    }

    @Transactional
    public PlanResponse updatePlan(Long id, PlanRequest request) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found with id: " + id));

        plan.setPlanName(request.getPlanName());
        plan.setDescription(request.getDescription());
        plan.setBillingFrequency(request.getBillingFrequency());
        plan.setBillingInterval(request.getBillingInterval());
        plan.setBasePrice(request.getBasePrice());
        plan.setMinimumQuantity(request.getMinimumQuantity());
        plan.setAvailableFrom(request.getAvailableFrom());
        plan.setAvailableUntil(request.getAvailableUntil());
        plan.setAutoClose(request.getAutoClose());
        plan.setAllowEarlyClosure(request.getAllowEarlyClosure());
        plan.setAllowPause(request.getAllowPause());
        plan.setAllowManualRenewal(request.getAllowManualRenewal());
        if (request.getActive() != null) plan.setActive(request.getActive());

        SubscriptionPlan saved = planRepository.save(plan);
        return mapToResponse(saved);
    }

    @Transactional
    public void deletePlan(Long id) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found with id: " + id));
        plan.setActive(false);
        planRepository.save(plan);
    }

    public PlanResponse mapToResponse(SubscriptionPlan plan) {
        PlanResponse res = new PlanResponse();
        res.setId(plan.getId());
        res.setPlanName(plan.getPlanName());
        res.setDescription(plan.getDescription());
        res.setBillingFrequency(plan.getBillingFrequency());
        res.setBillingInterval(plan.getBillingInterval());
        res.setBasePrice(plan.getBasePrice());
        res.setMinimumQuantity(plan.getMinimumQuantity());
        res.setAvailableFrom(plan.getAvailableFrom());
        res.setAvailableUntil(plan.getAvailableUntil());
        res.setAutoClose(plan.getAutoClose());
        res.setAllowEarlyClosure(plan.getAllowEarlyClosure());
        res.setAllowPause(plan.getAllowPause());
        res.setAllowManualRenewal(plan.getAllowManualRenewal());
        res.setActive(plan.getActive());
        res.setCreatedAt(plan.getCreatedAt());
        return res;
    }
}

