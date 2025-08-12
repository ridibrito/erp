-- =====================================================
-- NEXUS ERP - FINANCE CORE: PLANO DE CONTAS, PRODUTOS, FATURAS E ASSINATURAS
-- Migração: 002_finance_core.sql
-- Data: 2024-01-XX
-- =====================================================

-- =====================================================
-- 1. PLANO DE CONTAS
-- =====================================================

-- Plano de contas contábil
CREATE TABLE fin_chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_id UUID REFERENCES fin_chart_of_accounts(id),
  level INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, code)
);

-- Centro de custos
CREATE TABLE fin_cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES fin_cost_centers(id),
  level INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  budget_amount DECIMAL(15,2) DEFAULT 0,
  budget_currency VARCHAR(3) DEFAULT 'BRL',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, code)
);

-- =====================================================
-- 2. PRODUTOS E SERVIÇOS
-- =====================================================

-- Categorias de produtos/serviços
CREATE TABLE fin_product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES fin_product_categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Produtos e serviços
CREATE TABLE fin_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  sku VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('product', 'service', 'subscription')),
  category_id UUID REFERENCES fin_product_categories(id),
  unit VARCHAR(50) DEFAULT 'un',
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'BRL',
  cost DECIMAL(15,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_tracked BOOLEAN DEFAULT false, -- Para controle de estoque
  min_stock INTEGER DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Listas de preços
CREATE TABLE fin_price_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  currency VARCHAR(3) DEFAULT 'BRL',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Preços por lista
CREATE TABLE fin_price_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id UUID NOT NULL REFERENCES fin_price_lists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES fin_products(id) ON DELETE CASCADE,
  price DECIMAL(15,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(price_list_id, product_id)
);

-- =====================================================
-- 3. FATURAS E DOCUMENTOS
-- =====================================================

-- Faturas
CREATE TABLE fin_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  number VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('invoice', 'credit_note', 'debit_note')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid')),
  customer_id UUID NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_tax_id VARCHAR(50),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'BRL',
  notes TEXT,
  terms TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, number)
);

-- Itens da fatura
CREATE TABLE fin_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES fin_invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES fin_products(id),
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  cost_center_id UUID REFERENCES fin_cost_centers(id),
  account_id UUID REFERENCES fin_chart_of_accounts(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pagamentos
CREATE TABLE fin_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  invoice_id UUID REFERENCES fin_invoices(id),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  reference VARCHAR(255),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. ASSINATURAS E RECORRÊNCIA
-- =====================================================

-- Assinaturas
CREATE TABLE fin_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'custom')),
  billing_interval INTEGER DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE,
  next_billing_date DATE,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  auto_renew BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Itens da assinatura
CREATE TABLE fin_subscription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES fin_subscriptions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES fin_products(id),
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Histórico de cobranças da assinatura
CREATE TABLE fin_subscription_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES fin_subscriptions(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES fin_invoices(id),
  billing_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. MEIOS DE PAGAMENTO
-- =====================================================

-- Meios de pagamento
CREATE TABLE fin_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bank_transfer', 'credit_card', 'debit_card', 'pix', 'cash', 'check', 'other')),
  is_active BOOLEAN DEFAULT true,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contas bancárias
CREATE TABLE fin_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('checking', 'savings', 'investment')),
  account_number VARCHAR(50),
  agency VARCHAR(20),
  balance DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'BRL',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 6. IMPOSTOS E TRIBUTOS
-- =====================================================

-- Regimes de tributação
CREATE TABLE fin_tax_regimes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Alíquotas de impostos
CREATE TABLE fin_tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  rate DECIMAL(5,2) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('icms', 'pis', 'cofins', 'ipi', 'iss', 'irrf', 'inss', 'other')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 7. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para fin_chart_of_accounts
CREATE INDEX idx_chart_of_accounts_org_id ON fin_chart_of_accounts(org_id);
CREATE INDEX idx_chart_of_accounts_parent_id ON fin_chart_of_accounts(parent_id);
CREATE INDEX idx_chart_of_accounts_type ON fin_chart_of_accounts(type);

-- Índices para fin_cost_centers
CREATE INDEX idx_cost_centers_org_id ON fin_cost_centers(org_id);
CREATE INDEX idx_cost_centers_parent_id ON fin_cost_centers(parent_id);

