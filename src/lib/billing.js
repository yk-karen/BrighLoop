import { supabase } from './supabase'

export const BILLING_STATUSES = ['trialing', 'active', 'paused', 'past_due', 'canceled']
export const DEMO_CUSTOMER_ID = 'demo-customer'

const STORAGE_KEY = 'brightloop.billing.v1'

const demoState = {
  plans: [
    { id: 'plan-starter', name: 'Starter', description: 'For small teams getting started.', amount: 29, currency: 'USD', billing_interval: 'month', trial_days: 14, active: true },
    { id: 'plan-growth', name: 'Growth', description: 'Advanced tools for growing teams.', amount: 89, currency: 'USD', billing_interval: 'month', trial_days: 14, active: true },
    { id: 'plan-scale', name: 'Scale', description: 'Annual pricing for larger operations.', amount: 899, currency: 'USD', billing_interval: 'year', trial_days: 30, active: true },
  ],
  discounts: [
    { id: 'discount-welcome', code: 'WELCOME20', name: 'Welcome discount', type: 'percentage', value: 20, active: true },
    { id: 'discount-credit', code: 'CREDIT50', name: 'Account credit', type: 'fixed', value: 50, active: true },
  ],
  tax_rates: [
    { id: 'tax-standard', name: 'Standard VAT', percentage: 7.5, active: true },
    { id: 'tax-zero', name: 'Tax exempt', percentage: 0, active: true },
  ],
  subscriptions: [
    { id: 'sub-demo-growth', customer_id: DEMO_CUSTOMER_ID, plan_id: 'plan-growth', quantity: 3, status: 'active', discount_id: null, tax_rate_id: 'tax-standard', starts_at: '2026-09-01T00:00:00.000Z', current_period_start: '2026-09-01T00:00:00.000Z', current_period_end: '2026-11-01T00:00:00.000Z', notes: 'Demo workspace subscription', created_at: '2026-09-01T00:00:00.000Z' },
  ],
  invoices: [
    { id: 'inv-demo-001', invoice_number: 'INV-DEMO-001', customer_id: DEMO_CUSTOMER_ID, subscription_id: 'sub-demo-growth', status: 'open', subtotal: 267, discount_amount: 0, tax_amount: 20.03, total: 287.03, currency: 'USD', issued_at: '2026-09-01T00:00:00.000Z', due_at: '2026-09-15T00:00:00.000Z', period_start: '2026-09-01T00:00:00.000Z', period_end: '2026-10-01T00:00:00.000Z' },
  ],
  invoice_items: [{ id: 'item-demo-001', invoice_id: 'inv-demo-001', description: 'Growth', quantity: 3, unit_amount: 89, total: 267 }],
  quotation_templates: [{ id: 'quote-demo-001', name: 'Growth annual quote', description: 'Default annual growth proposal', plan_id: 'plan-scale', discount_id: null, tax_rate_id: 'tax-standard', terms: 'Payment due within 14 days.', created_at: '2026-09-01T00:00:00.000Z' }],
}

function getLocalState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // Fall back to the in-memory demo state when storage is unavailable.
  }
  return structuredClone(demoState)
}

function saveLocalState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // The current page still works for the session when storage is unavailable.
  }
}

function withRelations(state, collection) {
  return state[collection].map((item) => ({
    ...item,
    plan: state.plans.find((plan) => plan.id === item.plan_id),
    discount: state.discounts.find((discount) => discount.id === item.discount_id),
    tax_rate: state.tax_rates.find((tax) => tax.id === item.tax_rate_id),
  }))
}

export function calculateBillingTotals({ price, quantity = 1, taxRate = 0, discountType, discountValue = 0 }) {
  const subtotal = Math.max(0, Number(price || 0) * Math.max(1, Number(quantity || 1)))
  const discount = discountType === 'percentage'
    ? subtotal * Math.min(100, Math.max(0, Number(discountValue))) / 100
    : Math.min(subtotal, Math.max(0, Number(discountValue)))
  const taxable = Math.max(0, subtotal - discount)
  const tax = taxable * Math.max(0, Number(taxRate || 0)) / 100

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number((taxable + tax).toFixed(2)),
  }
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add the required VITE_SUPABASE environment variables.')
  }
  return supabase
}

export async function listPlans() {
  if (!supabase) return getLocalState().plans.filter((plan) => plan.active)
  const client = requireSupabase()
  const { data, error } = await client
    .from('plans')
    .select('id, name, description, amount, currency, billing_interval, trial_days, active')
    .eq('active', true)
    .order('amount')
  if (error) throw error
  return data || []
}

export async function listDiscounts() {
  if (!supabase) return getLocalState().discounts.filter((discount) => discount.active)
  const client = requireSupabase()
  const { data, error } = await client
    .from('discounts')
    .select('id, code, name, type, value, expires_at, active')
    .eq('active', true)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
    .order('name')
  if (error) throw error
  return data || []
}

export async function listTaxRates() {
  if (!supabase) return getLocalState().tax_rates.filter((tax) => tax.active)
  const client = requireSupabase()
  const { data, error } = await client
    .from('tax_rates')
    .select('id, name, percentage, active')
    .eq('active', true)
    .order('name')
  if (error) throw error
  return data || []
}

