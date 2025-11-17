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
    availableproducts TEXT[] NOT NULL
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
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Confirmed', 'Amount Paid', 'Delivered', 'Cancelled')),
    order_date DATE DEFAULT CURRENT_DATE,
    completed_date DATE,
    notes TEXT,
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
    outgoing_sms DECIMAL(10,4)
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
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Disconnected', 'Pending')),
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
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Overdue', 'Cancelled')),
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    paid_date DATE,
    period VARCHAR(50), -- e.g., 'Jan-2025'
    from_date DATE,
    to_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoice items (for detailed billing)
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    service_period_start DATE,
    service_period_end DATE
);

-- Disconnection requests table
CREATE TABLE disconnection_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number_id UUID REFERENCES numbers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
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
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);

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

-- Insert initial data
INSERT INTO countries (id, countryname, phonecode, availableproducts) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'United States', '+1', ARRAY['DID', 'Freephone', 'Universal Freephone', 'Mobile']),
('550e8400-e29b-41d4-a716-446655440001', 'United Kingdom', '+44', ARRAY['DID', 'Freephone', 'Universal Freephone', 'Mobile']),
('550e8400-e29b-41d4-a716-446655440002', 'Canada', '+1', ARRAY['DID', 'Freephone', 'Universal Freephone', 'Mobile']),
('550e8400-e29b-41d4-a716-446655440003', 'Australia', '+61', ARRAY['DID', 'Freephone', 'Universal Freephone', 'Mobile']),
('550e8400-e29b-41d4-a716-446655440004', 'Myanmar', '+95', ARRAY['DID', 'Freephone', 'Universal Freephone', 'Mobile']),
('550e8400-e29b-41d4-a716-446655440005', 'Singapore', '+65', ARRAY['DID', 'Freephone', 'Universal Freephone', 'Mobile']);

INSERT INTO products (name, code, description, category) VALUES
('DID', 'did', 'Direct Inward Dialing numbers', 'DID'),
('Freephone', 'freephone', 'Toll-free numbers', 'Freephone'),
('Universal Freephone', 'universal-freephone', 'Universal toll-free numbers', 'Universal Freephone'),
('Two Way Voice', 'two-way-voice', 'Bidirectional voice calling', 'Two Way Voice'),
('Two Way SMS', 'two-way-sms', 'Bidirectional SMS service', 'Two Way SMS'),
('Mobile', 'mobile', 'Mobile number services', 'Mobile');

-- Sample pricing for US DID
INSERT INTO pricing_plans (product_id, country_id, nrc, mrc, ppm) VALUES
((SELECT id FROM products WHERE code = 'did'), '550e8400-e29b-41d4-a716-446655440000', 24.00, 24.00, 0.0380);

-- Sample users
INSERT INTO users (email, password_hash, first_name, last_name, role, wallet_balance) VALUES
('admin@telecore.com', '$2b$10$dummy.hash.for.demo', 'Admin', 'User', 'Admin', 1000.00),
('internal@telecore.com', '$2b$10$dummy.hash.for.demo', 'Internal', 'User', 'Internal', 500.00),
('sarah@telecore.com', '$2b$10$dummy.hash.for.demo', 'Sarah', 'Johnson', 'Client', 250.00),
('john.smith@email.com', '$2b$10$dummy.hash.for.demo', 'John', 'Smith', 'Client', 150.00),
('mike.chen@email.com', '$2b$10$dummy.hash.for.demo', 'Mike', 'Chen', 'Client', 300.00),
('emma.davis@email.com', '$2b$10$dummy.hash.for.demo', 'Emma', 'Davis', 'Client', 200.00)
ON CONFLICT DO NOTHING;

