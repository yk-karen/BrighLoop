import { CreditCard } from 'lucide-react'
import { DataState } from '../../components/DataState'
import { PageHeader } from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { getDemoCustomerDataset } from '../finance/demoFinanceData'

const formatCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export default function MySubscriptionsPage() {
  const { profile, isDemoMode } = useAuth()
  const customerId = profile?.demoCustomerId || profile?.customerId || 'cust-northstar'
  const dataset = isDemoMode ? getDemoCustomerDataset(customerId) : getDemoCustomerDataset(customerId)
  const items = dataset.subscriptions || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="My subscriptions"
        subtitle="Your current subscription details for the demo customer account."
      />

      <DataState
        loading={false}
        error=""
        empty={items.length === 0}
        emptyMessage="No active subscriptions have been linked to your account yet."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-[28px] border border-violet-100 bg-white/85 p-5 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                  <CreditCard className="h-3.5 w-3.5" />
                  {item.status}
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.billingCycle}</span>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plan</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{item.planName}</h2>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-600">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Price</p>
                  <p className="mt-1 font-medium text-slate-900">{formatCurrency.format(item.amount)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Renewal</p>
                  <p className="mt-1 font-medium text-slate-900">{item.renewalDate}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </DataState>
    </div>
  )
}
