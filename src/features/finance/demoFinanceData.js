const DEMO_CUSTOMERS = [
  { id: 'cust-northstar', name: 'Northstar Labs', email: 'northstar@brightloop.demo', planId: 'plan-growth', monthlyValue: 2400 },
  { id: 'cust-summit', name: 'Summit Works', email: 'summit@brightloop.demo', planId: 'plan-scale', monthlyValue: 1800 },
  { id: 'cust-harbor', name: 'Harbor AI', email: 'harbor@brightloop.demo', planId: 'plan-enterprise', monthlyValue: 3200 },
  { id: 'cust-aster', name: 'Aster Studio', email: 'aster@brightloop.demo', planId: 'plan-starter', monthlyValue: 1400 },
  { id: 'cust-vantedge', name: 'Vantedge', email: 'vantedge@brightloop.demo', planId: 'plan-growth', monthlyValue: 2200 },
  { id: 'cust-mirova', name: 'Mirova Health', email: 'mirova@brightloop.demo', planId: 'plan-scale', monthlyValue: 2700 },
  { id: 'cust-helio', name: 'Helio Labs', email: 'helio@brightloop.demo', planId: 'plan-enterprise', monthlyValue: 3600 },
  { id: 'cust-zenith', name: 'Zenith Retail', email: 'zenith@brightloop.demo', planId: 'plan-starter', monthlyValue: 1250 },
]

const DEMO_PLANS = [
  { id: 'plan-starter', name: 'Starter', monthlyPrice: 590 },
  { id: 'plan-growth', name: 'Growth', monthlyPrice: 2400 },
  { id: 'plan-scale', name: 'Scale', monthlyPrice: 1800 },
  { id: 'plan-enterprise', name: 'Enterprise', monthlyPrice: 3200 },
]

const MONTHLY_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function pad(value) {
  return String(value).padStart(2, '0')
}

function parseDate(value) {
  return new Date(`${value}T00:00:00Z`)
}

