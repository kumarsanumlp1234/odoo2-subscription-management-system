-- ============================================================================
-- BRIGHTLOOP SOFTWARE - SEED DATA SCRIPT
-- Default Roles, Admin, Staff, Customer, Taxes, Products, Plans, Subscriptions
-- ============================================================================

USE brightloop_db;

-- 1. Insert Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_ADMIN', 'Full system control, configurations, staff & billing management'),
(2, 'ROLE_STAFF', 'Operational day-to-day staff: quotations, subscriptions, invoices, payments'),
(3, 'ROLE_CUSTOMER', 'Customer portal access: view subscriptions, invoices, payments, profile')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 2. Insert Users
-- Passwords:
-- Admin:    Admin@123    -> $2a$10$X7vQ43J4yXm9P9aQ0GvXMeY0L4nN8u6B3s5D2F1H0K7J9L8M7N6P5 (BCrypt hash)
-- Staff:    Staff@123    -> $2a$10$6WqT9vQ2aJbM6rS5tU7vXeR4pZ1yK3wO5uL7mN9bQ8vX1s3D5f7H9 (BCrypt hash)
-- Customer: Customer@123 -> $2a$10$8YsU1wS4bKcO8tU7vW9xYeT6rB3zM5xQ7wN9oP1cR0wY3u5F7h9J1 (BCrypt hash)
-- Note: A CommandLineRunner in Spring Boot will also verify/encode these on boot.

INSERT INTO users (id, full_name, email, password_hash, phone_number, active) VALUES
(1, 'System Administrator', 'admin@brightloop.io', '$2a$10$wsqrXzP/g4F3tO6Z7qVj8.Kx7U0eGvEaR4m2F3l8yN1d6E5a7u8.m', '+91 9876543210', TRUE),
(2, 'Sarah Jenkins (Ops Staff)', 'staff@brightloop.io', '$2a$10$wsqrXzP/g4F3tO6Z7qVj8.Kx7U0eGvEaR4m2F3l8yN1d6E5a7u8.m', '+91 9876543211', TRUE),
(3, 'Acme Corp (John Doe)', 'customer@brightloop.io', '$2a$10$wsqrXzP/g4F3tO6Z7qVj8.Kx7U0eGvEaR4m2F3l8yN1d6E5a7u8.m', '+91 9876543212', TRUE),
(4, 'Globex Inc (Alice Smith)', 'alice@globex.com', '$2a$10$wsqrXzP/g4F3tO6Z7qVj8.Kx7U0eGvEaR4m2F3l8yN1d6E5a7u8.m', '+91 9876543213', TRUE)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 3. Assign User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- Admin has ROLE_ADMIN
(2, 2), -- Staff has ROLE_STAFF
(3, 3), -- Customer has ROLE_CUSTOMER
(4, 3)  -- Customer has ROLE_CUSTOMER
ON DUPLICATE KEY UPDATE role_id=VALUES(role_id);

-- 4. Customer Profiles
INSERT INTO customer_profiles (id, user_id, company_name, gst_number, billing_address_line1, billing_address_line2, city, state, postal_code, country, payment_terms, notes) VALUES
(1, 3, 'Acme Technologies Pvt Ltd', '29ABCDE1234F1Z5', 'Suite 404, Tech Park', 'Outer Ring Road', 'Bengaluru', 'Karnataka', '560103', 'India', 'Net 15', 'Key enterprise client for cloud and ERP.'),
(2, 4, 'Globex Digital Solutions', '27ABCDE5678F1Z2', 'Tower B, Nariman Point', 'Marine Lines', 'Mumbai', 'Maharashtra', '400021', 'India', 'Immediate', 'SaaS platform client.')
ON DUPLICATE KEY UPDATE company_name=VALUES(company_name);

-- 5. Staff Profiles
INSERT INTO staff_profiles (id, user_id, department, designation, employee_code) VALUES
(1, 2, 'Customer Operations', 'Senior Billing & Subscription Specialist', 'BL-EMP-042')
ON DUPLICATE KEY UPDATE designation=VALUES(designation);

