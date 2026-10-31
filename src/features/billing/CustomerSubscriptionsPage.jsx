import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '../../components/PageHeader'
import { listSubscriptions } from '../../lib/billing'
import { DEMO_CUSTOMER_ID } from '../../lib/billing'
import { supabase } from '../../lib/supabase'
import { BillingMessage } from './BillingMessage'
import { formatMoney } from './billingFormat'
import { useBillingData } from './useBillingData'

export default function CustomerSubscriptionsPage() {
  const [customerId, setCustomerId] = useState(null)
  useEffect(() => {
    if (supabase) supabase.auth.getUser().then(({ data }) => setCustomerId(data.user?.id || null))
  }, [])
  const loadSubscriptions = useCallback(
    () => listSubscriptions({ customerId: customerId || DEMO_CUSTOMER_ID }),
    [customerId],
  )
  const subscriptions = useBillingData(loadSubscriptions)
  return (
    <div className="space-y-6">
      <PageHeader title="My subscriptions" subtitle="Track your plans, billing cadence, and upcoming renewals." />
      <BillingMessage {...subscriptions} />
      <div className="grid gap-4 md:grid-cols-2">{subscriptions.data.map((item) => <article key={item.id} className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-violet-500">{item.status}</p><h2 className="mt-2 text-xl font-semibold">{item.plan?.name || 'Subscription'}</h2></div><p className="font-semibold">{formatMoney(Number(item.plan?.amount || 0) * item.quantity, item.plan?.currency)}</p></div><div className="mt-6 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-slate-50 p-3"><p className="text-slate-500">Quantity</p><p className="mt-1 font-semibold">{item.quantity}</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-slate-500">Renews</p><p className="mt-1 font-semibold">{new Date(item.current_period_end).toLocaleDateString()}</p></div></div></article>)}</div>
      {!subscriptions.loading && !subscriptions.data.length && <p className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">You do not have any active subscriptions.</p>}
    </div>
  )
}
