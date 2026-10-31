package com.brightloop.subscription.controller;

import com.brightloop.subscription.dto.common.ApiResponse;
import com.brightloop.subscription.dto.invoice.InvoiceResponse;
import com.brightloop.subscription.enums.InvoiceStatus;
import com.brightloop.subscription.service.InvoiceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Page<InvoiceResponse>>> searchInvoices(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<InvoiceResponse> page = invoiceService.searchInvoices(customerId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceById(@PathVariable Long id) {
        InvoiceResponse response = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> confirmInvoice(@PathVariable Long id) {
        InvoiceResponse response = invoiceService.confirmInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice confirmed", response));
    }

    @PostMapping("/{id}/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> sendInvoice(@PathVariable Long id) {
        InvoiceResponse response = invoiceService.sendInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice sent to customer", response));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> cancelInvoice(@PathVariable Long id) {
        InvoiceResponse response = invoiceService.cancelInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice cancelled", response));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id) {
        byte[] pdfBytes = invoiceService.getInvoicePdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}

