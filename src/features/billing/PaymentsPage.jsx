import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { getDemoFinanceDataset } from '../finance/demoFinanceData'

const formatCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const pageSize = 12

export default function PaymentsPage() {
  const { isDemoMode } = useAuth()
  const dataset = isDemoMode ? getDemoFinanceDataset() : getDemoFinanceDataset()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredPayments = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase()
    return [...dataset.payments]
      .filter((payment) => {
        const matchesQuery = !lowerQuery || payment.id.toLowerCase().includes(lowerQuery) || payment.customer.toLowerCase().includes(lowerQuery)
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
        return matchesQuery && matchesStatus
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [dataset.payments, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedPayments = filteredPayments.slice((safePage - 1) * pageSize, safePage * pageSize)

  const handlePageChange = (nextPage) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Monitor seeded transaction outcomes and demo settlement status without touching live payment systems."
      />

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Successful', value: dataset.payments.filter((payment) => payment.status === 'paid').length, note: 'Paid' },
          { label: 'Pending', value: dataset.payments.filter((payment) => payment.status === 'pending').length, note: 'Awaiting' },
          { label: 'Failed', value: dataset.payments.filter((payment) => payment.status === 'failed').length, note: 'Errored' },
          { label: 'Total', value: dataset.payments.length, note: 'Records' },
        ].map((card) => (
          <div key={card.label} className="rounded-[24px] border border-violet-100 bg-white/85 p-4 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <span className="text-2xl font-semibold text-slate-900">{card.value}</span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{card.note}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-[30px] border border-violet-100 bg-white/85 p-5 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => { setQuery(event.target.value); setCurrentPage(1) }}
              placeholder="Search payment or customer"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1) }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
          >
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Processor</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {paginatedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-violet-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{payment.id}</td>
                  <td className="px-4 py-3">{payment.customer}</td>
                  <td className="px-4 py-3">{payment.processor}</td>
                  <td className="px-4 py-3">{payment.createdAt}</td>
                  <td className="px-4 py-3">{formatCurrency.format(payment.amount || 0)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusTone(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handlePageChange(safePage - 1)}
            disabled={safePage === 1}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-violet-200 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <span className="text-sm text-slate-600">Page {safePage} of {totalPages}</span>
          <button
            type="button"
            onClick={() => handlePageChange(safePage + 1)}
            disabled={safePage === totalPages}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-violet-200 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  )
}

function statusTone(status) {
  const tones = {
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    failed: 'bg-rose-100 text-rose-700',
  }

  return tones[status] || 'bg-slate-100 text-slate-700'
}
