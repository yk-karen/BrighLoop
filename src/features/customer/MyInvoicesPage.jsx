import { FileText, ReceiptText } from 'lucide-react'
import { DataState } from '../../components/DataState'
import { PageHeader } from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { getDemoCustomerDataset, getDemoFinanceDataset } from '../finance/demoFinanceData'

const formatCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export default function MyInvoicesPage() {
  const { profile, isDemoMode } = useAuth()
  const customerId = profile?.demoCustomerId || profile?.customerId || 'cust-northstar'

  const dataset = isDemoMode ? getDemoCustomerDataset(customerId) : getDemoCustomerDataset(customerId)
  const items = dataset.invoices || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="My invoices"
        subtitle="Your customer billing history and current open balances for the selected demo account."
      />

      <DataState
        loading={false}
        error=""
        empty={items.length === 0}
        emptyMessage="No invoices have been generated for your account yet."
      >
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col gap-4 rounded-[28px] border border-violet-100 bg-white/85 p-5 shadow-[0_18px_40px_rgba(91,65,192,0.08)] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.invoiceNumber || item.id}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{item.status}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-600">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Issue date</p>
                  <p className="mt-1 font-medium text-slate-900">{item.issueDate}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Amount</p>
                  <p className="mt-1 font-medium text-slate-900">{formatCurrency.format(item.amount)}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-violet-700">
                  <ReceiptText className="h-4 w-4" />
                  {item.outstanding > 0 ? `${formatCurrency.format(item.outstanding)} open` : 'Paid'}
                </div>
              </div>
            </article>
          ))}
        </div>
      </DataState>
    </div>
  )
}
