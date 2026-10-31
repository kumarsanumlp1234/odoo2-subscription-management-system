package com.brightloop.subscription.controller;

import com.brightloop.subscription.dto.common.ApiResponse;
import com.brightloop.subscription.dto.tax.TaxRequest;
import com.brightloop.subscription.dto.tax.TaxResponse;
import com.brightloop.subscription.service.TaxService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/taxes")
public class TaxController {

    private final TaxService taxService;

    public TaxController(TaxService taxService) {
        this.taxService = taxService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaxResponse>>> getAllTaxes() {
        List<TaxResponse> list = taxService.getAllTaxes();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<TaxResponse>>> getActiveTaxes() {
        List<TaxResponse> list = taxService.getActiveTaxes();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxResponse>> getTaxById(@PathVariable Long id) {
        TaxResponse response = taxService.getTaxById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TaxResponse>> createTax(@Valid @RequestBody TaxRequest request) {
        TaxResponse response = taxService.createTax(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Tax rule created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TaxResponse>> updateTax(
            @PathVariable Long id,
            @Valid @RequestBody TaxRequest request) {
        TaxResponse response = taxService.updateTax(id, request);
        return ResponseEntity.ok(ApiResponse.success("Tax rule updated successfully", response));
    }
}

