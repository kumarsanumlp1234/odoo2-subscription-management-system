package com.brightloop.subscription.service;

import com.brightloop.subscription.dto.payment.PaymentRequest;
import com.brightloop.subscription.dto.payment.PaymentResponse;
import com.brightloop.subscription.entity.Invoice;
import com.brightloop.subscription.entity.Payment;
import com.brightloop.subscription.entity.User;
import com.brightloop.subscription.enums.InvoiceStatus;
import com.brightloop.subscription.enums.PaymentStatus;
import com.brightloop.subscription.enums.RoleType;
import com.brightloop.subscription.exception.BadRequestException;
import com.brightloop.subscription.exception.DuplicateResourceException;
import com.brightloop.subscription.exception.ResourceNotFoundException;
import com.brightloop.subscription.repository.InvoiceRepository;
import com.brightloop.subscription.repository.PaymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final AuthService authService;

    public PaymentService(
            PaymentRepository paymentRepository,
            InvoiceRepository invoiceRepository,
            AuthService authService) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public Page<PaymentResponse> searchPayments(Long customerId, String search, Pageable pageable) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        boolean isCustomer = currentUser.getRoles().stream().anyMatch(r -> r.getName() == RoleType.ROLE_CUSTOMER);
        boolean isStaffOrAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == RoleType.ROLE_ADMIN || r.getName() == RoleType.ROLE_STAFF);

        if (isCustomer && !isStaffOrAdmin) {
            customerId = currentUser.getId();
        }

        return paymentRepository.searchPayments(customerId, search, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsForInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));

        validateOwnership(invoice.getCustomer());
        return paymentRepository.findByInvoiceId(invoiceId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse recordPayment(PaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + request.getInvoiceId()));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BadRequestException("This invoice has already been fully paid.");
        }
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BadRequestException("Cannot accept payment for a cancelled invoice.");
        }

        if (request.getAmount().compareTo(invoice.getBalanceDue()) > 0) {
            throw new BadRequestException("Payment amount (₹" + request.getAmount() + ") exceeds invoice balance due (₹" + invoice.getBalanceDue() + ").");
        }

        String txnRef = request.getTransactionReference();
        if (txnRef == null || txnRef.isBlank()) {
            txnRef = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } else if (paymentRepository.existsByTransactionReference(txnRef)) {
            throw new DuplicateResourceException("A payment with transaction reference '" + txnRef + "' already exists.");
        }

        Payment payment = new Payment();
        payment.setPaymentNumber("PAY-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setCustomer(invoice.getCustomer());
        payment.setInvoice(invoice);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionReference(txnRef);
        payment.setPaymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now());
        payment.setNotes(request.getNotes());
        payment.setStatus(PaymentStatus.SUCCESS);

        Payment savedPayment = paymentRepository.save(payment);

        // Update Invoice balances
        BigDecimal newPaidAmount = invoice.getPaidAmount().add(request.getAmount());
        BigDecimal newBalanceDue = invoice.getTotalAmount().subtract(newPaidAmount);
        if (newBalanceDue.compareTo(BigDecimal.ZERO) < 0) {
            newBalanceDue = BigDecimal.ZERO;
        }

        invoice.setPaidAmount(newPaidAmount);
        invoice.setBalanceDue(newBalanceDue);

        if (newBalanceDue.compareTo(BigDecimal.ZERO) == 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }
        invoiceRepository.save(invoice);

        return mapToResponse(savedPayment);
    }

    private void validateOwnership(User customer) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        boolean isStaffOrAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleType.ROLE_ADMIN || r.getName() == RoleType.ROLE_STAFF);

        if (!isStaffOrAdmin && !customer.getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied: Not authorized to view payments for another user.");
        }
    }

    public PaymentResponse mapToResponse(Payment p) {
        PaymentResponse res = new PaymentResponse();
        res.setId(p.getId());
        res.setPaymentNumber(p.getPaymentNumber());
        res.setCustomerId(p.getCustomer().getId());
        res.setCustomerName(p.getCustomer().getFullName());
        res.setInvoiceId(p.getInvoice().getId());
        res.setInvoiceNumber(p.getInvoice().getInvoiceNumber());
        res.setAmount(p.getAmount());
        res.setPaymentMethod(p.getPaymentMethod());
        res.setTransactionReference(p.getTransactionReference());
        res.setPaymentDate(p.getPaymentDate());
        res.setNotes(p.getNotes());
        res.setStatus(p.getStatus());
        res.setCreatedAt(p.getCreatedAt());
        return res;
    }
}

