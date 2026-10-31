package com.brightloop.subscription.service;

import com.brightloop.subscription.entity.*;
import com.brightloop.subscription.enums.BillingFrequency;
import com.brightloop.subscription.enums.InvoiceStatus;
import com.brightloop.subscription.enums.SubscriptionStatus;
import com.brightloop.subscription.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class BillingService {

    private static final Logger logger = LoggerFactory.getLogger(BillingService.class);

    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceRepository invoiceRepository;
    private final BillingRecordRepository billingRecordRepository;
    private final SubscriptionDiscountRepository subscriptionDiscountRepository;
    private final DiscountService discountService;
    private final EmailService emailService;
    private final PdfService pdfService;

    public BillingService(
            SubscriptionRepository subscriptionRepository,
            InvoiceRepository invoiceRepository,
            BillingRecordRepository billingRecordRepository,
            SubscriptionDiscountRepository subscriptionDiscountRepository,
            DiscountService discountService,
            EmailService emailService,
            PdfService pdfService) {
        this.subscriptionRepository = subscriptionRepository;
        this.invoiceRepository = invoiceRepository;
        this.billingRecordRepository = billingRecordRepository;
        this.subscriptionDiscountRepository = subscriptionDiscountRepository;
        this.discountService = discountService;
        this.emailService = emailService;
        this.pdfService = pdfService;
    }

    /**
     * Bulk Automated Recurring Billing Engine (Invoked by Scheduler)
     * Processes in batches of 100 for high-performance scale.
     */
    public int processDueSubscriptions(LocalDate asOfDate) {
        logger.info("Starting automated recurring billing cycle for date: {}", asOfDate);
        int page = 0;
        int pageSize = 100;
        int totalInvoicesGenerated = 0;

        while (true) {
            Page<Subscription> duePage = subscriptionRepository.findDueForBilling(asOfDate, PageRequest.of(page, pageSize));
            if (duePage.isEmpty()) {
                break;
            }

            for (Subscription subscription : duePage.getContent()) {
                try {
                    int generated = processSubscriptionCatchUp(subscription.getId(), asOfDate);
                    totalInvoicesGenerated += generated;
                } catch (Exception ex) {
                    logger.error("Failed to bill subscription ID: {}: {}", subscription.getId(), ex.getMessage(), ex);
                }
            }

            if (!duePage.hasNext()) {
                break;
            }
            page++;
        }

        logger.info("Automated billing cycle completed. Total invoices generated: {}", totalInvoicesGenerated);
        return totalInvoicesGenerated;
    }

    /**
     * Processes any missed or due billing cycles for a subscription in chronological order
     * until nextBillingDate is in the future.
     */
    public int processSubscriptionCatchUp(Long subscriptionId, LocalDate asOfDate) {
        int invoicesCreated = 0;
        while (true) {
            Subscription sub = subscriptionRepository.findById(subscriptionId).orElse(null);
            if (sub == null || sub.getStatus() != SubscriptionStatus.ACTIVE) {
                break;
            }

            // Expiry check
            if (sub.getEndDate() != null && sub.getNextBillingDate().isAfter(sub.getEndDate())) {
                if (sub.getSubscriptionPlan().getAutoClose()) {
                    sub.setStatus(SubscriptionStatus.CLOSED);
                    subscriptionRepository.save(sub);
                    logger.info("Subscription {} auto-closed as next billing date exceeded end date.", sub.getSubscriptionNumber());
                }
                break;
            }

            if (sub.getNextBillingDate().isAfter(asOfDate)) {
                break; // Fully caught up
            }

            boolean generated = processSingleSubscriptionBilling(sub, asOfDate);
            if (!generated) {
                break;
            }
            invoicesCreated++;
        }
        return invoicesCreated;
    }

    /**
     * Idempotent, transactional billing method for a single cycle.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean processSingleSubscriptionBilling(Subscription subscription, LocalDate asOfDate) {
        LocalDate periodStart = subscription.getNextBillingDate();
        int interval = subscription.getSubscriptionPlan().getBillingInterval();
        LocalDate periodEnd = computePeriodEndDate(periodStart, subscription.getBillingFrequency(), interval);
        LocalDate nextCycleStart = periodEnd.plusDays(1);

        // 1. CRITICAL IDEMPOTENCY CHECK: Ensure not already billed
        if (billingRecordRepository.existsBySubscriptionIdAndBillingPeriodStart(subscription.getId(), periodStart)) {
            logger.warn("Skipping billing: Subscription {} has already been billed for period starting {}",
                    subscription.getSubscriptionNumber(), periodStart);
            // Advance nextBillingDate to prevent infinite loop
            subscription.setNextBillingDate(nextCycleStart);
            subscriptionRepository.save(subscription);
            return false;
        }

        // 2. Generate Invoice
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        invoice.setCustomer(subscription.getCustomer());
        invoice.setSubscription(subscription);
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(15)); // Net 15 standard
        invoice.setBillingPeriodStart(periodStart);
        invoice.setBillingPeriodEnd(periodEnd);
        invoice.setStatus(InvoiceStatus.CONFIRMED);
        invoice.setNotes("Automated recurring billing cycle for " + subscription.getSubscriptionNumber());

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxAmount = BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;

        for (SubscriptionLine sl : subscription.getLines()) {
            InvoiceLine il = new InvoiceLine();
            il.setProduct(sl.getProduct());
            il.setProductVariant(sl.getProductVariant());
            il.setProductName(sl.getProduct().getName());
            il.setVariantName(sl.getProductVariant() != null ? sl.getProductVariant().getVariantName() : null);
            il.setQuantity(sl.getQuantity());
            il.setUnitPrice(sl.getUnitPrice());
            il.setDiscountAmount(sl.getDiscountAmount());
            il.setTaxRate(sl.getTaxRate());
            il.setTaxAmount(sl.getTaxAmount());
            il.setLineTotal(sl.getLineTotal());

            invoice.addLine(il);

            subtotal = subtotal.add(sl.getUnitPrice().multiply(BigDecimal.valueOf(sl.getQuantity())));
            discountAmount = discountAmount.add(sl.getDiscountAmount());
            taxAmount = taxAmount.add(sl.getTaxAmount());
        }

        // Apply any recurring promotional discounts attached to the subscription
        List<SubscriptionDiscount> activeDiscounts = subscriptionDiscountRepository.findBySubscriptionIdAndActiveTrue(subscription.getId());
        for (SubscriptionDiscount sd : activeDiscounts) {
            Discount d = sd.getDiscount();
            BigDecimal disc = discountService.calculateDiscountAmount(d, subtotal, 1, LocalDate.now());
            if (disc.compareTo(BigDecimal.ZERO) > 0) {
                discountAmount = discountAmount.add(disc);
                discountService.recordDiscountUsage(d, subscription.getCustomer(), subscription, invoice, disc);
            }
        }

        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(taxAmount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        invoice.setSubtotal(subtotal);
        invoice.setDiscountAmount(discountAmount);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(totalAmount);
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setBalanceDue(totalAmount);

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // 3. Save Billing Record for duplicate prevention
        BillingRecord record = new BillingRecord(subscription, periodStart, periodEnd, savedInvoice);
        billingRecordRepository.save(record);

        // 4. Update Subscription Next Billing Date
        subscription.setNextBillingDate(nextCycleStart);

        // Check if subscription has now reached or exceeded its end date
        if (subscription.getEndDate() != null && nextCycleStart.isAfter(subscription.getEndDate())) {
            if (subscription.getSubscriptionPlan().getAutoClose()) {
                subscription.setStatus(SubscriptionStatus.CLOSED);
            }
        }
        subscriptionRepository.save(subscription);

        // 5. Notify customer
        try {
            emailService.sendInvoiceNotification(
                    subscription.getCustomer().getEmail(),
                    savedInvoice.getInvoiceNumber(),
                    savedInvoice.getTotalAmount().toString(),
                    savedInvoice.getDueDate().toString()
            );
        } catch (Exception ex) {
            logger.warn("Failed to dispatch invoice notification: {}", ex.getMessage());
        }

        logger.info("Successfully generated invoice {} for subscription {} (Period: {} to {})",
                savedInvoice.getInvoiceNumber(), subscription.getSubscriptionNumber(), periodStart, periodEnd);

        return true;
    }

    /**
     * Month-End and date interval calculations.
     * Accurately prevents drift (e.g. Jan 31 -> Feb 28 -> Mar 31).
     */
    public LocalDate computePeriodEndDate(LocalDate startDate, BillingFrequency frequency, int interval) {
        LocalDate nextPeriodStart;
        switch (frequency) {
            case DAILY:
                nextPeriodStart = startDate.plusDays(interval);
                break;
            case WEEKLY:
                nextPeriodStart = startDate.plusWeeks(interval);
                break;
            case MONTHLY:
                nextPeriodStart = startDate.plusMonths(interval);
                break;
            case YEARLY:
                nextPeriodStart = startDate.plusYears(interval);
                break;
            default:
                nextPeriodStart = startDate.plusMonths(1);
        }
        return nextPeriodStart.minusDays(1);
    }
}