-- Índices para fin_products
CREATE INDEX idx_products_org_id ON fin_products(org_id);
CREATE INDEX idx_products_category_id ON fin_products(category_id);
CREATE INDEX idx_products_sku ON fin_products(sku);
CREATE INDEX idx_products_type ON fin_products(type);

-- Índices para fin_price_lists
CREATE INDEX idx_price_lists_org_id ON fin_price_lists(org_id);
CREATE INDEX idx_price_lists_is_default ON fin_price_lists(is_default);

-- Índices para fin_price_list_items
CREATE INDEX idx_price_list_items_price_list_id ON fin_price_list_items(price_list_id);
CREATE INDEX idx_price_list_items_product_id ON fin_price_list_items(product_id);

-- Índices para fin_invoices
CREATE INDEX idx_invoices_org_id ON fin_invoices(org_id);
CREATE INDEX idx_invoices_customer_id ON fin_invoices(customer_id);
CREATE INDEX idx_invoices_status ON fin_invoices(status);
CREATE INDEX idx_invoices_issue_date ON fin_invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON fin_invoices(due_date);

-- Índices para fin_invoice_items
CREATE INDEX idx_invoice_items_invoice_id ON fin_invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product_id ON fin_invoice_items(product_id);

-- Índices para fin_payments
CREATE INDEX idx_payments_org_id ON fin_payments(org_id);
CREATE INDEX idx_payments_invoice_id ON fin_payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON fin_payments(payment_date);
CREATE INDEX idx_payments_status ON fin_payments(status);

-- Índices para fin_subscriptions
CREATE INDEX idx_subscriptions_org_id ON fin_subscriptions(org_id);
CREATE INDEX idx_subscriptions_customer_id ON fin_subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON fin_subscriptions(status);
CREATE INDEX idx_subscriptions_next_billing_date ON fin_subscriptions(next_billing_date);

-- Índices para fin_subscription_items
CREATE INDEX idx_subscription_items_subscription_id ON fin_subscription_items(subscription_id);
CREATE INDEX idx_subscription_items_product_id ON fin_subscription_items(product_id);

-- Índices para fin_subscription_bills
CREATE INDEX idx_subscription_bills_subscription_id ON fin_subscription_bills(subscription_id);
CREATE INDEX idx_subscription_bills_billing_date ON fin_subscription_bills(billing_date);

-- Índices para fin_payment_methods
CREATE INDEX idx_payment_methods_org_id ON fin_payment_methods(org_id);
CREATE INDEX idx_payment_methods_type ON fin_payment_methods(type);

-- Índices para fin_bank_accounts
CREATE INDEX idx_bank_accounts_org_id ON fin_bank_accounts(org_id);

-- =====================================================
-- 8. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Triggers para updated_at
CREATE TRIGGER update_fin_chart_of_accounts_updated_at BEFORE UPDATE ON fin_chart_of_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fin_cost_centers_updated_at BEFORE UPDATE ON fin_cost_centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fin_products_updated_at BEFORE UPDATE ON fin_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fin_price_lists_updated_at BEFORE UPDATE ON fin_price_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fin_price_list_items_updated_at BEFORE UPDATE ON fin_price_list_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fin_invoices_updated_at BEFORE UPDATE ON fin_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fin_payments_updated_at BEFORE UPDATE ON fin_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fin_subscriptions_updated_at BEFORE UPDATE ON fin_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fin_payment_methods_updated_at BEFORE UPDATE ON fin_payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fin_bank_accounts_updated_at BEFORE UPDATE ON fin_bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fin_tax_regimes_updated_at BEFORE UPDATE ON fin_tax_regimes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fin_tax_rates_updated_at BEFORE UPDATE ON fin_tax_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. DADOS INICIAIS (SEEDS)
-- =====================================================

-- Inserir categorias de produtos básicas
INSERT INTO fin_product_categories (org_id, name, description) VALUES
('00000000-0000-0000-0000-000000000000', 'Serviços de Consultoria', 'Serviços de consultoria e assessoria'),
('00000000-0000-0000-0000-000000000000', 'Desenvolvimento de Software', 'Desenvolvimento de sistemas e aplicações'),
('00000000-0000-0000-0000-000000000000', 'Infraestrutura', 'Serviços de infraestrutura e hospedagem'),
('00000000-0000-0000-0000-000000000000', 'Suporte Técnico', 'Serviços de suporte e manutenção');

