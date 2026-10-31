package com.brightloop.subscription.config;

import com.brightloop.subscription.entity.*;
import com.brightloop.subscription.enums.*;
import com.brightloop.subscription.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final TaxRepository taxRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final SubscriptionPlanRepository planRepository;
    private final DiscountRepository discountRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceRepository invoiceRepository;
    private final BillingRecordRepository billingRecordRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            RoleRepository roleRepository,
            UserRepository userRepository,
            CustomerProfileRepository customerProfileRepository,
            StaffProfileRepository staffProfileRepository,
            TaxRepository taxRepository,
            ProductRepository productRepository,
            ProductVariantRepository variantRepository,
            SubscriptionPlanRepository planRepository,
            DiscountRepository discountRepository,
            SubscriptionRepository subscriptionRepository,
            InvoiceRepository invoiceRepository,
            BillingRecordRepository billingRecordRepository,
            PaymentRepository paymentRepository,
            PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.taxRepository = taxRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.planRepository = planRepository;
        this.discountRepository = discountRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.invoiceRepository = invoiceRepository;
        this.billingRecordRepository = billingRecordRepository;
        this.paymentRepository = paymentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("Checking Brightloop initial seed data...");

        // 1. Initialize Roles
        Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_ADMIN, "Full Administrator")));
        Role staffRole = roleRepository.findByName(RoleType.ROLE_STAFF)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_STAFF, "Operational Staff")));
        Role customerRole = roleRepository.findByName(RoleType.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_CUSTOMER, "Customer Portal")));

        // 2. Initialize Admin
        if (!userRepository.existsByEmail("admin@brightloop.io")) {
            User admin = new User("System Administrator", "admin@brightloop.io", passwordEncoder.encode("Admin@123"));
            admin.setPhoneNumber("+91 9876543210");
            admin.setRoles(Collections.singleton(adminRole));
            userRepository.save(admin);
            logger.info("Seeded default Admin: admin@brightloop.io / Admin@123");
        }

        // 3. Initialize Staff
        User staffUser = userRepository.findByEmail("staff@brightloop.io").orElse(null);
        if (staffUser == null) {
            staffUser = new User("Sarah Jenkins", "staff@brightloop.io", passwordEncoder.encode("Staff@123"));
            staffUser.setPhoneNumber("+91 9876543211");
            staffUser.setRoles(Collections.singleton(staffRole));
            staffUser = userRepository.save(staffUser);

            StaffProfile profile = new StaffProfile(staffUser, "Operations", "Billing Specialist", "BL-EMP-001");
            staffProfileRepository.save(profile);
            logger.info("Seeded default Staff: staff@brightloop.io / Staff@123");
        }

        // 4. Initialize Customer
        User customerUser = userRepository.findByEmail("customer@brightloop.io").orElse(null);
        if (customerUser == null) {
            customerUser = new User("Acme Corp (John Doe)", "customer@brightloop.io", passwordEncoder.encode("Customer@123"));
            customerUser.setPhoneNumber("+91 9876543212");
            customerUser.setRoles(Collections.singleton(customerRole));
            customerUser = userRepository.save(customerUser);

            CustomerProfile cp = new CustomerProfile(customerUser, "Acme Technologies Pvt Ltd");
            cp.setGstNumber("29ABCDE1234F1Z5");
            cp.setBillingAddressLine1("Suite 404, Tech Park");
            cp.setCity("Bengaluru");
            cp.setState("Karnataka");
            cp.setPostalCode("560103");
            customerProfileRepository.save(cp);
            logger.info("Seeded default Customer: customer@brightloop.io / Customer@123");
        }

        // 5. Initialize Taxes
        Tax standardGst = taxRepository.findAll().stream().findFirst().orElse(null);
        if (standardGst == null) {
            standardGst = new Tax("GST 18% (Standard SaaS)", new BigDecimal("18.00"), TaxType.PERCENTAGE, "Integrated GST for SaaS services");
            taxRepository.save(standardGst);
            taxRepository.save(new Tax("CGST 9% (Intra-State)", new BigDecimal("9.00"), TaxType.PERCENTAGE, "Central GST"));
            taxRepository.save(new Tax("SGST 9% (Intra-State)", new BigDecimal("9.00"), TaxType.PERCENTAGE, "State GST"));
            taxRepository.save(new Tax("GST 5% (Essentials)", new BigDecimal("5.00"), TaxType.PERCENTAGE, "Concessional tax"));
            logger.info("Seeded default Taxes.");
        }

        // 6. Initialize Products & Variants
        Product coreProd = productRepository.findAll().stream().findFirst().orElse(null);
        ProductVariant entVariant = null;
        if (coreProd == null) {
            coreProd = new Product("BrightCloud Core Platform", ProductType.SERVICE, new BigDecimal("1000.00"), new BigDecimal("250.00"));
            coreProd.setDescription("Enterprise Cloud recurring engine with unlimited API calls.");
            coreProd.setTaxes(new HashSet<>(Collections.singleton(standardGst)));
            coreProd = productRepository.save(coreProd);

            ProductVariant basicVariant = new ProductVariant(coreProd, "Basic Tier", BigDecimal.ZERO, "BC-CORE-BSC");
            variantRepository.save(basicVariant);

            entVariant = new ProductVariant(coreProd, "Enterprise Variant", new BigDecimal("560.00"), "BC-CORE-ENT");
            variantRepository.save(entVariant);

            Product analytics = new Product("Brightloop Analytics Suite", ProductType.SERVICE, new BigDecimal("1500.00"), new BigDecimal("400.00"));
            analytics.setTaxes(new HashSet<>(Collections.singleton(standardGst)));
            productRepository.save(analytics);

            Product hsm = new Product("Dedicated Hardware Security Module (HSM)", ProductType.PHYSICAL, new BigDecimal("5000.00"), new BigDecimal("3200.00"));
            hsm.setTaxes(new HashSet<>(Collections.singleton(standardGst)));
            productRepository.save(hsm);

            logger.info("Seeded default Products and Variants (including Enterprise Variant adding 560).");
        } else {
            entVariant = variantRepository.findAll().stream().findFirst().orElse(null);
        }

        // 7. Initialize Subscription Plans
        SubscriptionPlan monthlyPlan = planRepository.findAll().stream().findFirst().orElse(null);
        if (monthlyPlan == null) {
            monthlyPlan = new SubscriptionPlan("BrightCloud Monthly Starter", BillingFrequency.MONTHLY, 1, new BigDecimal("1000.00"));
            monthlyPlan.setDescription("Monthly billed subscription with flexible pause and early closure.");
            monthlyPlan.setAllowPause(true);
            monthlyPlan.setAllowEarlyClosure(true);
            monthlyPlan = planRepository.save(monthlyPlan);

            SubscriptionPlan quarterlyPlan = new SubscriptionPlan("BrightCloud Quarterly Growth", BillingFrequency.MONTHLY, 3, new BigDecimal("2850.00"));
            quarterlyPlan.setDescription("Billed quarterly with 5% discount.");
            planRepository.save(quarterlyPlan);

            SubscriptionPlan annualPlan = new SubscriptionPlan("BrightCloud Annual Enterprise", BillingFrequency.YEARLY, 1, new BigDecimal("10000.00"));
            annualPlan.setDescription("Yearly contract billed every 12 months.");
            planRepository.save(annualPlan);

            logger.info("Seeded default Subscription Plans.");
        }

        // 8. Initialize Discounts
        if (discountRepository.count() == 0) {
            Discount disc1 = new Discount("WELCOME10", DiscountType.PERCENTAGE, new BigDecimal("10.00"));
            disc1.setMinimumPurchaseAmount(new BigDecimal("500.00"));
            disc1.setMaximumUsage(100);
            disc1.setStartDate(LocalDate.now().minusDays(10));
            disc1.setEndDate(LocalDate.now().plusYears(1));
            discountRepository.save(disc1);

            Discount disc2 = new Discount("SAVE500", DiscountType.FIXED_AMOUNT, new BigDecimal("500.00"));
            disc2.setMinimumPurchaseAmount(new BigDecimal("2000.00"));
            disc2.setMaximumUsage(50);
            disc2.setStartDate(LocalDate.now().minusDays(10));
            disc2.setEndDate(LocalDate.now().plusYears(1));
            discountRepository.save(disc2);
            logger.info("Seeded default Discounts.");
        }

        // 9. Initialize Sample Active Subscription, Invoice, and Payment if empty
        if (subscriptionRepository.count() == 0 && customerUser != null && monthlyPlan != null && coreProd != null) {
            Subscription sub = new Subscription();
            sub.setSubscriptionNumber("SUB-2026-0001");
            sub.setCustomer(customerUser);
            sub.setSubscriptionPlan(monthlyPlan);
            sub.setStartDate(LocalDate.now().minusMonths(1));
            sub.setEndDate(LocalDate.now().plusMonths(11));
            sub.setNextBillingDate(LocalDate.now().plusMonths(1));
            sub.setBillingFrequency(BillingFrequency.MONTHLY);
            sub.setPaymentTerms("Net 15");
            sub.setStatus(SubscriptionStatus.ACTIVE);
            sub.setCreatedBy(staffUser);

            SubscriptionLine line = new SubscriptionLine();
            line.setProduct(coreProd);
            line.setProductVariant(entVariant);
            line.setQuantity(1);
            BigDecimal unitPrice = coreProd.getSalesPrice().add(entVariant != null ? entVariant.getAdditionalPrice() : BigDecimal.ZERO);
            line.setUnitPrice(unitPrice);
            line.setTaxRate(new BigDecimal("18.00"));
            BigDecimal taxAmt = unitPrice.multiply(new BigDecimal("0.18"));
            line.setTaxAmount(taxAmt);
            line.setDiscountAmount(BigDecimal.ZERO);
            line.setLineTotal(unitPrice.add(taxAmt));
            sub.addLine(line);

            sub.setSubtotal(unitPrice);
            sub.setDiscount(BigDecimal.ZERO);
            sub.setTax(taxAmt);
            sub.setTotalAmount(unitPrice.add(taxAmt));
            Subscription savedSub = subscriptionRepository.save(sub);

            // Create initial invoice
            Invoice inv = new Invoice();
            inv.setInvoiceNumber("INV-2026-0001");
            inv.setCustomer(customerUser);
            inv.setSubscription(savedSub);
            inv.setIssueDate(LocalDate.now().minusMonths(1));
            inv.setDueDate(LocalDate.now().minusMonths(1).plusDays(15));
            inv.setBillingPeriodStart(LocalDate.now().minusMonths(1));
            inv.setBillingPeriodEnd(LocalDate.now().minusDays(1));
            inv.setSubtotal(unitPrice);
            inv.setDiscountAmount(BigDecimal.ZERO);
            inv.setTaxAmount(taxAmt);
            inv.setTotalAmount(unitPrice.add(taxAmt));
            inv.setPaidAmount(unitPrice.add(taxAmt));
            inv.setBalanceDue(BigDecimal.ZERO);
            inv.setStatus(InvoiceStatus.PAID);
            inv.setNotes("First subscription period billing.");

            InvoiceLine invLine = new InvoiceLine();
            invLine.setProduct(coreProd);
            invLine.setProductVariant(entVariant);
            invLine.setProductName(coreProd.getName());
            invLine.setVariantName(entVariant != null ? entVariant.getVariantName() : null);
            invLine.setQuantity(1);
            invLine.setUnitPrice(unitPrice);
            invLine.setTaxRate(new BigDecimal("18.00"));
            invLine.setTaxAmount(taxAmt);
            invLine.setLineTotal(unitPrice.add(taxAmt));
            inv.addLine(invLine);
            Invoice savedInv = invoiceRepository.save(inv);

            BillingRecord record = new BillingRecord(savedSub, inv.getBillingPeriodStart(), inv.getBillingPeriodEnd(), savedInv);
            billingRecordRepository.save(record);

            Payment pay = new Payment();
            pay.setPaymentNumber("PAY-2026-0001");
            pay.setCustomer(customerUser);
            pay.setInvoice(savedInv);
            pay.setAmount(savedInv.getTotalAmount());
            pay.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
            pay.setTransactionReference("NEFT-HDFC-9988112233");
            pay.setPaymentDate(LocalDate.now().minusMonths(1).plusDays(2));
            pay.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(pay);

            logger.info("Seeded initial active subscription, invoice, and payment.");
        }

        logger.info("Brightloop seed data initialization complete.");
    }
}

