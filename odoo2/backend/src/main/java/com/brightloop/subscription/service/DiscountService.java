package com.brightloop.subscription.service;

import com.brightloop.subscription.dto.discount.DiscountRequest;
import com.brightloop.subscription.dto.discount.DiscountResponse;
import com.brightloop.subscription.entity.*;
import com.brightloop.subscription.enums.DiscountType;
import com.brightloop.subscription.exception.BadRequestException;
import com.brightloop.subscription.exception.ResourceNotFoundException;
import com.brightloop.subscription.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DiscountService {

    private final DiscountRepository discountRepository;
    private final DiscountUsageRepository discountUsageRepository;
    private final ProductRepository productRepository;
    private final SubscriptionPlanRepository planRepository;

    public DiscountService(
            DiscountRepository discountRepository,
            DiscountUsageRepository discountUsageRepository,
            ProductRepository productRepository,
            SubscriptionPlanRepository planRepository) {
        this.discountRepository = discountRepository;
        this.discountUsageRepository = discountUsageRepository;
        this.productRepository = productRepository;
        this.planRepository = planRepository;
    }

    @Transactional(readOnly = true)
    public Page<DiscountResponse> searchDiscounts(String search, Boolean active, Pageable pageable) {
        return discountRepository.searchDiscounts(search, active, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<DiscountResponse> getActiveDiscounts() {
        return discountRepository.findByActiveTrue().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DiscountResponse getDiscountById(Long id) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount rule not found with id: " + id));
        return mapToResponse(discount);
    }

    @Transactional
    public DiscountResponse createDiscount(DiscountRequest request) {
        Discount discount = new Discount(request.getDiscountName(), request.getDiscountType(), request.getDiscountValue());
        discount.setMinimumPurchaseAmount(request.getMinimumPurchaseAmount() != null ? request.getMinimumPurchaseAmount() : BigDecimal.ZERO);
        discount.setMinimumQuantity(request.getMinimumQuantity() != null ? request.getMinimumQuantity() : 1);
        discount.setStartDate(request.getStartDate());
        discount.setEndDate(request.getEndDate());
        discount.setMaximumUsage(request.getMaximumUsage() != null ? request.getMaximumUsage() : 0);
        discount.setActive(request.getActive() != null ? request.getActive() : true);

        if (request.getApplicableProductIds() != null && !request.getApplicableProductIds().isEmpty()) {
            discount.setApplicableProducts(new HashSet<>(productRepository.findAllById(request.getApplicableProductIds())));
        }
        if (request.getApplicablePlanIds() != null && !request.getApplicablePlanIds().isEmpty()) {
            discount.setApplicablePlans(new HashSet<>(planRepository.findAllById(request.getApplicablePlanIds())));
        }

        Discount saved = discountRepository.save(discount);
        return mapToResponse(saved);
    }

    @Transactional
    public DiscountResponse updateDiscount(Long id, DiscountRequest request) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount rule not found with id: " + id));

        discount.setDiscountName(request.getDiscountName());
        discount.setDiscountType(request.getDiscountType());
        discount.setDiscountValue(request.getDiscountValue());
        discount.setMinimumPurchaseAmount(request.getMinimumPurchaseAmount());
        discount.setMinimumQuantity(request.getMinimumQuantity());
        discount.setStartDate(request.getStartDate());
        discount.setEndDate(request.getEndDate());
        discount.setMaximumUsage(request.getMaximumUsage());
        if (request.getActive() != null) discount.setActive(request.getActive());

        if (request.getApplicableProductIds() != null) {
            discount.setApplicableProducts(new HashSet<>(productRepository.findAllById(request.getApplicableProductIds())));
        }
        if (request.getApplicablePlanIds() != null) {
            discount.setApplicablePlans(new HashSet<>(planRepository.findAllById(request.getApplicablePlanIds())));
        }

        Discount saved = discountRepository.save(discount);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteDiscount(Long id) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount rule not found with id: " + id));
        discount.setActive(false);
        discountRepository.save(discount);
    }

    public BigDecimal calculateDiscountAmount(Discount discount, BigDecimal subtotal, int quantity, LocalDate date) {
        if (!discount.isValidForDate(date)) {
            return BigDecimal.ZERO;
        }

        if (discount.getMinimumPurchaseAmount() != null && subtotal.compareTo(discount.getMinimumPurchaseAmount()) < 0) {
            return BigDecimal.ZERO;
        }

        if (discount.getMinimumQuantity() != null && quantity < discount.getMinimumQuantity()) {
            return BigDecimal.ZERO;
        }

        BigDecimal calculatedDiscount;
        if (discount.getDiscountType() == DiscountType.PERCENTAGE) {
            calculatedDiscount = subtotal.multiply(discount.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            calculatedDiscount = discount.getDiscountValue();
        }

        // Never exceed the subtotal
        if (calculatedDiscount.compareTo(subtotal) > 0) {
            calculatedDiscount = subtotal;
        }

        return calculatedDiscount;
    }

    @Transactional
    public void recordDiscountUsage(Discount discount, User customer, Subscription subscription, Invoice invoice, BigDecimal discountAmount) {
        if (discountUsageRepository.existsByDiscountIdAndInvoiceId(discount.getId(), invoice.getId())) {
            throw new BadRequestException("Discount has already been applied to invoice " + invoice.getInvoiceNumber());
        }

        DiscountUsage usage = new DiscountUsage(discount, customer, subscription, invoice, discountAmount);
        discountUsageRepository.save(usage);

        discount.setUsageCount(discount.getUsageCount() + 1);
        discountRepository.save(discount);
    }

    public DiscountResponse mapToResponse(Discount discount) {
        DiscountResponse res = new DiscountResponse();
        res.setId(discount.getId());
        res.setDiscountName(discount.getDiscountName());
        res.setDiscountType(discount.getDiscountType());
        res.setDiscountValue(discount.getDiscountValue());
        res.setMinimumPurchaseAmount(discount.getMinimumPurchaseAmount());
        res.setMinimumQuantity(discount.getMinimumQuantity());
        res.setStartDate(discount.getStartDate());
        res.setEndDate(discount.getEndDate());
        res.setMaximumUsage(discount.getMaximumUsage());
        res.setUsageCount(discount.getUsageCount());
        res.setActive(discount.getActive());
        res.setCreatedAt(discount.getCreatedAt());

        res.setApplicableProductIds(discount.getApplicableProducts().stream().map(Product::getId).collect(Collectors.toSet()));
        res.setApplicablePlanIds(discount.getApplicablePlans().stream().map(SubscriptionPlan::getId).collect(Collectors.toSet()));
        return res;
    }
}