-- 6. Taxes (Percentage-based, supporting Indian GST: CGST, SGST, IGST, etc.)
INSERT INTO taxes (id, tax_name, tax_rate, tax_type, description, active) VALUES
(1, 'GST 18% (Standard SaaS)', 18.00, 'PERCENTAGE', '18% Integrated GST for software & SaaS services', TRUE),
(2, 'CGST 9% (Intra-State)', 9.00, 'PERCENTAGE', '9% Central GST for domestic services', TRUE),
(3, 'SGST 9% (Intra-State)', 9.00, 'PERCENTAGE', '9% State GST for domestic services', TRUE),
(4, 'GST 5% (Essentials)', 5.00, 'PERCENTAGE', '5% Concessional rate', TRUE),
(5, 'Zero Tax (Export / Exempt)', 0.00, 'PERCENTAGE', 'Exempted or International export transactions', TRUE)
ON DUPLICATE KEY UPDATE tax_rate=VALUES(tax_rate);

-- 7. Products (SERVICE & PHYSICAL)
INSERT INTO products (id, name, product_type, sales_price, cost_price, description, notes, active) VALUES
(1, 'BrightCloud Core Platform', 'SERVICE', 1000.00, 250.00, 'Enterprise Cloud subscription backend with automated sync and unlimited API calls.', 'Includes 99.9% SLA.', TRUE),
(2, 'Brightloop Analytics Suite', 'SERVICE', 1500.00, 400.00, 'Real-time telemetry, predictive cohort churn, and MRR forecasting engine.', 'Add-on analytics suite.', TRUE),
(3, 'Dedicated Hardware Security Module (HSM)', 'PHYSICAL', 5000.00, 3200.00, 'On-premise cryptographic hardware key vault for banking grade compliance.', 'Ships within 3 business days.', TRUE),
(4, 'Premium Support & SLA Desk', 'SERVICE', 800.00, 150.00, '24/7 Priority support hotline with 15-minute response SLA.', 'Billed recurringly.', TRUE)
ON DUPLICATE KEY UPDATE sales_price=VALUES(sales_price);

-- 8. Product Variants (Brand-based / Tier adjustments, e.g. adding 560 to base price)
INSERT INTO product_variants (id, product_id, variant_name, additional_price, sku, description, active) VALUES
(1, 1, 'Basic Tier', 0.00, 'BC-CORE-BSC', 'Base tier single node cloud deployment', TRUE),
(2, 1, 'Standard Tier', 250.00, 'BC-CORE-STD', 'High availability multi-region failover (Adds ₹250)', TRUE),
(3, 1, 'Enterprise Variant', 560.00, 'BC-CORE-ENT', 'Dedicated VPC, custom domain & audit vault (Adds ₹560)', TRUE),
(4, 2, 'Starter Analytics', 0.00, 'BL-ANA-STR', 'Up to 10 dashboards and 50k events', TRUE),
(5, 2, 'Pro Analytics', 750.00, 'BL-ANA-PRO', 'Unlimited dashboards, automated email digests (Adds ₹750)', TRUE)
ON DUPLICATE KEY UPDATE additional_price=VALUES(additional_price);

-- 9. Product Taxes Link
INSERT INTO product_taxes (product_id, tax_id) VALUES
(1, 1), -- BrightCloud Core -> GST 18%
(2, 1), -- Analytics Suite -> GST 18%
(3, 1), -- Hardware HSM -> GST 18%
(4, 1)  -- Premium Support -> GST 18%
ON DUPLICATE KEY UPDATE tax_id=VALUES(tax_id);

