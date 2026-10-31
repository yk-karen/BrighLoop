import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { getDemoFinanceDataset, getFinanceSummary } from '../finance/demoFinanceData'

const formatCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const pageSize = 12

export default function InvoicesPage() {
  const { isDemoMode } = useAuth()
  const dataset = isDemoMode ? getDemoFinanceDataset() : getDemoFinanceDataset()
  const summary = useMemo(() => getFinanceSummary(dataset), [dataset])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(dataset.invoices[0]?.id ?? '')

  const filteredInvoices = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase()
    return [...dataset.invoices]
      .filter((invoice) => {
        const matchesQuery = !lowerQuery || invoice.id.toLowerCase().includes(lowerQuery) || invoice.customer.toLowerCase().includes(lowerQuery)
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
        return matchesQuery && matchesStatus
      })
      .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
  }, [dataset.invoices, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedInvoices = filteredInvoices.slice((safePage - 1) * pageSize, safePage * pageSize)
  const selectedInvoice = filteredInvoices.find((invoice) => invoice.id === selectedInvoiceId) || paginatedInvoices[0] || null

  const handlePageChange = (nextPage) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle="Review the seeded invoice ledger and monitor payment health across the demo dataset."
      />

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Issued', value: dataset.invoices.length, note: 'Total' },
          { label: 'Paid', value: dataset.invoices.filter((invoice) => invoice.status === 'paid').length, note: 'Captured' },
          { label: 'Pending', value: dataset.invoices.filter((invoice) => invoice.status === 'pending').length, note: 'Waiting' },
          { label: 'Overdue', value: summary.overdueCount, note: 'Needs attention' },
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

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-[30px] border border-violet-100 bg-white/85 p-5 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => { setQuery(event.target.value); setCurrentPage(1) }}
                placeholder="Search customer or invoice"
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
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {paginatedInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className={`cursor-pointer transition hover:bg-violet-50 ${selectedInvoice?.id === invoice.id ? 'bg-violet-50' : ''}`}
                    onClick={() => setSelectedInvoiceId(invoice.id)}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">{invoice.id}</td>
                    <td className="px-4 py-3">{invoice.customer}</td>
                    <td className="px-4 py-3">{invoice.dueDate}</td>
                    <td className="px-4 py-3">{formatCurrency.format(invoice.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusTone(invoice.status)}`}>
                        {invoice.status}
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
        </div>

        <aside className="rounded-[30px] border border-violet-100 bg-white/85 p-5 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
          {selectedInvoice ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Invoice detail</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{selectedInvoice.id}</h2>
                </div>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusTone(selectedInvoice.status)}`}>
                  {selectedInvoice.status}
                </span>
              </div>

              <dl className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3"><dt>Customer</dt><dd className="font-semibold text-slate-900">{selectedInvoice.customer}</dd></div>
                <div className="flex items-center justify-between gap-3"><dt>Issue date</dt><dd className="font-semibold text-slate-900">{selectedInvoice.issueDate}</dd></div>
                <div className="flex items-center justify-between gap-3"><dt>Due date</dt><dd className="font-semibold text-slate-900">{selectedInvoice.dueDate}</dd></div>
                <div className="flex items-center justify-between gap-3"><dt>Amount</dt><dd className="font-semibold text-slate-900">{formatCurrency.format(selectedInvoice.amount)}</dd></div>
                <div className="flex items-center justify-between gap-3"><dt>Outstanding</dt><dd className="font-semibold text-slate-900">{formatCurrency.format(selectedInvoice.outstanding || 0)}</dd></div>
              </dl>
            </>
          ) : (
            <div className="text-sm text-slate-600">No invoice selected.</div>
          )}
        </aside>
      </section>
    </div>
  )
}

function statusTone(status) {
  const tones = {
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    partial: 'bg-violet-100 text-violet-700',
    overdue: 'bg-rose-100 text-rose-700',
    failed: 'bg-slate-200 text-slate-700',
  }

  return tones[status] || 'bg-slate-100 text-slate-700'
}
