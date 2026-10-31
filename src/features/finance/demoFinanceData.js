export const demoFinanceData = {
  label: 'Local demo dataset for finance dashboard UI only',
  recurringCustomers: [
    { customer: 'Northstar Labs', plan: 'Growth', monthlyValue: 2400 },
    { customer: 'Summit Works', plan: 'Scale', monthlyValue: 1800 },
    { customer: 'Harbor AI', plan: 'Enterprise', monthlyValue: 3200 },
    { customer: 'Aster Studio', plan: 'Starter', monthlyValue: 1400 },
  ],
  invoices: [
    {
      id: 'INV-1042',
      customer: 'Northstar Labs',
      status: 'paid',
      amount: 4200,
      outstanding: 0,
      issueDate: '2026-09-01',
      dueDate: '2026-09-15',
      month: 'Sep',
    },
    {
      id: 'INV-1043',
      customer: 'Summit Works',
      status: 'paid',
      amount: 2800,
      outstanding: 0,
      issueDate: '2026-09-08',
      dueDate: '2026-09-22',
      month: 'Sep',
    },
    {
      id: 'INV-1044',
      customer: 'Harbor AI',
      status: 'pending',
      amount: 1900,
      outstanding: 1900,
      issueDate: '2026-09-12',
      dueDate: '2026-09-28',
      month: 'Sep',
    },
    {
      id: 'INV-1045',
      customer: 'Aster Studio',
      status: 'overdue',
      amount: 2350,
      outstanding: 2350,
      issueDate: '2026-08-27',
      dueDate: '2026-09-10',
      month: 'Aug',
    },
    {
      id: 'INV-1046',
      customer: 'Northstar Labs',
      status: 'paid',
      amount: 6100,
      outstanding: 0,
      issueDate: '2026-08-18',
      dueDate: '2026-09-02',
      month: 'Aug',
    },
    {
      id: 'INV-1047',
      customer: 'Harbor AI',
      status: 'overdue',
      amount: 1780,
      outstanding: 1780,
      issueDate: '2026-08-12',
      dueDate: '2026-08-28',
      month: 'Aug',
    },
    {
      id: 'INV-1048',
      customer: 'Summit Works',
      status: 'partial',
      amount: 2600,
      outstanding: 1200,
      issueDate: '2026-07-18',
      dueDate: '2026-08-02',
      month: 'Jul',
    },
    {
      id: 'INV-1049',
      customer: 'Aster Studio',
      status: 'paid',
      amount: 3300,
      outstanding: 0,
      issueDate: '2026-07-09',
      dueDate: '2026-07-22',
      month: 'Jul',
    },
    {
      id: 'INV-1050',
      customer: 'Northstar Labs',
      status: 'pending',
      amount: 1450,
      outstanding: 1450,
      issueDate: '2026-06-28',
      dueDate: '2026-07-12',
      month: 'Jun',
    },
  ],
  revenueTrend: [
    { month: 'Jun', revenue: 12800 },
    { month: 'Jul', revenue: 14200 },
    { month: 'Aug', revenue: 15600 },
    { month: 'Sep', revenue: 16850 },
    { month: 'Oct', revenue: 17320 },
    { month: 'Nov', revenue: 18240 },
  ],
}

export function getFinanceSummary(data = demoFinanceData) {
  const totalMrrEstimate = data.recurringCustomers.reduce(
    (sum, customer) => sum + customer.monthlyValue,
    0,
  )

  const outstandingBalance = data.invoices.reduce(
    (sum, invoice) => sum + invoice.outstanding,
    0,
  )

  const totalInvoiced = data.invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const totalCollected = data.invoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  const collectionRate = totalInvoiced > 0
    ? Math.round((totalCollected / totalInvoiced) * 1000) / 10
    : 0

  const overdueInvoices = data.invoices.filter((invoice) => invoice.status === 'overdue')
  const overdueCount = overdueInvoices.length
  const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + invoice.outstanding, 0)

  const statusBreakdown = [
    { name: 'Paid', value: data.invoices.filter((invoice) => invoice.status === 'paid').length },
    { name: 'Pending', value: data.invoices.filter((invoice) => invoice.status === 'pending').length },
    { name: 'Partial', value: data.invoices.filter((invoice) => invoice.status === 'partial').length },
    { name: 'Overdue', value: defaultValueForStatus(data.invoices, 'overdue') },
  ]

  const recentInvoices = [...data.invoices]
    .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
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

function defaultValueForStatus(invoices, status) {
  return invoices.filter((invoice) => invoice.status === status).length
}