-- Inserir produtos/serviços básicos
INSERT INTO fin_products (org_id, sku, name, description, type, category_id, price, currency) VALUES
('00000000-0000-0000-0000-000000000000', 'CONS-001', 'Consultoria Estratégica', 'Consultoria em estratégia de negócios', 'service', 
 (SELECT id FROM fin_product_categories WHERE name = 'Serviços de Consultoria' LIMIT 1), 500.00, 'BRL'),
('00000000-0000-0000-0000-000000000000', 'DEV-001', 'Desenvolvimento Web', 'Desenvolvimento de aplicações web', 'service',
 (SELECT id FROM fin_product_categories WHERE name = 'Desenvolvimento de Software' LIMIT 1), 150.00, 'BRL'),
('00000000-0000-0000-0000-000000000000', 'HOST-001', 'Hospedagem Cloud', 'Serviço de hospedagem em nuvem', 'subscription',
 (SELECT id FROM fin_product_categories WHERE name = 'Infraestrutura' LIMIT 1), 99.90, 'BRL'),
('00000000-0000-0000-0000-000000000000', 'SUP-001', 'Suporte Premium', 'Suporte técnico premium 24/7', 'subscription',
 (SELECT id FROM fin_product_categories WHERE name = 'Suporte Técnico' LIMIT 1), 199.90, 'BRL');

-- Inserir lista de preços padrão
INSERT INTO fin_price_lists (org_id, name, description, currency, is_default, is_active) VALUES
('00000000-0000-0000-0000-000000000000', 'Lista Padrão', 'Lista de preços padrão da empresa', 'BRL', true, true);

-- Inserir meios de pagamento básicos
INSERT INTO fin_payment_methods (org_id, name, type, is_active) VALUES
('00000000-0000-0000-0000-000000000000', 'PIX', 'pix', true),
('00000000-0000-0000-0000-000000000000', 'Cartão de Crédito', 'credit_card', true),
('00000000-0000-0000-0000-000000000000', 'Boleto Bancário', 'bank_transfer', true),
('00000000-0000-0000-0000-000000000000', 'Dinheiro', 'cash', true);

-- Inserir alíquotas de impostos básicas
INSERT INTO fin_tax_rates (org_id, name, rate, type, is_active) VALUES
('00000000-0000-0000-0000-000000000000', 'ICMS 18%', 18.00, 'icms', true),
('00000000-0000-0000-0000-000000000000', 'PIS 1.65%', 1.65, 'pis', true),
('00000000-0000-0000-0000-000000000000', 'COFINS 7.6%', 7.60, 'cofins', true),
('00000000-0000-0000-0000-000000000000', 'ISS 5%', 5.00, 'iss', true);

-- =====================================================
-- 10. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE fin_chart_of_accounts IS 'Plano de contas contábil da organização';
COMMENT ON TABLE fin_cost_centers IS 'Centros de custo para análise gerencial';
COMMENT ON TABLE fin_product_categories IS 'Categorias de produtos e serviços';
COMMENT ON TABLE fin_products IS 'Produtos, serviços e assinaturas';
COMMENT ON TABLE fin_price_lists IS 'Listas de preços para diferentes segmentos';
COMMENT ON TABLE fin_price_list_items IS 'Preços específicos por lista';
COMMENT ON TABLE fin_invoices IS 'Faturas e documentos fiscais';
COMMENT ON TABLE fin_invoice_items IS 'Itens das faturas';
COMMENT ON TABLE fin_payments IS 'Pagamentos recebidos';
COMMENT ON TABLE fin_subscriptions IS 'Assinaturas recorrentes';
COMMENT ON TABLE fin_subscription_items IS 'Itens das assinaturas';
COMMENT ON TABLE fin_subscription_bills IS 'Histórico de cobranças das assinaturas';
COMMENT ON TABLE fin_payment_methods IS 'Meios de pagamento disponíveis';
COMMENT ON TABLE fin_bank_accounts IS 'Contas bancárias da organização';
COMMENT ON TABLE fin_tax_regimes IS 'Regimes de tributação';
COMMENT ON TABLE fin_tax_rates IS 'Alíquotas de impostos e tributos';