export async function listSubscriptions({ customerId } = {}) {
  if (!supabase) {
    const state = getLocalState()
    return withRelations(state, 'subscriptions').filter((subscription) => !customerId || subscription.customer_id === customerId)
  }
  const client = requireSupabase()
  let query = client
    .from('subscriptions')
    .select('*, plan:plans(name, amount, currency, billing_interval), discount:discounts(code, type, value), tax_rate:tax_rates(name, percentage)')
    .order('created_at', { ascending: false })
  if (customerId) query = query.eq('customer_id', customerId)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createSubscription({ customerId, planId, quantity, discountId, taxRateId, startsAt, notes }) {
  if (!supabase) {
    const state = getLocalState()
    const plan = state.plans.find((item) => item.id === planId)
    const discount = state.discounts.find((item) => item.id === discountId)
    const taxRate = state.tax_rates.find((item) => item.id === taxRateId)
    if (!plan) throw new Error('Select an active plan.')
    const start = startsAt ? new Date(startsAt) : new Date()
    const periodEnd = new Date(start)
    periodEnd.setMonth(periodEnd.getMonth() + (plan.billing_interval === 'year' ? 12 : 1))
    const totals = calculateBillingTotals({ price: plan.amount, quantity, discountType: discount?.type, discountValue: discount?.value, taxRate: taxRate?.percentage })
    const subscription = { id: `sub-${Date.now()}`, customer_id: customerId || DEMO_CUSTOMER_ID, plan_id: planId, quantity: Math.max(1, Number(quantity || 1)), status: plan.trial_days > 0 ? 'trialing' : 'active', discount_id: discountId || null, tax_rate_id: taxRateId || null, starts_at: start.toISOString(), current_period_start: start.toISOString(), current_period_end: periodEnd.toISOString(), notes: notes || null, created_at: new Date().toISOString() }
    const invoice = { id: `inv-${Date.now()}`, invoice_number: `INV-${String(Date.now()).slice(-8)}`, customer_id: subscription.customer_id, subscription_id: subscription.id, status: 'open', ...totals, currency: plan.currency, issued_at: new Date().toISOString(), due_at: new Date(Date.now() + 14 * 86400000).toISOString(), period_start: start.toISOString(), period_end: periodEnd.toISOString() }
    state.subscriptions.unshift(subscription)
    state.invoices.unshift(invoice)
    state.invoice_items.unshift({ id: `item-${Date.now()}`, invoice_id: invoice.id, description: plan.name, quantity: subscription.quantity, unit_amount: plan.amount, total: totals.subtotal })
    saveLocalState(state)
    return { subscription_id: subscription.id, invoice_id: invoice.id, total: totals.total }
  }
  const client = requireSupabase()
  const { data: userData, error: userError } = await client.auth.getUser()
  if (userError) throw userError
  const { data, error } = await client.rpc('create_subscription_with_invoice', {
    p_customer_id: customerId,
    p_plan_id: planId,
    p_quantity: Math.max(1, Number(quantity || 1)),
    p_discount_id: discountId || null,
    p_tax_rate_id: taxRateId || null,
    p_starts_at: startsAt || new Date().toISOString(),
    p_notes: notes || null,
    p_created_by: userData.user?.id || null,
  })
  if (error) throw error
  return data
}

export async function updateSubscriptionStatus(id, status) {
  if (!supabase) {
    const state = getLocalState()
    const subscription = state.subscriptions.find((item) => item.id === id)
    if (!subscription) throw new Error('Subscription not found.')
    subscription.status = status
    subscription.canceled_at = status === 'canceled' ? new Date().toISOString() : null
    saveLocalState(state)
    return subscription
  }
  const client = requireSupabase()
  const { data, error } = await client
    .from('subscriptions')
    .update({ status, canceled_at: status === 'canceled' ? new Date().toISOString() : null })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listInvoices({ customerId } = {}) {
  if (!supabase) {
    const state = getLocalState()
    return state.invoices
      .filter((invoice) => !customerId || invoice.customer_id === customerId)
      .map((invoice) => ({ ...invoice, subscription: { plan: state.plans.find((plan) => plan.id === state.subscriptions.find((item) => item.id === invoice.subscription_id)?.plan_id) }, invoice_items: state.invoice_items.filter((item) => item.invoice_id === invoice.id) }))
  }
  const client = requireSupabase()
  let query = client
    .from('invoices')
    .select('*, subscription:subscriptions(plan:plans(name)), invoice_items(description, quantity, unit_amount, total)')
    .order('issued_at', { ascending: false })
  if (customerId) query = query.eq('customer_id', customerId)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createQuotationTemplate({ name, description, planId, discountId, taxRateId, terms }) {
  if (!supabase) {
    const state = getLocalState()
    const quotation = { id: `quote-${Date.now()}`, name, description: description || null, plan_id: planId, discount_id: discountId || null, tax_rate_id: taxRateId || null, terms: terms || null, created_at: new Date().toISOString() }
    state.quotation_templates.unshift(quotation)
    saveLocalState(state)
    return quotation
  }
  const client = requireSupabase()
  const { data: userData, error: userError } = await client.auth.getUser()
  if (userError) throw userError
  const { data, error } = await client
    .from('quotation_templates')
    .insert({
      name,
      description: description || null,
      plan_id: planId,
      discount_id: discountId || null,
      tax_rate_id: taxRateId || null,
      terms: terms || null,
      created_by: userData.user?.id || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listQuotationTemplates() {
  if (!supabase) return withRelations(getLocalState(), 'quotation_templates')
  const client = requireSupabase()
  const { data, error } = await client
    .from('quotation_templates')
    .select('*, plan:plans(name, amount, currency, billing_interval), discount:discounts(code, type, value), tax_rate:tax_rates(name, percentage)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}
