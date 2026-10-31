package com.brightloop.subscription;

import com.brightloop.subscription.entity.*;
import com.brightloop.subscription.enums.*;
import com.brightloop.subscription.repository.*;
import com.brightloop.subscription.service.BillingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class BillingServiceTest {

    @Autowired
    private BillingService billingService;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private SubscriptionPlanRepository planRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private BillingRecordRepository billingRecordRepository;

    private User testCustomer;
    private SubscriptionPlan testPlan;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        billingRecordRepository.deleteAll();
        invoiceRepository.deleteAll();
        subscriptionRepository.deleteAll();

        Role customerRole = roleRepository.findByName(RoleType.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_CUSTOMER, "Customer")));

        testCustomer = userRepository.findByEmail("test_customer@brightloop.io").orElseGet(() -> {
            User user = new User("Test Customer", "test_customer@brightloop.io", "hashedPass");
            user.setRoles(Collections.singleton(customerRole));
            return userRepository.save(user);
        });

        testPlan = planRepository.findAll().stream().findFirst().orElseGet(() -> {
            SubscriptionPlan plan = new SubscriptionPlan("Test Plan", BillingFrequency.MONTHLY, 1, new BigDecimal("1000.00"));
            return planRepository.save(plan);
        });

        testProduct = productRepository.findAll().stream().findFirst().orElseGet(() -> {
            Product prod = new Product("Cloud Test Product", ProductType.SERVICE, new BigDecimal("1000.00"), new BigDecimal("300.00"));
            return productRepository.save(prod);
        });
    }

    @Test
    void testDuplicateBillingPrevention() {
        LocalDate billingDate = LocalDate.now().minusDays(5);

        Subscription sub = new Subscription();
        sub.setSubscriptionNumber("SUB-TEST-DUP");
        sub.setCustomer(testCustomer);
        sub.setSubscriptionPlan(testPlan);
        sub.setStartDate(billingDate);
        sub.setNextBillingDate(billingDate);
        sub.setBillingFrequency(BillingFrequency.MONTHLY);
        sub.setStatus(SubscriptionStatus.ACTIVE);

        SubscriptionLine line = new SubscriptionLine();
        line.setProduct(testProduct);
        line.setQuantity(1);
        line.setUnitPrice(new BigDecimal("1000.00"));
        line.setLineTotal(new BigDecimal("1000.00"));
        sub.addLine(line);
        sub.setSubtotal(new BigDecimal("1000.00"));
        sub.setTotalAmount(new BigDecimal("1000.00"));
        Subscription saved = subscriptionRepository.save(sub);

        // First execution: should generate 1 invoice
        boolean firstRun = billingService.processSingleSubscriptionBilling(saved, LocalDate.now());
        assertTrue(firstRun, "First billing run must create invoice");
        assertEquals(1, invoiceRepository.findBySubscriptionId(saved.getId()).size());

        // Check billing record exists
        assertTrue(billingRecordRepository.existsBySubscriptionIdAndBillingPeriodStart(saved.getId(), billingDate));

        // Re-run with the same period start: must be rejected / idempotent
        boolean secondRun = billingService.processSingleSubscriptionBilling(saved, LocalDate.now());
        assertFalse(secondRun, "Duplicate billing run must be skipped to avoid duplicate billing");

        // Verify still only 1 invoice exists
        assertEquals(1, invoiceRepository.findBySubscriptionId(saved.getId()).size());
    }

    @Test
    void testPausedSubscriptionIsNotBilled() {
        Subscription sub = new Subscription();
        sub.setSubscriptionNumber("SUB-TEST-PAUSED");
        sub.setCustomer(testCustomer);
        sub.setSubscriptionPlan(testPlan);
        sub.setStartDate(LocalDate.now().minusMonths(1));
        sub.setNextBillingDate(LocalDate.now().minusDays(2));
        sub.setBillingFrequency(BillingFrequency.MONTHLY);
        sub.setStatus(SubscriptionStatus.PAUSED); // Paused state
        Subscription saved = subscriptionRepository.save(sub);

        int billed = billingService.processDueSubscriptions(LocalDate.now());
        // Since subscription is PAUSED, it should NOT be billed
        assertEquals(0, invoiceRepository.findBySubscriptionId(saved.getId()).size());
    }

    @Test
    void testCancelledSubscriptionIsNotBilled() {
        Subscription sub = new Subscription();
        sub.setSubscriptionNumber("SUB-TEST-CANCELLED");
        sub.setCustomer(testCustomer);
        sub.setSubscriptionPlan(testPlan);
        sub.setStartDate(LocalDate.now().minusMonths(1));
        sub.setNextBillingDate(LocalDate.now().minusDays(2));
        sub.setBillingFrequency(BillingFrequency.MONTHLY);
        sub.setStatus(SubscriptionStatus.CANCELLED);
        Subscription saved = subscriptionRepository.save(sub);

        billingService.processDueSubscriptions(LocalDate.now());
        assertEquals(0, invoiceRepository.findBySubscriptionId(saved.getId()).size());
    }
}

