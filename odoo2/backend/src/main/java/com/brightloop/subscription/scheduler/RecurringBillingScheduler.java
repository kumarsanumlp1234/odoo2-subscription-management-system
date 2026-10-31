package com.brightloop.subscription.scheduler;

import com.brightloop.subscription.entity.Invoice;
import com.brightloop.subscription.enums.InvoiceStatus;
import com.brightloop.subscription.repository.InvoiceRepository;
import com.brightloop.subscription.service.BillingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class RecurringBillingScheduler {

    private static final Logger logger = LoggerFactory.getLogger(RecurringBillingScheduler.class);

    private final BillingService billingService;
    private final InvoiceRepository invoiceRepository;

    @Value("${app.billing.enabled:true}")
    private boolean billingEnabled;

    public RecurringBillingScheduler(BillingService billingService, InvoiceRepository invoiceRepository) {
        this.billingService = billingService;
        this.invoiceRepository = invoiceRepository;
    }

    /**
     * Runs daily at the configured cron time (default 2:00 AM)
     */
    @Scheduled(cron = "${app.billing.cron:0 0 2 * * ?}")
    public void runDailyRecurringBilling() {
        if (!billingEnabled) {
            logger.info("Recurring billing scheduler is currently disabled via configuration.");
            return;
        }

        LocalDate today = LocalDate.now();
        logger.info("Executing scheduled recurring billing run for date: {}", today);

        // 1. Mark overdue invoices
        updateOverdueInvoices(today);

        // 2. Generate recurring subscription invoices
        int billed = billingService.processDueSubscriptions(today);
        logger.info("Scheduled recurring billing completed. Processed {} invoices.", billed);
    }

    private void updateOverdueInvoices(LocalDate today) {
        try {
            List<Invoice> unpaid = invoiceRepository.findUnpaidDueBefore(today);
            for (Invoice inv : unpaid) {
                inv.setStatus(InvoiceStatus.OVERDUE);
            }
            invoiceRepository.saveAll(unpaid);
            if (!unpaid.isEmpty()) {
                logger.info("Updated {} invoices to OVERDUE status.", unpaid.size());
            }
        } catch (Exception ex) {
            logger.error("Error updating overdue invoices: {}", ex.getMessage(), ex);
        }
    }
}

