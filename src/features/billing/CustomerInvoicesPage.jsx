import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '../../components/PageHeader'
import { DEMO_CUSTOMER_ID, listInvoices } from '../../lib/billing'
import { supabase } from '../../lib/supabase'
import { BillingMessage } from './BillingMessage'
import { formatMoney } from './billingFormat'
import { useBillingData } from './useBillingData'

export default function CustomerInvoicesPage() {
  const [customerId, setCustomerId] = useState(null)
  useEffect(() => {
    if (supabase) supabase.auth.getUser().then(({ data }) => setCustomerId(data.user?.id || null))
  }, [])
  const loadInvoices = useCallback(
    () => listInvoices({ customerId: customerId || DEMO_CUSTOMER_ID }),
    [customerId],
  )
  const invoices = useBillingData(loadInvoices)
  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" subtitle="Review your generated invoices and payment status." />
      <BillingMessage {...invoices} />
      <section className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="font-semibold">Billing history</h2></div><div className="divide-y divide-slate-100">{invoices.data.map((invoice) => <div key={invoice.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{invoice.invoice_number}</p><p className="mt-1 text-sm text-slate-500">Issued {new Date(invoice.issued_at).toLocaleDateString()} · Due {new Date(invoice.due_at).toLocaleDateString()}</p></div><div className="flex items-center gap-4"><p className="font-semibold">{formatMoney(invoice.total, invoice.currency)}</p><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{invoice.status}</span></div></div>)}</div>{!invoices.loading && !invoices.data.length && <p className="p-8 text-center text-sm text-slate-500">No invoices yet.</p>}</section>
    </div>
  )
}
