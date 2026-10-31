package com.brightloop.subscription.service;

import com.brightloop.subscription.dto.subscription.*;
import com.brightloop.subscription.entity.*;
import com.brightloop.subscription.enums.BillingFrequency;
import com.brightloop.subscription.enums.SubscriptionStatus;
import com.brightloop.subscription.exception.BadRequestException;
import com.brightloop.subscription.exception.InvalidStateTransitionException;
import com.brightloop.subscription.exception.ResourceNotFoundException;
import com.brightloop.subscription.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionLineRepository lineRepository;
    private final SubscriptionHistoryRepository historyRepository;
    private final SubscriptionPlanRepository planRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final AuthService authService;
    private final BillingService billingService;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            SubscriptionLineRepository lineRepository,
            SubscriptionHistoryRepository historyRepository,
            SubscriptionPlanRepository planRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            ProductVariantRepository variantRepository,
            AuthService authService,
            @Lazy BillingService billingService) {
        this.subscriptionRepository = subscriptionRepository;
        this.lineRepository = lineRepository;
        this.historyRepository = historyRepository;
        this.planRepository = planRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.authService = authService;
        this.billingService = billingService;
    }

    @Transactional(readOnly = true)
    public Page<SubscriptionResponse> searchSubscriptions(Long customerId, SubscriptionStatus status, String search, Pageable pageable) {
        return subscriptionRepository.searchSubscriptions(customerId, status, search, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<SubscriptionResponse> getSubscriptionsByCustomer(Long customerId, Pageable pageable) {
        return subscriptionRepository.findByCustomerId(customerId, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public SubscriptionResponse getSubscriptionById(Long id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));
        return mapToResponse(subscription);
    }

    @Transactional
    public SubscriptionResponse createSubscription(SubscriptionCreateRequest request) {
        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        SubscriptionPlan plan = planRepository.findById(request.getSubscriptionPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + request.getSubscriptionPlanId()));

        User currentUser = authService.getCurrentAuthenticatedUser();

        Subscription subscription = new Subscription();
        subscription.setSubscriptionNumber("SUB-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        subscription.setCustomer(customer);
        subscription.setSubscriptionPlan(plan);
        subscription.setStartDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now());
        subscription.setEndDate(request.getEndDate());
        subscription.setNextBillingDate(subscription.getStartDate());
        subscription.setBillingFrequency(request.getBillingFrequency() != null ? request.getBillingFrequency() : plan.getBillingFrequency());
        subscription.setPaymentTerms(request.getPaymentTerms() != null ? request.getPaymentTerms() : "Immediate");
        subscription.setStatus(SubscriptionStatus.DRAFT);
        subscription.setCreatedBy(currentUser);

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;

        for (SubscriptionLineDto lineDto : request.getLines()) {
            Product product = productRepository.findById(lineDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + lineDto.getProductId()));

            ProductVariant variant = null;
            BigDecimal unitPrice = product.getSalesPrice();

            if (lineDto.getProductVariantId() != null) {
                variant = variantRepository.findById(lineDto.getProductVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id: " + lineDto.getProductVariantId()));
                unitPrice = unitPrice.add(variant.getAdditionalPrice());
            }

            int qty = lineDto.getQuantity() != null && lineDto.getQuantity() > 0 ? lineDto.getQuantity() : 1;
            BigDecimal lineBase = unitPrice.multiply(BigDecimal.valueOf(qty));

            BigDecimal combinedTaxRate = product.getTaxes().stream()
                    .map(Tax::getTaxRate)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal lineDiscount = BigDecimal.ZERO;
            if (request.getOverallDiscountPercent() != null && request.getOverallDiscountPercent().compareTo(BigDecimal.ZERO) > 0) {
                lineDiscount = lineBase.multiply(request.getOverallDiscountPercent()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }

            BigDecimal taxableAmount = lineBase.subtract(lineDiscount);
            BigDecimal lineTax = taxableAmount.multiply(combinedTaxRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = taxableAmount.add(lineTax);

            SubscriptionLine line = new SubscriptionLine();
            line.setProduct(product);
            line.setProductVariant(variant);
            line.setQuantity(qty);
            line.setUnitPrice(unitPrice);
            line.setTaxRate(combinedTaxRate);
            line.setTaxAmount(lineTax);
            line.setDiscountAmount(lineDiscount);
            line.setLineTotal(lineTotal);

            subscription.addLine(line);

            subtotal = subtotal.add(lineBase);
            totalTax = totalTax.add(lineTax);
            totalDiscount = totalDiscount.add(lineDiscount);
        }

        subscription.setSubtotal(subtotal);
        subscription.setDiscount(totalDiscount);
        subscription.setTax(totalTax);
        subscription.setTotalAmount(subtotal.subtract(totalDiscount).add(totalTax));

        Subscription saved = subscriptionRepository.save(subscription);
        recordHistory(saved, "NONE", "DRAFT", currentUser, "Subscription initialized in DRAFT state.");

        return mapToResponse(saved);
    }

    // State Transitions
    @Transactional
    public SubscriptionResponse confirmSubscription(Long id) {
        Subscription sub = getSubscriptionEntity(id);
        if (sub.getStatus() != SubscriptionStatus.DRAFT && sub.getStatus() != SubscriptionStatus.QUOTATION) {
            throw new InvalidStateTransitionException("Cannot CONFIRM subscription from status: " + sub.getStatus());
        }

        transitionState(sub, SubscriptionStatus.CONFIRMED, "Subscription terms agreed and confirmed.");
        return mapToResponse(subscriptionRepository.save(sub));
    }

    @Transactional
    public SubscriptionResponse activateSubscription(Long id) {
        Subscription sub = getSubscriptionEntity(id);
        if (sub.getStatus() != SubscriptionStatus.CONFIRMED && sub.getStatus() != SubscriptionStatus.DRAFT) {
            throw new InvalidStateTransitionException("Cannot ACTIVATE subscription from status: " + sub.getStatus());
        }

        transitionState(sub, SubscriptionStatus.ACTIVE, "Subscription activated.");
        Subscription saved = subscriptionRepository.save(sub);

        // If nextBillingDate is today or earlier, trigger invoice generation immediately
        if (!saved.getNextBillingDate().isAfter(LocalDate.now())) {
            billingService.processSingleSubscriptionBilling(saved, LocalDate.now());
        }

        return mapToResponse(saved);
    }

    @Transactional
    public SubscriptionResponse pauseSubscription(Long id, String reason) {
        Subscription sub = getSubscriptionEntity(id);
        if (sub.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new InvalidStateTransitionException("Only ACTIVE subscriptions can be paused.");
        }

        if (!sub.getSubscriptionPlan().getAllowPause()) {
            throw new BadRequestException("The plan '" + sub.getSubscriptionPlan().getPlanName() + "' does not permit pausing.");
        }

        transitionState(sub, SubscriptionStatus.PAUSED, reason != null ? reason : "Subscription paused by request.");
        return mapToResponse(subscriptionRepository.save(sub));
    }

    @Transactional
    public SubscriptionResponse resumeSubscription(Long id) {
        Subscription sub = getSubscriptionEntity(id);
        if (sub.getStatus() != SubscriptionStatus.PAUSED) {
            throw new InvalidStateTransitionException("Only PAUSED subscriptions can be resumed.");
        }

        transitionState(sub, SubscriptionStatus.ACTIVE, "Subscription resumed to active status.");
        return mapToResponse(subscriptionRepository.save(sub));
    }

    @Transactional
    public SubscriptionResponse closeSubscription(Long id, String reason) {
        Subscription sub = getSubscriptionEntity(id);
        if (sub.getStatus() == SubscriptionStatus.CLOSED || sub.getStatus() == SubscriptionStatus.CANCELLED) {
            throw new InvalidStateTransitionException("Subscription is already closed or cancelled.");
        }

        if (sub.getEndDate() != null && LocalDate.now().isBefore(sub.getEndDate()) && !sub.getSubscriptionPlan().getAllowEarlyClosure()) {
            throw new BadRequestException("The plan does not allow early closure before its end date: " + sub.getEndDate());
        }

        transitionState(sub, SubscriptionStatus.CLOSED, reason != null ? reason : "Subscription reached end of term and closed.");
        return mapToResponse(subscriptionRepository.save(sub));
    }

    @Transactional
    public SubscriptionResponse cancelSubscription(Long id, String reason) {
        Subscription sub = getSubscriptionEntity(id);
        if (sub.getStatus() == SubscriptionStatus.CLOSED || sub.getStatus() == SubscriptionStatus.CANCELLED) {
            throw new InvalidStateTransitionException("Subscription is already terminated.");
        }

        transitionState(sub, SubscriptionStatus.CANCELLED, reason != null ? reason : "Subscription cancelled by customer or staff.");
        return mapToResponse(subscriptionRepository.save(sub));
    }

    @Transactional
    public SubscriptionResponse renewSubscription(Long id) {
        Subscription sub = getSubscriptionEntity(id);
        if (!sub.getSubscriptionPlan().getAllowManualRenewal()) {
            throw new BadRequestException("Plan does not permit manual renewals.");
        }

        LocalDate newStart = (sub.getEndDate() != null) ? sub.getEndDate().plusDays(1) : LocalDate.now();
        LocalDate newEnd = calculateNextBillingDate(newStart, sub.getBillingFrequency(), sub.getSubscriptionPlan().getBillingInterval());

        sub.setEndDate(newEnd);
        sub.setStatus(SubscriptionStatus.ACTIVE);
        transitionState(sub, SubscriptionStatus.ACTIVE, "Subscription manually renewed until " + newEnd);

        return mapToResponse(subscriptionRepository.save(sub));
    }

    public LocalDate calculateNextBillingDate(LocalDate fromDate, BillingFrequency freq, int interval) {
        switch (freq) {
            case DAILY:
                return fromDate.plusDays(interval);
            case WEEKLY:
                return fromDate.plusWeeks(interval);
            case MONTHLY:
                return fromDate.plusMonths(interval);
            case YEARLY:
                return fromDate.plusYears(interval);
            default:
                return fromDate.plusMonths(1);
        }
    }

    private void transitionState(Subscription sub, SubscriptionStatus newState, String reason) {
        String oldState = sub.getStatus().name();
        sub.setStatus(newState);
        recordHistory(sub, oldState, newState.name(), authService.getCurrentAuthenticatedUser(), reason);
    }

    private void recordHistory(Subscription sub, String previousState, String newState, User user, String reason) {
        SubscriptionHistory history = new SubscriptionHistory(sub, previousState, newState, user, reason);
        historyRepository.save(history);
    }

    public Subscription getSubscriptionEntity(Long id) {
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));
    }

    public SubscriptionResponse mapToResponse(Subscription s) {
        SubscriptionResponse res = new SubscriptionResponse();
        res.setId(s.getId());
        res.setSubscriptionNumber(s.getSubscriptionNumber());
        res.setCustomerId(s.getCustomer().getId());
        res.setCustomerName(s.getCustomer().getFullName());
        res.setCustomerEmail(s.getCustomer().getEmail());
        res.setSubscriptionPlanId(s.getSubscriptionPlan().getId());
        res.setPlanName(s.getSubscriptionPlan().getPlanName());
        res.setStartDate(s.getStartDate());
        res.setEndDate(s.getEndDate());
        res.setNextBillingDate(s.getNextBillingDate());
        res.setBillingFrequency(s.getBillingFrequency());
        res.setPaymentTerms(s.getPaymentTerms());
        res.setStatus(s.getStatus());
        res.setSubtotal(s.getSubtotal());
        res.setDiscount(s.getDiscount());
        res.setTax(s.getTax());
        res.setTotalAmount(s.getTotalAmount());
        if (s.getCreatedBy() != null) {
            res.setCreatedByName(s.getCreatedBy().getFullName());
        }
        res.setCreatedAt(s.getCreatedAt());
        res.setUpdatedAt(s.getUpdatedAt());

        res.setLines(s.getLines().stream().map(l -> {
            SubscriptionLineDto dto = new SubscriptionLineDto();
            dto.setId(l.getId());
            dto.setProductId(l.getProduct().getId());
            dto.setProductName(l.getProduct().getName());
            if (l.getProductVariant() != null) {
                dto.setProductVariantId(l.getProductVariant().getId());
                dto.setVariantName(l.getProductVariant().getVariantName());
            }
            dto.setQuantity(l.getQuantity());
            dto.setUnitPrice(l.getUnitPrice());
            dto.setTaxRate(l.getTaxRate());
            dto.setTaxAmount(l.getTaxAmount());
            dto.setDiscountAmount(l.getDiscountAmount());
            dto.setLineTotal(l.getLineTotal());
            return dto;
        }).collect(Collectors.toList()));

        res.setHistory(s.getHistory().stream().map(h -> {
            SubscriptionHistoryDto dto = new SubscriptionHistoryDto();
            dto.setId(h.getId());
            dto.setPreviousState(h.getPreviousState());
            dto.setNewState(h.getNewState());
            if (h.getChangedBy() != null) {
                dto.setChangedByName(h.getChangedBy().getFullName());
            }
            dto.setReason(h.getReason());
            dto.setTimestamp(h.getTimestamp());
            return dto;
        }).collect(Collectors.toList()));

        return res;
    }
}

