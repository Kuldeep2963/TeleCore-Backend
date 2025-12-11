-- TeleCore Database Schema for PostgreSQL

-- Create database
CREATE DATABASE telecore_db;
\c telecore_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL CHECK (role IN ('Client', 'Internal', 'Admin')),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    wallet_threshold DECIMAL(10,2) DEFAULT 10.00,
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Countries table
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    countryname VARCHAR(100) UNIQUE NOT NULL,
    phonecode VARCHAR(10),
    availableproducts JSONB NOT NULL
);

-- Products/Services table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('DID', 'Freephone', 'Universal Freephone', 'Two Way Voice', 'Two Way SMS', 'Mobile')),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pricing plans table
CREATE TABLE pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
    nrc DECIMAL(10,4), -- Non-Recurring Charge
    mrc DECIMAL(10,4), -- Monthly Recurring Charge
    ppm DECIMAL(10,4), -- Per Minute Rate
    ppm_fix DECIMAL(10,4), -- Fixed line PPM
    ppm_mobile DECIMAL(10,4), -- Mobile PPM
    ppm_payphone DECIMAL(10,4), -- Payphone PPM
    arc DECIMAL(10,4), -- Additional Routing Charge
    mo DECIMAL(10,4), -- Mobile Originated
    mt DECIMAL(10,4), -- Mobile Terminated
    incoming_ppm DECIMAL(10,4),
    outgoing_ppm_fix DECIMAL(10,4),
    outgoing_ppm_mobile DECIMAL(10,4),
    incoming_sms DECIMAL(10,4),
    outgoing_sms DECIMAL(10,4),
    billing_pulse VARCHAR(20) DEFAULT '60/60',
    estimated_lead_time VARCHAR(50) DEFAULT '15 Days',
    contract_term VARCHAR(50) DEFAULT '1 Month',
    disconnection_notice_term VARCHAR(50) DEFAULT '1 Month',
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, country_id, effective_from)
);

-- Vendors table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Pricing table (pricing offered by vendors)
CREATE TABLE vendor_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
    area_codes TEXT[], -- Array of area codes available for this service
    nrc DECIMAL(10,4), -- Non-Recurring Charge
    mrc DECIMAL(10,4), -- Monthly Recurring Charge
    ppm DECIMAL(10,4), -- Per Minute Rate
    ppm_fix DECIMAL(10,4), -- Fixed line PPM
    ppm_mobile DECIMAL(10,4), -- Mobile PPM
    ppm_payphone DECIMAL(10,4), -- Payphone PPM
    arc DECIMAL(10,4), -- Additional Routing Charge
    mo DECIMAL(10,4), -- Mobile Originated
    mt DECIMAL(10,4), -- Mobile Terminated
    incoming_ppm DECIMAL(10,4),
    outgoing_ppm_fix DECIMAL(10,4),
    outgoing_ppm_mobile DECIMAL(10,4),
    incoming_sms DECIMAL(10,4),
    outgoing_sms DECIMAL(10,4),
    billing_pulse VARCHAR(20) DEFAULT '60/60',
    estimated_lead_time VARCHAR(50) DEFAULT '15 Days',
    contract_term VARCHAR(50) DEFAULT '1 Month',
    disconnection_notice_term VARCHAR(50) DEFAULT '1 Month',
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vendor_id, product_id, country_id)
);

-- Customers table (clients)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    contact_person VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    last_order_date DATE,
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
    area_code VARCHAR(50),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Confirmed', 'Amount Paid', 'Delivered', 'Cancelled')),
    order_date DATE DEFAULT CURRENT_DATE,
    completed_date DATE,
    documents TEXT[][],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order pricing (stores the pricing used for the order)
CREATE TABLE order_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    pricing_type VARCHAR(50) NOT NULL, -- 'current' or 'desired'
    nrc DECIMAL(10,4),
    mrc DECIMAL(10,4),
    ppm DECIMAL(10,4),
    ppm_fix DECIMAL(10,4),
    ppm_mobile DECIMAL(10,4),
    ppm_payphone DECIMAL(10,4),
    arc DECIMAL(10,4),
    mo DECIMAL(10,4),
    mt DECIMAL(10,4),
    incoming_ppm DECIMAL(10,4),
    outgoing_ppm_fix DECIMAL(10,4),
    outgoing_ppm_mobile DECIMAL(10,4),
    incoming_sms DECIMAL(10,4),
    outgoing_sms DECIMAL(10,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_id, pricing_type)
);

-- Numbers table (phone numbers)
CREATE TABLE numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    number VARCHAR(50) UNIQUE NOT NULL,
    country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    area_code VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active','Disconnected')),
    activation_date DATE,
    disconnection_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    mrc_amount DECIMAL(10,2) DEFAULT 0.00, -- Monthly Recurring Charges
    usage_amount DECIMAL(10,2) DEFAULT 0.00, -- Usage charges, can be updated by internal users
    amount DECIMAL(10,2) NOT NULL, -- Total amount (mrc_amount + usage_amount)
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Overdue')),
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    paid_date DATE,
    period VARCHAR(50), -- e.g., 'Jan-2025'
    from_date DATE,
    to_date DATE,
    notes TEXT,
    rate_per_minute DECIMAL(10,4) DEFAULT 0.00, -- Cost per minute for usage calculation
    duration INTEGER DEFAULT 0, -- Duration in seconds for usage charges
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- Disconnection requests table
CREATE TABLE disconnection_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number_id UUID REFERENCES numbers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Wallet transactions table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('Credit', 'Debit', 'Refund')),
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    reference_id VARCHAR(100), -- could reference invoice, order, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service details table (for coverage, restrictions, channels, portability)
CREATE TABLE service_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
    restrictions VARCHAR(255) DEFAULT 'None',
    channels VARCHAR(255) DEFAULT 'SMS, Voice',
    portability VARCHAR(50) DEFAULT 'Yes' CHECK (portability IN ('Yes', 'No')),
    fix_coverage VARCHAR(50) DEFAULT 'Supported' CHECK (fix_coverage IN ('Supported', 'Not Supported')),
    mobile_coverage VARCHAR(50) DEFAULT 'Supported' CHECK (mobile_coverage IN ('Supported', 'Not Supported')),
    payphone_coverage VARCHAR(50) DEFAULT 'Not Supported' CHECK (payphone_coverage IN ('Supported', 'Not Supported')),
    default_channels INTEGER DEFAULT 2,
    maximum_channels INTEGER DEFAULT 10,
    extra_channel_price DECIMAL(10,2) DEFAULT 45.00,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, country_id)
);

-- Required documents table
CREATE TABLE required_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
    document_code VARCHAR(100),
    document_name VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, country_id, document_code)
);
-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_numbers_number ON numbers(number);
CREATE INDEX idx_numbers_order_id ON numbers(order_id);
CREATE INDEX idx_numbers_user_id ON numbers(user_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_pricing_plans_product_country ON pricing_plans(product_id, country_id);
CREATE INDEX idx_vendor_pricing_vendor_product_country ON vendor_pricing(vendor_id, product_id, country_id);
CREATE INDEX idx_vendor_pricing_status ON vendor_pricing(status);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_service_details_product_country ON service_details(product_id, country_id);
CREATE INDEX idx_required_documents_product_country ON required_documents(product_id, country_id);
CREATE INDEX idx_required_documents_code ON required_documents(document_code);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_pricing_updated_at BEFORE UPDATE ON vendor_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_details_updated_at BEFORE UPDATE ON service_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_required_documents_updated_at BEFORE UPDATE ON required_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();