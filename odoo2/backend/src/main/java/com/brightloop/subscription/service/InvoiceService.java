package com.brightloop.subscription.service;

import com.brightloop.subscription.dto.invoice.InvoiceLineDto;
import com.brightloop.subscription.dto.invoice.InvoiceResponse;
import com.brightloop.subscription.entity.Invoice;
import com.brightloop.subscription.entity.User;
import com.brightloop.subscription.enums.InvoiceStatus;
import com.brightloop.subscription.enums.RoleType;
import com.brightloop.subscription.exception.BadRequestException;
import com.brightloop.subscription.exception.InvalidStateTransitionException;
import com.brightloop.subscription.exception.ResourceNotFoundException;
import com.brightloop.subscription.repository.InvoiceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PdfService pdfService;
    private final EmailService emailService;
    private final AuthService authService;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            PdfService pdfService,
            EmailService emailService,
            AuthService authService) {
        this.invoiceRepository = invoiceRepository;
        this.pdfService = pdfService;
        this.emailService = emailService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> searchInvoices(Long customerId, InvoiceStatus status, String search, Pageable pageable) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        boolean isCustomer = currentUser.getRoles().stream().anyMatch(r -> r.getName() == RoleType.ROLE_CUSTOMER);
        boolean isStaffOrAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == RoleType.ROLE_ADMIN || r.getName() == RoleType.ROLE_STAFF);

        // Security check: Customer can only view their own invoices
        if (isCustomer && !isStaffOrAdmin) {
            customerId = currentUser.getId();
        }

        return invoiceRepository.searchInvoices(customerId, status, search, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = getInvoiceEntity(id);
        validateOwnership(invoice);
        return mapToResponse(invoice);
    }

    @Transactional
    public InvoiceResponse confirmInvoice(Long id) {
        Invoice invoice = getInvoiceEntity(id);
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new InvalidStateTransitionException("Only DRAFT invoices can be confirmed.");
        }
        invoice.setStatus(InvoiceStatus.CONFIRMED);
        return mapToResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse sendInvoice(Long id) {
        Invoice invoice = getInvoiceEntity(id);
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new InvalidStateTransitionException("Cannot send a cancelled invoice.");
        }
        invoice.setStatus(InvoiceStatus.SENT);
        Invoice saved = invoiceRepository.save(invoice);

        emailService.sendInvoiceNotification(
                invoice.getCustomer().getEmail(),
                invoice.getInvoiceNumber(),
                invoice.getTotalAmount().toString(),
                invoice.getDueDate().toString()
        );

        return mapToResponse(saved);
    }

    @Transactional
    public InvoiceResponse cancelInvoice(Long id) {
        Invoice invoice = getInvoiceEntity(id);
        if (invoice.getStatus() == InvoiceStatus.PAID || invoice.getStatus() == InvoiceStatus.PARTIALLY_PAID) {
            throw new BadRequestException("Cannot cancel an invoice with recorded payments.");
        }
        invoice.setStatus(InvoiceStatus.CANCELLED);
        return mapToResponse(invoiceRepository.save(invoice));
    }

    @Transactional(readOnly = true)
    public byte[] getInvoicePdf(Long id) {
        Invoice invoice = getInvoiceEntity(id);
        validateOwnership(invoice);
        return pdfService.generateInvoicePdf(invoice);
    }

    public Invoice getInvoiceEntity(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
    }

    private void validateOwnership(Invoice invoice) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        boolean isStaffOrAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleType.ROLE_ADMIN || r.getName() == RoleType.ROLE_STAFF);

        if (!isStaffOrAdmin && !invoice.getCustomer().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to view another customer's invoice.");
        }
    }

    public InvoiceResponse mapToResponse(Invoice inv) {
        InvoiceResponse res = new InvoiceResponse();
        res.setId(inv.getId());
        res.setInvoiceNumber(inv.getInvoiceNumber());
        res.setCustomerId(inv.getCustomer().getId());
        res.setCustomerName(inv.getCustomer().getFullName());
        res.setCustomerEmail(inv.getCustomer().getEmail());
        if (inv.getSubscription() != null) {
            res.setSubscriptionId(inv.getSubscription().getId());
            res.setSubscriptionNumber(inv.getSubscription().getSubscriptionNumber());
        }
        res.setIssueDate(inv.getIssueDate());
        res.setDueDate(inv.getDueDate());
        res.setBillingPeriodStart(inv.getBillingPeriodStart());
        res.setBillingPeriodEnd(inv.getBillingPeriodEnd());
        res.setSubtotal(inv.getSubtotal());
        res.setDiscountAmount(inv.getDiscountAmount());
        res.setTaxAmount(inv.getTaxAmount());
        res.setTotalAmount(inv.getTotalAmount());
        res.setPaidAmount(inv.getPaidAmount());
        res.setBalanceDue(inv.getBalanceDue());
        res.setStatus(inv.getStatus());
        res.setPdfPath(inv.getPdfPath());
        res.setNotes(inv.getNotes());
        res.setCreatedAt(inv.getCreatedAt());

        res.setLines(inv.getLines().stream().map(l -> {
            InvoiceLineDto dto = new InvoiceLineDto();
            dto.setId(l.getId());
            if (l.getProduct() != null) dto.setProductId(l.getProduct().getId());
            if (l.getProductVariant() != null) dto.setProductVariantId(l.getProductVariant().getId());
            dto.setProductName(l.getProductName());
            dto.setVariantName(l.getVariantName());
            dto.setQuantity(l.getQuantity());
            dto.setUnitPrice(l.getUnitPrice());
            dto.setDiscountAmount(l.getDiscountAmount());
            dto.setTaxRate(l.getTaxRate());
            dto.setTaxAmount(l.getTaxAmount());
            dto.setLineTotal(l.getLineTotal());
            return dto;
        }).collect(Collectors.toList()));

        return res;
    }
}

