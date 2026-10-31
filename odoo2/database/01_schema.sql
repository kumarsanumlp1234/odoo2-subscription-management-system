-- ============================================================================
-- BRIGHTLOOP SOFTWARE - SUBSCRIPTION MANAGEMENT SYSTEM
-- Database Schema (MySQL 8.x / 9.x Compatible)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS brightloop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE brightloop_db;

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. ROLES & USERS
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS discount_usage;
DROP TABLE IF EXISTS discount_plans;
DROP TABLE IF EXISTS discount_products;
DROP TABLE IF EXISTS discounts;
DROP TABLE IF EXISTS billing_records;
DROP TABLE IF EXISTS invoice_lines;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS subscription_discounts;
DROP TABLE IF EXISTS subscription_history;
DROP TABLE IF EXISTS subscription_lines;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS quotation_lines;
DROP TABLE IF EXISTS quotations;
DROP TABLE IF EXISTS quotation_templates;
DROP TABLE IF EXISTS subscription_plans;
DROP TABLE IF EXISTS product_taxes;
DROP TABLE IF EXISTS taxes;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS staff_profiles;
DROP TABLE IF EXISTS customer_profiles;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_active (active)
) ENGINE=InnoDB;

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE customer_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    company_name VARCHAR(150),
    gst_number VARCHAR(30),
    billing_address_line1 VARCHAR(255),
    billing_address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    payment_terms VARCHAR(50) DEFAULT 'Immediate',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE staff_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    department VARCHAR(100),
    designation VARCHAR(100),
    employee_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. PRODUCTS, VARIANTS & TAXES
-- ----------------------------------------------------------------------------
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    product_type ENUM('SERVICE', 'PHYSICAL') NOT NULL DEFAULT 'SERVICE',
    sales_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    cost_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    notes TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_prod_name (name),
    INDEX idx_prod_type (product_type),
    INDEX idx_prod_active (active)
) ENGINE=InnoDB;

CREATE TABLE product_variants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    variant_name VARCHAR(150) NOT NULL,
    additional_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    sku VARCHAR(100) UNIQUE,
    description VARCHAR(255),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pv_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_pv_sku (sku)
) ENGINE=InnoDB;

CREATE TABLE taxes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tax_name VARCHAR(100) NOT NULL,
    tax_rate DECIMAL(6, 2) NOT NULL, -- e.g., 9.00 for 9%
    tax_type VARCHAR(50) NOT NULL DEFAULT 'PERCENTAGE', -- CGST, SGST, IGST, VAT
    description VARCHAR(255),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tax_name (tax_name),
    INDEX idx_tax_active (active)
) ENGINE=InnoDB;

