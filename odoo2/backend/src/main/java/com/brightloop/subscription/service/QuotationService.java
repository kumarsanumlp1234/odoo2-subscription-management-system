package com.brightloop.subscription.service;

import com.brightloop.subscription.dto.quotation.*;
import com.brightloop.subscription.dto.subscription.SubscriptionCreateRequest;
import com.brightloop.subscription.dto.subscription.SubscriptionLineDto;
import com.brightloop.subscription.dto.subscription.SubscriptionResponse;
import com.brightloop.subscription.entity.*;
import com.brightloop.subscription.enums.QuotationStatus;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final QuotationTemplateRepository templateRepository;
    private final UserRepository userRepository;
    private final SubscriptionPlanRepository planRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final AuthService authService;
    private final SubscriptionService subscriptionService;

    public QuotationService(
            QuotationRepository quotationRepository,
            QuotationTemplateRepository templateRepository,
            UserRepository userRepository,
            SubscriptionPlanRepository planRepository,
            ProductRepository productRepository,
            ProductVariantRepository variantRepository,
            AuthService authService,
            @Lazy SubscriptionService subscriptionService) {
        this.quotationRepository = quotationRepository;
        this.templateRepository = templateRepository;
        this.userRepository = userRepository;
        this.planRepository = planRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.authService = authService;
        this.subscriptionService = subscriptionService;
    }

    @Transactional(readOnly = true)
    public Page<QuotationResponse> searchQuotations(Long customerId, QuotationStatus status, String search, Pageable pageable) {
        return quotationRepository.searchQuotations(customerId, status, search, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public QuotationResponse getQuotationById(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with id: " + id));
        return mapToResponse(quotation);
    }

    @Transactional
    public QuotationResponse createQuotation(QuotationRequest request) {
        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        SubscriptionPlan plan = planRepository.findById(request.getSubscriptionPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found with id: " + request.getSubscriptionPlanId()));

        User currentUser = authService.getCurrentAuthenticatedUser();

        Quotation quotation = new Quotation();
        quotation.setQuotationNumber("QT-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        quotation.setCustomer(customer);
        quotation.setSubscriptionPlan(plan);
        quotation.setQuotationDate(request.getQuotationDate() != null ? request.getQuotationDate() : LocalDate.now());
        quotation.setExpiryDate(request.getExpiryDate() != null ? request.getExpiryDate() : quotation.getQuotationDate().plusDays(30));
        quotation.setStatus(QuotationStatus.DRAFT);
        quotation.setNotes(request.getNotes());
        quotation.setCreatedBy(currentUser);

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;

        for (QuotationLineDto lineDto : request.getLines()) {
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

            // Calculate product tax
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

            QuotationLine line = new QuotationLine();
            line.setProduct(product);
            line.setProductVariant(variant);
            line.setQuantity(qty);
            line.setUnitPrice(unitPrice);
            line.setTaxRate(combinedTaxRate);
            line.setTaxAmount(lineTax);
            line.setDiscountAmount(lineDiscount);
            line.setLineTotal(lineTotal);

            quotation.addLine(line);

            subtotal = subtotal.add(lineBase);
            totalTax = totalTax.add(lineTax);
            totalDiscount = totalDiscount.add(lineDiscount);
        }

        quotation.setSubtotal(subtotal);
        quotation.setDiscount(totalDiscount);
        quotation.setTax(totalTax);
        quotation.setTotalAmount(subtotal.subtract(totalDiscount).add(totalTax));

        Quotation saved = quotationRepository.save(quotation);
        return mapToResponse(saved);
    }

    @Transactional
    public QuotationResponse sendQuotation(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with id: " + id));

        if (quotation.getStatus() != QuotationStatus.DRAFT) {
            throw new InvalidStateTransitionException("Only DRAFT quotations can be marked as SENT.");
        }

        quotation.setStatus(QuotationStatus.SENT);
        return mapToResponse(quotationRepository.save(quotation));
    }

    @Transactional
    public QuotationResponse acceptQuotation(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with id: " + id));

        if (quotation.getStatus() != QuotationStatus.SENT && quotation.getStatus() != QuotationStatus.DRAFT) {
            throw new InvalidStateTransitionException("Quotation cannot be ACCEPTED from status " + quotation.getStatus());
        }

        if (LocalDate.now().isAfter(quotation.getExpiryDate())) {
            quotation.setStatus(QuotationStatus.EXPIRED);
            quotationRepository.save(quotation);
            throw new InvalidStateTransitionException("This quotation has expired on " + quotation.getExpiryDate());
        }

        quotation.setStatus(QuotationStatus.ACCEPTED);
        return mapToResponse(quotationRepository.save(quotation));
    }

    @Transactional
    public QuotationResponse rejectQuotation(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with id: " + id));

        quotation.setStatus(QuotationStatus.REJECTED);
        return mapToResponse(quotationRepository.save(quotation));
    }

    @Transactional
    public SubscriptionResponse convertToSubscription(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with id: " + id));

        if (quotation.getStatus() != QuotationStatus.ACCEPTED) {
            throw new InvalidStateTransitionException("Only ACCEPTED quotations can be converted to an active subscription.");
        }

        SubscriptionCreateRequest subRequest = new SubscriptionCreateRequest();
        subRequest.setCustomerId(quotation.getCustomer().getId());
        subRequest.setSubscriptionPlanId(quotation.getSubscriptionPlan().getId());
        subRequest.setStartDate(LocalDate.now());
        subRequest.setBillingFrequency(quotation.getSubscriptionPlan().getBillingFrequency());
        subRequest.setQuotationId(quotation.getId());

        List<SubscriptionLineDto> subLines = new ArrayList<>();
        for (QuotationLine ql : quotation.getLines()) {
            SubscriptionLineDto sld = new SubscriptionLineDto();
            sld.setProductId(ql.getProduct().getId());
            if (ql.getProductVariant() != null) {
                sld.setProductVariantId(ql.getProductVariant().getId());
            }
            sld.setQuantity(ql.getQuantity());
            sld.setUnitPrice(ql.getUnitPrice());
            sld.setTaxRate(ql.getTaxRate());
            sld.setTaxAmount(ql.getTaxAmount());
            sld.setDiscountAmount(ql.getDiscountAmount());
            sld.setLineTotal(ql.getLineTotal());
            subLines.add(sld);
        }
        subRequest.setLines(subLines);

        return subscriptionService.createSubscription(subRequest);
    }

    // Quotation Templates
    @Transactional(readOnly = true)
    public List<TemplateResponse> getAllTemplates() {
        return templateRepository.findAll().stream().map(this::mapTemplateToResponse).collect(Collectors.toList());
    }

    @Transactional
    public TemplateResponse createTemplate(TemplateRequest req) {
        QuotationTemplate template = new QuotationTemplate();
        template.setTemplateName(req.getTemplateName());
        template.setDescription(req.getDescription());
        template.setValidityDays(req.getValidityDays() != null ? req.getValidityDays() : 30);
        template.setDefaultDiscount(req.getDefaultDiscount() != null ? req.getDefaultDiscount() : BigDecimal.ZERO);

        if (req.getDefaultPlanId() != null) {
            SubscriptionPlan plan = planRepository.findById(req.getDefaultPlanId()).orElse(null);
            template.setDefaultPlan(plan);
        }

        QuotationTemplate saved = templateRepository.save(template);
        return mapTemplateToResponse(saved);
    }

    public TemplateResponse mapTemplateToResponse(QuotationTemplate t) {
        TemplateResponse res = new TemplateResponse();
        res.setId(t.getId());
        res.setTemplateName(t.getTemplateName());
        res.setDescription(t.getDescription());
        res.setValidityDays(t.getValidityDays());
        res.setDefaultDiscount(t.getDefaultDiscount());
        if (t.getDefaultPlan() != null) {
            res.setDefaultPlanId(t.getDefaultPlan().getId());
            res.setDefaultPlanName(t.getDefaultPlan().getPlanName());
        }
        res.setCreatedAt(t.getCreatedAt());
        return res;
    }

    public QuotationResponse mapToResponse(Quotation q) {
        QuotationResponse res = new QuotationResponse();
        res.setId(q.getId());
        res.setQuotationNumber(q.getQuotationNumber());
        res.setCustomerId(q.getCustomer().getId());
        res.setCustomerName(q.getCustomer().getFullName());
        res.setCustomerEmail(q.getCustomer().getEmail());
        res.setSubscriptionPlanId(q.getSubscriptionPlan().getId());
        res.setPlanName(q.getSubscriptionPlan().getPlanName());
        res.setQuotationDate(q.getQuotationDate());
        res.setExpiryDate(q.getExpiryDate());
        res.setSubtotal(q.getSubtotal());
        res.setDiscount(q.getDiscount());
        res.setTax(q.getTax());
        res.setTotalAmount(q.getTotalAmount());
        res.setStatus(q.getStatus());
        res.setNotes(q.getNotes());
        if (q.getCreatedBy() != null) {
            res.setCreatedByName(q.getCreatedBy().getFullName());
        }
        res.setCreatedAt(q.getCreatedAt());

        res.setLines(q.getLines().stream().map(l -> {
            QuotationLineDto dto = new QuotationLineDto();
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

        return res;
    }
}

