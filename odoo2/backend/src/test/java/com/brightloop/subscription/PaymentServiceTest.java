package com.brightloop.subscription;

import com.brightloop.subscription.dto.payment.PaymentRequest;
import com.brightloop.subscription.dto.payment.PaymentResponse;
import com.brightloop.subscription.entity.Invoice;
import com.brightloop.subscription.entity.User;
import com.brightloop.subscription.enums.InvoiceStatus;
import com.brightloop.subscription.enums.PaymentMethod;
import com.brightloop.subscription.exception.BadRequestException;
import com.brightloop.subscription.repository.InvoiceRepository;
import com.brightloop.subscription.repository.PaymentRepository;
import com.brightloop.subscription.repository.UserRepository;
import com.brightloop.subscription.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class PaymentServiceTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    private Invoice testInvoice;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        invoiceRepository.deleteAll();

        User customer = userRepository.findAll().stream().findFirst().orElseThrow();

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-TEST-PAY-01");
        invoice.setCustomer(customer);
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(15));
        invoice.setBillingPeriodStart(LocalDate.now());
        invoice.setBillingPeriodEnd(LocalDate.now().plusMonths(1));
        invoice.setSubtotal(new BigDecimal("2000.00"));
        invoice.setDiscountAmount(BigDecimal.ZERO);
        invoice.setTaxAmount(BigDecimal.ZERO);
        invoice.setTotalAmount(new BigDecimal("2000.00"));
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setBalanceDue(new BigDecimal("2000.00"));
        invoice.setStatus(InvoiceStatus.CONFIRMED);
        testInvoice = invoiceRepository.save(invoice);
    }

    @Test
    void testPartialPaymentUpdatesInvoice() {
        PaymentRequest req = new PaymentRequest();
        req.setInvoiceId(testInvoice.getId());
        req.setAmount(new BigDecimal("800.00"));
        req.setPaymentMethod(PaymentMethod.UPI);
        req.setTransactionReference("UPI-TXN-PARTIAL-01");

        PaymentResponse response = paymentService.recordPayment(req);
        assertNotNull(response.getId());

        Invoice updated = invoiceRepository.findById(testInvoice.getId()).orElseThrow();
        assertEquals(new BigDecimal("800.00"), updated.getPaidAmount());
        assertEquals(new BigDecimal("1200.00"), updated.getBalanceDue());
        assertEquals(InvoiceStatus.PARTIALLY_PAID, updated.getStatus());
    }

    @Test
    void testFullPaymentMarksInvoicePaid() {
        PaymentRequest req = new PaymentRequest();
        req.setInvoiceId(testInvoice.getId());
        req.setAmount(new BigDecimal("2000.00"));
        req.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        req.setTransactionReference("NEFT-FULL-PAY-01");

        paymentService.recordPayment(req);

        Invoice updated = invoiceRepository.findById(testInvoice.getId()).orElseThrow();
        assertEquals(new BigDecimal("2000.00"), updated.getPaidAmount());
        assertEquals(new BigDecimal("0.00"), updated.getBalanceDue());
        assertEquals(InvoiceStatus.PAID, updated.getStatus());
    }

    @Test
    void testExceedingPaymentAmountThrowsBadRequest() {
        PaymentRequest req = new PaymentRequest();
        req.setInvoiceId(testInvoice.getId());
        req.setAmount(new BigDecimal("2500.00")); // More than 2000.00 balance due
        req.setPaymentMethod(PaymentMethod.CARD);

        assertThrows(BadRequestException.class, () -> paymentService.recordPayment(req));
    }
}

