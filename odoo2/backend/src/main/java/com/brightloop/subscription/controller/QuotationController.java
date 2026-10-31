package com.brightloop.subscription.controller;

import com.brightloop.subscription.dto.common.ApiResponse;
import com.brightloop.subscription.dto.quotation.*;
import com.brightloop.subscription.dto.subscription.SubscriptionResponse;
import com.brightloop.subscription.enums.QuotationStatus;
import com.brightloop.subscription.service.QuotationService;
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
@RequestMapping("/api/quotations")
public class QuotationController {

    private final QuotationService quotationService;

    public QuotationController(QuotationService quotationService) {
        this.quotationService = quotationService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Page<QuotationResponse>>> searchQuotations(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) QuotationStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<QuotationResponse> page = quotationService.searchQuotations(customerId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<QuotationResponse>> getQuotationById(@PathVariable Long id) {
        QuotationResponse response = quotationService.getQuotationById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<QuotationResponse>> createQuotation(@Valid @RequestBody QuotationRequest request) {
        QuotationResponse response = quotationService.createQuotation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Quotation created successfully", response));
    }

    @PostMapping("/{id}/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<QuotationResponse>> sendQuotation(@PathVariable Long id) {
        QuotationResponse response = quotationService.sendQuotation(id);
        return ResponseEntity.ok(ApiResponse.success("Quotation marked as SENT", response));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<QuotationResponse>> acceptQuotation(@PathVariable Long id) {
        QuotationResponse response = quotationService.acceptQuotation(id);
        return ResponseEntity.ok(ApiResponse.success("Quotation ACCEPTED", response));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<QuotationResponse>> rejectQuotation(@PathVariable Long id) {
        QuotationResponse response = quotationService.rejectQuotation(id);
        return ResponseEntity.ok(ApiResponse.success("Quotation REJECTED", response));
    }

    @PostMapping("/{id}/convert-to-subscription")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> convertToSubscription(@PathVariable Long id) {
        SubscriptionResponse response = quotationService.convertToSubscription(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Quotation successfully converted to active subscription", response));
    }

    @GetMapping("/templates")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<TemplateResponse>>> getAllTemplates() {
        List<TemplateResponse> list = quotationService.getAllTemplates();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/templates")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TemplateResponse>> createTemplate(@Valid @RequestBody TemplateRequest request) {
        TemplateResponse response = quotationService.createTemplate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Quotation template created", response));
    }
}

