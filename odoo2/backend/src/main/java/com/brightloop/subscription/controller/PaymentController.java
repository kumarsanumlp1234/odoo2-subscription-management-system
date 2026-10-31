package com.brightloop.subscription.controller;

import com.brightloop.subscription.dto.common.ApiResponse;
import com.brightloop.subscription.dto.payment.PaymentRequest;
import com.brightloop.subscription.dto.payment.PaymentResponse;
import com.brightloop.subscription.service.PaymentService;
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
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> searchPayments(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<PaymentResponse> page = paymentService.searchPayments(customerId, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/invoice/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsForInvoice(@PathVariable Long invoiceId) {
        List<PaymentResponse> list = paymentService.getPaymentsForInvoice(invoiceId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PaymentResponse>> recordPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.recordPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Payment recorded successfully", response));
    }
}

