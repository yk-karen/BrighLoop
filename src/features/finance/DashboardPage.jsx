import { AlertTriangle, ArrowUpRight, BadgeDollarSign, CalendarClock, CheckCircle2, TrendingUp } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { getFinanceSummary } from './demoFinanceData'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const formatMoney = (value) => currencyFormatter.format(value)

const statusTone = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  partial: 'bg-violet-100 text-violet-700',
  overdue: 'bg-rose-100 text-rose-700',
}

export default function DashboardPage() {
  const summary = getFinanceSummary()
  const maxRevenue = Math.max(...summary.revenueTrend.map((item) => item.revenue))

  const kpis = [
    {
      label: 'MRR estimate',
      value: formatMoney(summary.mrrEstimate),
      delta: '+12.4% vs last month',
      accent: 'bg-violet-100 text-violet-700',
      icon: BadgeDollarSign,
    },
    {
      label: 'Outstanding',
      value: formatMoney(summary.outstandingBalance),
      delta: `${summary.overdueCount} overdue invoices`,
      accent: 'bg-amber-100 text-amber-700',
      icon: CalendarClock,
    },
    {
      label: 'Collection rate',
      value: `${summary.collectionRate}%`,
      delta: '+3.2 pts this cycle',
      accent: 'bg-emerald-100 text-emerald-700',
      icon: CheckCircle2,
    },
    {
      label: 'Risk watch',
      value: `${summary.overdueCount}`,
      delta: formatMoney(summary.overdueAmount),
      accent: 'bg-rose-100 text-rose-700',
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance dashboard"
        subtitle="Revenue, collections, and account health across the current subscription base."
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700"
          >
            Export report
            <ArrowUpRight className="h-4 w-4" />
          </button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, delta, accent, icon: Icon }) => (
          <article key={label} className="rounded-[28px] border border-violet-100 bg-white/85 p-5 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <span className={`inline-flex rounded-full p-2 ${accent}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-6 flex items-end justify-between gap-3">
              <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                {delta}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <article className="rounded-[30px] border border-violet-100 bg-white/85 p-6 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Revenue trend</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Net recurring revenue</h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              +18.4% YoY
            </span>
          </div>

          <div className="mt-8 grid grid-cols-6 items-end gap-3">
            {summary.revenueTrend.map(({ month, revenue }) => (
              <div key={month} className="flex flex-col items-center gap-3">
                <div className="flex h-40 w-full items-end justify-center rounded-t-2xl bg-gradient-to-t from-violet-600 via-violet-500 to-indigo-400 p-1.5">
                  <div
                    className="w-full rounded-t-xl bg-white/25"
                    style={{ height: `${Math.max(18, (revenue / maxRevenue) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{month}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[30px] border border-violet-100 bg-white/85 p-6 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Invoice mix</p>
          <div className="mt-5 space-y-4">
            {summary.statusBreakdown.map(({ name, value }) => {
              const maxValue = Math.max(...summary.statusBreakdown.map((item) => item.value), 1)
              const width = (value / maxValue) * 100

              return (
                <div key={name}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                    <span>{name}</span>
                    <span className="font-semibold text-slate-800">{value}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div
                      className={`h-2.5 rounded-full ${
                        name === 'Paid'
                          ? 'bg-emerald-500'
                          : name === 'Pending'
                            ? 'bg-amber-500'
                            : name === 'Partial'
                              ? 'bg-violet-500'
                              : 'bg-rose-500'
                      }`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-violet-100 bg-violet-50 p-4">
            <p className="text-sm font-semibold text-violet-700">Current collection health</p>
            <p className="mt-2 text-sm text-violet-700/80">
              {summary.collectionRate}% of the invoiced amount has been collected, with {summary.overdueCount} invoices flagged for follow-up.
            </p>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <article className="rounded-[30px] border border-violet-100 bg-white/85 p-6 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recent invoices</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Latest billing activity</h2>
            </div>
            <button type="button" className="text-sm font-medium text-violet-600">View all</button>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
                {summary.recentInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{invoice.id}</td>
                    <td className="px-4 py-3">{invoice.customer}</td>
                    <td className="px-4 py-3">{invoice.dueDate}</td>
                    <td className="px-4 py-3">{formatMoney(invoice.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${statusTone[invoice.status]}`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-[30px] border border-violet-100 bg-white/85 p-6 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Overdue</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Attention list</h2>
            </div>
            <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-700">
              {summary.overdueCount} open
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {summary.recentInvoices
              .filter((invoice) => invoice.status === 'overdue' || invoice.status === 'partial')
              .map((invoice) => (
                <div key={invoice.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{invoice.customer}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{invoice.id}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${statusTone[invoice.status]}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                    <span>Outstanding</span>
                    <span className="font-semibold text-slate-800">{formatMoney(invoice.outstanding)}</span>
                  </div>
                </div>
              ))}
          </div>
        </article>
      </section>
    </div>
  )
}