-- 10. Subscription Plans
INSERT INTO subscription_plans (id, plan_name, description, billing_frequency, billing_interval, base_price, minimum_quantity, available_from, available_until, auto_close, allow_early_closure, allow_pause, allow_manual_renewal, active) VALUES
(1, 'BrightCloud Monthly Starter', 'Monthly billed subscription with flexible pause and early closure.', 'MONTHLY', 1, 1000.00, 1, '2025-01-01', '2030-12-31', FALSE, TRUE, TRUE, TRUE, TRUE),
(2, 'BrightCloud Quarterly Growth', 'Quarterly recurring plan billed every 3 months with 5% savings.', 'MONTHLY', 3, 2850.00, 1, '2025-01-01', '2030-12-31', FALSE, TRUE, TRUE, TRUE, TRUE),
(3, 'BrightCloud Annual Enterprise', 'Yearly contract billed every 12 months with high discounts.', 'YEARLY', 1, 10000.00, 1, '2025-01-01', '2030-12-31', FALSE, TRUE, TRUE, TRUE, TRUE),
(4, 'Weekly Micro-Service Pass', 'Billed weekly for temporary high-compute staging projects.', 'WEEKLY', 1, 300.00, 1, '2025-01-01', '2028-12-31', TRUE, TRUE, FALSE, TRUE, TRUE)
ON DUPLICATE KEY UPDATE plan_name=VALUES(plan_name);

-- 11. Discounts & Promotional Rules
INSERT INTO discounts (id, discount_name, discount_type, discount_value, minimum_purchase_amount, minimum_quantity, start_date, end_date, maximum_usage, usage_count, active) VALUES
(1, 'WELCOME10', 'PERCENTAGE', 10.00, 500.00, 1, '2025-01-01', '2027-12-31', 100, 2, TRUE),
(2, 'SAVE500', 'FIXED_AMOUNT', 500.00, 2000.00, 1, '2025-01-01', '2027-12-31', 50, 1, TRUE),
(3, 'ENTERPRISE20', 'PERCENTAGE', 20.00, 5000.00, 2, '2025-01-01', '2027-12-31', 25, 0, TRUE)
ON DUPLICATE KEY UPDATE discount_value=VALUES(discount_value);

-- 12. Quotation Templates
INSERT INTO quotation_templates (id, template_name, description, validity_days, default_plan_id, default_discount) VALUES
(1, 'Standard SaaS Onboarding Template', 'Default quotation pack for new SaaS customers including Core + Support.', 30, 1, 10.00),
(2, 'Enterprise Cloud Migration Template', 'Annual package with Core Enterprise variant, HSM, and 24/7 SLA desk.', 45, 3, 15.00)
ON DUPLICATE KEY UPDATE template_name=VALUES(template_name);

-- 13. Sample Quotation
INSERT INTO quotations (id, quotation_number, customer_id, subscription_plan_id, quotation_date, expiry_date, subtotal, discount, tax, total_amount, status, notes, created_by) VALUES
(1, 'QT-2026-0001', 3, 1, '2026-10-01', '2026-11-01', 1560.00, 156.00, 252.72, 1656.72, 'ACCEPTED', 'Quotation approved by Acme CTO.', 2)
ON DUPLICATE KEY UPDATE quotation_number=VALUES(quotation_number);

INSERT INTO quotation_lines (id, quotation_id, product_id, product_variant_id, quantity, unit_price, tax_rate, tax_amount, discount_amount, line_total) VALUES
(1, 1, 1, 3, 1, 1560.00, 18.00, 252.72, 156.00, 1656.72)
ON DUPLICATE KEY UPDATE line_total=VALUES(line_total);

-- 14. Sample Active Subscriptions
INSERT INTO subscriptions (id, subscription_number, customer_id, subscription_plan_id, start_date, end_date, next_billing_date, billing_frequency, payment_terms, status, subtotal, discount, tax, total_amount, created_by) VALUES
(1, 'SUB-2026-0001', 3, 1, '2026-10-01', '2027-10-01', '2026-11-01', 'MONTHLY', 'Net 15', 'ACTIVE', 1560.00, 156.00, 252.72, 1656.72, 2),
(2, 'SUB-2026-0002', 4, 3, '2026-01-01', '2027-01-01', '2027-01-01', 'YEARLY', 'Immediate', 'ACTIVE', 10000.00, 500.00, 1710.00, 11210.00, 2)
ON DUPLICATE KEY UPDATE subscription_number=VALUES(subscription_number);

