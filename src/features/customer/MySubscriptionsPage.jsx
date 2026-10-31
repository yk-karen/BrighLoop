import { useEffect, useState } from 'react'
import { CreditCard, PackageSearch } from 'lucide-react'
import { DataState } from '../../components/DataState'
import { PageHeader } from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function MySubscriptionsPage() {
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

    async function loadSubscriptions() {
      setLoading(true)
      setError('')

      const { data, error: queryError } = await supabase
        .from('subscriptions')
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

    loadSubscriptions()

    return () => {
      isMounted = false
    }
  }, [profile?.id])

  return (
    <div className="space-y-6">
      <PageHeader
        title="My subscriptions"
        subtitle="Your current plan status and active subscription details."
      />

      <DataState
        loading={loading}
        error={error}
        empty={items.length === 0 && !loading && !error}
        emptyMessage="No active subscriptions have been linked to your account yet."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-[28px] border border-violet-100 bg-white/85 p-5 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                  <CreditCard className="h-3.5 w-3.5" />
                  {item.status || 'Active'}
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.billing_cycle || 'Monthly'}</span>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plan</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{item.plan_name || 'Brightloop Pro'}</h2>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-600">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Price</p>
                  <p className="mt-1 font-medium text-slate-900">{item.amount ? `$${item.amount}` : '$149'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Renewal</p>
                  <p className="mt-1 font-medium text-slate-900">{item.renewal_date || '—'}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </DataState>

      {items.length === 0 && !loading && !error ? (
        <div className="rounded-[28px] border border-violet-100 bg-white/85 p-6 text-center shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
          <PackageSearch className="mx-auto h-9 w-9 text-violet-500" />
          <p className="mt-4 text-sm text-slate-600">Customer subscriptions will appear here once they are created.</p>
        </div>
      ) : null}
    </div>
  )
}
