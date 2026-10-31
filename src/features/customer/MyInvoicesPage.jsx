import { useEffect, useState } from 'react'
import { FileText, ReceiptText } from 'lucide-react'
import { DataState } from '../../components/DataState'
import { PageHeader } from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function MyInvoicesPage() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false)
      return
    }

    let isMounted = true

    async function loadInvoices() {
      setLoading(true)
      setError('')

      const { data, error: queryError } = await supabase
        .from('invoices')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })

      if (!isMounted) {
        return
      }

      if (queryError) {
        setError(queryError.message)
        setItems([])
      } else {
        setItems(data || [])
      }

      setLoading(false)
    }

    loadInvoices()

    return () => {
      isMounted = false
    }
  }, [profile?.id])

  return (
    <div className="space-y-6">
      <PageHeader
        title="My invoices"
        subtitle="Your payment history, balances, and downloadable document records."
      />

      <DataState
        loading={loading}
        error={error}
        empty={items.length === 0 && !loading && !error}
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
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.invoice_number || 'INV-0001'}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{item.status || 'Paid'}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-600">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Issue date</p>
                  <p className="mt-1 font-medium text-slate-900">{item.issue_date || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Amount</p>
                  <p className="mt-1 font-medium text-slate-900">{item.amount ? `$${item.amount}` : '$149.00'}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-violet-700">
                  <ReceiptText className="h-4 w-4" />
                  Download
                </div>
              </div>
            </article>
          ))}
        </div>
      </DataState>

      {items.length === 0 && !loading && !error ? (
        <div className="rounded-[28px] border border-violet-100 bg-white/85 p-6 text-center shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
          <ReceiptText className="mx-auto h-9 w-9 text-violet-500" />
          <p className="mt-4 text-sm text-slate-600">Invoices will appear here once billing activity is recorded.</p>
        </div>
      ) : null}
    </div>
  )
}
