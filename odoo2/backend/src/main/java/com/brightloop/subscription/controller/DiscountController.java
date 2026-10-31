package com.brightloop.subscription.controller;

import com.brightloop.subscription.dto.common.ApiResponse;
import com.brightloop.subscription.dto.discount.DiscountRequest;
import com.brightloop.subscription.dto.discount.DiscountResponse;
import com.brightloop.subscription.service.DiscountService;
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
@RequestMapping("/api/discounts")
public class DiscountController {

    private final DiscountService discountService;

    public DiscountController(DiscountService discountService) {
        this.discountService = discountService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<DiscountResponse>>> searchDiscounts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<DiscountResponse> page = discountService.searchDiscounts(search, active, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<DiscountResponse>>> getActiveDiscounts() {
        List<DiscountResponse> list = discountService.getActiveDiscounts();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DiscountResponse>> getDiscountById(@PathVariable Long id) {
        DiscountResponse response = discountService.getDiscountById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DiscountResponse>> createDiscount(@Valid @RequestBody DiscountRequest request) {
        DiscountResponse response = discountService.createDiscount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Discount created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DiscountResponse>> updateDiscount(
            @PathVariable Long id,
            @Valid @RequestBody DiscountRequest request) {
        DiscountResponse response = discountService.updateDiscount(id, request);
        return ResponseEntity.ok(ApiResponse.success("Discount updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDiscount(@PathVariable Long id) {
        discountService.deleteDiscount(id);
        return ResponseEntity.ok(ApiResponse.success("Discount deactivated successfully", null));
    }
}