CREATE TABLE product_taxes (
    product_id BIGINT NOT NULL,
    tax_id BIGINT NOT NULL,
    PRIMARY KEY (product_id, tax_id),
    CONSTRAINT fk_pt_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_pt_tax FOREIGN KEY (tax_id) REFERENCES taxes(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. SUBSCRIPTION PLANS
-- ----------------------------------------------------------------------------
CREATE TABLE subscription_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(150) NOT NULL,
    description TEXT,
    billing_frequency ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') NOT NULL,
    billing_interval INT NOT NULL DEFAULT 1, -- e.g. every 1 month, every 3 months
    base_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    minimum_quantity INT NOT NULL DEFAULT 1,
    available_from DATE,
    available_until DATE,
    auto_close BOOLEAN DEFAULT FALSE NOT NULL,
    allow_early_closure BOOLEAN DEFAULT TRUE NOT NULL,
    allow_pause BOOLEAN DEFAULT TRUE NOT NULL,
    allow_manual_renewal BOOLEAN DEFAULT TRUE NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_plan_name (plan_name),
    INDEX idx_plan_active (active)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. QUOTATION TEMPLATES & QUOTATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE quotation_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(150) NOT NULL,
    description TEXT,
    validity_days INT NOT NULL DEFAULT 30,
    default_plan_id BIGINT,
    default_discount DECIMAL(6, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_qt_plan FOREIGN KEY (default_plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE quotations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quotation_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    subscription_plan_id BIGINT NOT NULL,
    quotation_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    subtotal DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    status ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'DRAFT',
    notes TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_q_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_q_plan FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    CONSTRAINT fk_q_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_q_number (quotation_number),
    INDEX idx_q_status (status)
) ENGINE=InnoDB;

CREATE TABLE quotation_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quotation_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_variant_id BIGINT,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    tax_rate DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    line_total DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_ql_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    CONSTRAINT fk_ql_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ql_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. SUBSCRIPTIONS & LIFECYCLE
-- ----------------------------------------------------------------------------
CREATE TABLE subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subscription_number VARCHAR(60) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    subscription_plan_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    next_billing_date DATE NOT NULL,
    billing_frequency ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') NOT NULL,
    payment_terms VARCHAR(50) DEFAULT 'Immediate',
    status ENUM('DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    subtotal DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sub_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sub_plan FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sub_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sub_number (subscription_number),
    INDEX idx_sub_status (status),
    INDEX idx_sub_next_billing (next_billing_date),
    INDEX idx_sub_customer (customer_id)
) ENGINE=InnoDB;

CREATE TABLE subscription_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_variant_id BIGINT,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    tax_rate DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    line_total DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_sl_sub FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    CONSTRAINT fk_sl_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sl_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE subscription_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    previous_state VARCHAR(50) NOT NULL,
    new_state VARCHAR(50) NOT NULL,
    changed_by BIGINT,
    reason VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sh_sub FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    CONSTRAINT fk_sh_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sh_sub (subscription_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. DISCOUNTS & PROMOTIONAL RULES
-- ----------------------------------------------------------------------------
CREATE TABLE discounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    discount_name VARCHAR(150) NOT NULL,
    discount_type ENUM('FIXED_AMOUNT', 'PERCENTAGE') NOT NULL,
    discount_value DECIMAL(12, 2) NOT NULL,
    minimum_purchase_amount DECIMAL(12, 2) DEFAULT 0.00,
    minimum_quantity INT DEFAULT 1,
    start_date DATE,
    end_date DATE,
    maximum_usage INT DEFAULT 0, -- 0 for unlimited
    usage_count INT DEFAULT 0 NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_disc_name (discount_name),
    INDEX idx_disc_active (active)
) ENGINE=InnoDB;

CREATE TABLE discount_products (
    discount_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    PRIMARY KEY (discount_id, product_id),
    CONSTRAINT fk_dp_discount FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_dp_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE discount_plans (
    discount_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    PRIMARY KEY (discount_id, plan_id),
    CONSTRAINT fk_dpl_discount FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_dpl_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE subscription_discounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    discount_id BIGINT NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sd_sub FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    CONSTRAINT fk_sd_discount FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7. INVOICES & AUTOMATED BILLING RECORD
-- ----------------------------------------------------------------------------
CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(60) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    subscription_id BIGINT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    subtotal DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    balance_due DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    status ENUM('DRAFT', 'CONFIRMED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    pdf_path VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_inv_sub FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
    INDEX idx_inv_number (invoice_number),
    INDEX idx_inv_customer (customer_id),
    INDEX idx_inv_status (status),
    INDEX idx_inv_due_date (due_date)
) ENGINE=InnoDB;

CREATE TABLE invoice_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    product_id BIGINT,
    product_variant_id BIGINT,
    product_name VARCHAR(200) NOT NULL,
    variant_name VARCHAR(150),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    line_total DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_il_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT fk_il_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    CONSTRAINT fk_il_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- CRITICAL: Duplicate Billing Prevention Table
CREATE TABLE billing_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    invoice_id BIGINT NOT NULL,
    billed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_br_sub FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    CONSTRAINT fk_br_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT uq_sub_billing_cycle UNIQUE (subscription_id, billing_period_start)
) ENGINE=InnoDB;

CREATE TABLE discount_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    discount_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    subscription_id BIGINT,
    invoice_id BIGINT NOT NULL,
    discount_amount DECIMAL(12, 2) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_du_discount FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_du_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_du_sub FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
    CONSTRAINT fk_du_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT uq_discount_per_invoice UNIQUE (discount_id, invoice_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 8. PAYMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_number VARCHAR(60) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    invoice_id BIGINT NOT NULL,
    amount DECIMAL(14, 2) NOT NULL,
    payment_method ENUM('CASH', 'BANK_TRANSFER', 'UPI', 'CARD', 'OTHER') NOT NULL,
    transaction_reference VARCHAR(100) NOT NULL UNIQUE,
    payment_date DATE NOT NULL,
    notes TEXT,
    status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pay_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pay_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_pay_number (payment_number),
    INDEX idx_pay_invoice (invoice_id),
    INDEX idx_pay_customer (customer_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 9. AUTH TOKENS & AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(120) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_prt_token (token)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_al_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_al_entity (entity_name, entity_id),
    INDEX idx_al_timestamp (timestamp)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