INSERT INTO subscription_lines (id, subscription_id, product_id, product_variant_id, quantity, unit_price, tax_rate, tax_amount, discount_amount, line_total) VALUES
(1, 1, 1, 3, 1, 1560.00, 18.00, 252.72, 156.00, 1656.72),
(2, 2, 1, 1, 1, 10000.00, 18.00, 1710.00, 500.00, 11210.00)
ON DUPLICATE KEY UPDATE line_total=VALUES(line_total);

INSERT INTO subscription_history (id, subscription_id, previous_state, new_state, changed_by, reason) VALUES
(1, 1, 'DRAFT', 'QUOTATION', 2, 'Generated from quotation QT-2026-0001'),
(2, 1, 'QUOTATION', 'CONFIRMED', 2, 'Customer confirmed terms'),
(3, 1, 'CONFIRMED', 'ACTIVE', 2, 'Activated upon first invoice processing'),
(4, 2, 'DRAFT', 'ACTIVE', 2, 'Direct enterprise activation')
ON DUPLICATE KEY UPDATE reason=VALUES(reason);

-- 15. Invoices & Billing Records
INSERT INTO invoices (id, invoice_number, customer_id, subscription_id, issue_date, due_date, billing_period_start, billing_period_end, subtotal, discount_amount, tax_amount, total_amount, paid_amount, balance_due, status, notes) VALUES
(1, 'INV-2026-0001', 3, 1, '2026-10-01', '2026-10-16', '2026-10-01', '2026-10-31', 1560.00, 156.00, 252.72, 1656.72, 1656.72, 0.00, 'PAID', 'First monthly billing cycle.'),
(2, 'INV-2026-0002', 4, 2, '2026-01-01', '2026-01-15', '2026-01-01', '2026-12-31', 10000.00, 500.00, 1710.00, 11210.00, 11210.00, 0.00, 'PAID', 'Annual advance subscription invoice.')
ON DUPLICATE KEY UPDATE invoice_number=VALUES(invoice_number);

INSERT INTO invoice_lines (id, invoice_id, product_id, product_variant_id, product_name, variant_name, quantity, unit_price, discount_amount, tax_rate, tax_amount, line_total) VALUES
(1, 1, 1, 3, 'BrightCloud Core Platform', 'Enterprise Variant (+560)', 1, 1560.00, 156.00, 18.00, 252.72, 1656.72),
(2, 2, 1, 1, 'BrightCloud Core Platform', 'Basic Tier', 1, 10000.00, 500.00, 18.00, 1710.00, 11210.00)
ON DUPLICATE KEY UPDATE line_total=VALUES(line_total);

INSERT INTO billing_records (id, subscription_id, billing_period_start, billing_period_end, invoice_id) VALUES
(1, 1, '2026-10-01', '2026-10-31', 1),
(2, 2, '2026-01-01', '2026-12-31', 2)
ON DUPLICATE KEY UPDATE invoice_id=VALUES(invoice_id);

-- 16. Payments
INSERT INTO payments (id, payment_number, customer_id, invoice_id, amount, payment_method, transaction_reference, payment_date, notes, status) VALUES
(1, 'PAY-2026-0001', 3, 1, 1656.72, 'BANK_TRANSFER', 'NEFT-HDFC-9988112233', '2026-10-02', 'Full payment for monthly subscription', 'SUCCESS'),
(2, 'PAY-2026-0002', 4, 2, 11210.00, 'CARD', 'STRIPE-TXN-CH-55443322', '2026-01-02', 'Annual enterprise card charge', 'SUCCESS')
ON DUPLICATE KEY UPDATE payment_number=VALUES(payment_number);