function formatDate(date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

function addDays(date, days) {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function getMonthKey(date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`
}

function getLastSixMonths() {
  const result = []
  const now = new Date('2026-10-01T00:00:00Z')
  for (let index = 5; index >= 0; index -= 1) {
    const monthDate = new Date(now)
    monthDate.setUTCMonth(now.getUTCMonth() - index)
    result.push({
      month: MONTHLY_LABELS[monthDate.getUTCMonth()],
      key: getMonthKey(monthDate),
    })
  }
  return result
}

function buildDemoDataset() {
  const customers = DEMO_CUSTOMERS.map((customer) => ({
    ...customer,
    companyName: customer.name,
    status: 'active',
  }))

  const plans = DEMO_PLANS.map((plan) => ({
    ...plan,
    status: 'active',
  }))

  const subscriptions = customers.map((customer, index) => ({
    id: `sub-${String(index + 1).padStart(4, '0')}`,
    customerId: customer.id,
    planId: customer.planId,
    planName: plans.find((plan) => plan.id === customer.planId)?.name || 'Growth',
    status: 'active',
    billingCycle: 'monthly',
    amount: customer.monthlyValue,
    createdAt: formatDate(addDays(new Date('2025-01-15T00:00:00Z'), index * 12)),
    renewalDate: formatDate(addDays(new Date('2026-10-15T00:00:00Z'), index * 3)),
  }))

  const invoices = []
  const payments = []
  const statusCycle = ['paid', 'paid', 'paid', 'pending', 'overdue', 'failed', 'paid', 'partial']

  for (let index = 0; index < 2200; index += 1) {
    const customer = customers[index % customers.length]
    const subscription = subscriptions.find((item) => item.customerId === customer.id)
    const issueDate = addDays(new Date('2025-01-01T00:00:00Z'), index * 4)
    const dueDate = addDays(issueDate, 14 + (index % 7))
    const amount = Math.round((customer.monthlyValue * (0.7 + ((index % 9) * 0.12))) / 10) * 10
    const status = statusCycle[index % statusCycle.length]
    const outstanding = status === 'paid' ? 0 : status === 'failed' ? amount : status === 'partial' ? Math.round(amount * 0.42) : amount

    const invoiceId = `INV-${1000 + index}`
    const invoiceRecord = {
      id: invoiceId,
      invoiceNumber: invoiceId,
      customerId: customer.id,
      customer: customer.name,
      subscriptionId: subscription?.id || 'sub-0001',
      status,
      amount,
      outstanding,
      issueDate: formatDate(issueDate),
      dueDate: formatDate(dueDate),
      month: issueDate.toLocaleString('en-US', { month: 'short' }),
      createdAt: formatDate(issueDate),
    }

    invoices.push(invoiceRecord)

    const paymentAmount = status === 'paid' ? amount : status === 'partial' ? Math.round(amount * 0.58) : 0
    const paymentStatus = status === 'paid' ? 'paid' : status === 'partial' ? 'pending' : status === 'failed' ? 'failed' : status === 'pending' ? 'pending' : 'failed'
    const paymentDate = addDays(issueDate, status === 'overdue' ? 18 : status === 'failed' ? 4 : 9)

    payments.push({
      id: `PAY-${1000 + index}`,
      invoiceId: invoiceId,
      customerId: customer.id,
      customer: customer.name,
      amount: paymentAmount,
      status: paymentStatus,
      processor: index % 3 === 0 ? 'Stripe' : 'Adyen',
      createdAt: formatDate(paymentDate),
      settledAt: paymentStatus === 'paid' ? formatDate(addDays(paymentDate, 2)) : null,
    })
  }

  const lastSixMonths = getLastSixMonths()
  const revenueTrend = lastSixMonths.map(({ month, key }) => {
    const revenue = invoices
      .filter((invoice) => getMonthKey(parseDate(invoice.issueDate)) === key)
      .reduce((sum, invoice) => sum + invoice.amount, 0)

    return { month, revenue }
  })

  return {
    label: 'Local demo dataset for finance dashboard UI only',
    customers,
    plans,
    subscriptions,
    invoices,
    payments,
    revenueTrend,
  }
}

let cachedDemoDataset = null

export function getDemoFinanceDataset() {
  if (!cachedDemoDataset) {
    cachedDemoDataset = buildDemoDataset()
  }

  return cachedDemoDataset
}

export function getDemoCustomerDataset(customerId) {
  const dataset = getDemoFinanceDataset()
  const customer = dataset.customers.find((entry) => entry.id === customerId) || dataset.customers[0]

  return {
    customer,
    subscriptions: dataset.subscriptions.filter((item) => item.customerId === customer.id),
    invoices: dataset.invoices.filter((invoice) => invoice.customerId === customer.id),
    payments: dataset.payments.filter((payment) => payment.customerId === customer.id),
  }
}

export function getFinanceSummary(data = getDemoFinanceDataset()) {
  const totalMrrEstimate = data.subscriptions.reduce((sum, item) => sum + (item.amount || 0), 0)
  const outstandingBalance = data.invoices.reduce((sum, invoice) => sum + (invoice.outstanding || 0), 0)
  const totalInvoiced = data.invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const totalCollected = data.payments
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0)

  const collectionRate = totalInvoiced > 0
    ? Math.round((totalCollected / totalInvoiced) * 1000) / 10
    : 0

  const overdueInvoices = data.invoices.filter((invoice) => invoice.status === 'overdue')
  const overdueCount = overdueInvoices.length
  const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + (invoice.outstanding || 0), 0)

  const statusBreakdown = [
    { name: 'Paid', value: data.invoices.filter((invoice) => invoice.status === 'paid').length },
    { name: 'Pending', value: data.invoices.filter((invoice) => invoice.status === 'pending').length },
    { name: 'Partial', value: data.invoices.filter((invoice) => invoice.status === 'partial').length },
    { name: 'Overdue', value: data.invoices.filter((invoice) => invoice.status === 'overdue').length },
    { name: 'Failed', value: data.invoices.filter((invoice) => invoice.status === 'failed').length },
  ]

  const recentInvoices = [...data.invoices]
    .sort((a, b) => parseDate(b.issueDate) - parseDate(a.issueDate))
    .slice(0, 5)

  return {
    mrrEstimate: totalMrrEstimate,
    outstandingBalance,
    collectionRate,
    overdueCount,
    overdueAmount,
    recentInvoices,
    statusBreakdown,
    revenueTrend: data.revenueTrend,
  }
}

export const demoFinanceData = getDemoFinanceDataset()
