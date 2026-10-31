import { Activity, ArrowUpRight, CircleDollarSign, Users } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { platformHighlights } from '../../lib/navigation'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription overview"
        subtitle="Operational health across revenue, retention, and customer expansions."
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

      <section className="grid gap-4 md:grid-cols-3">
        {platformHighlights.map(({ label, value, delta, accent, icon: Icon }) => (
          <article key={label} className="rounded-[28px] border border-violet-100 bg-white/85 p-5 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <span className={`inline-flex rounded-full p-2 ${accent}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                {delta}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <article className="rounded-[30px] border border-violet-100 bg-white/85 p-6 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Revenue trend
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Net recurring revenue</h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Activity className="h-3.5 w-3.5" />
              16.8% MoM
            </span>
          </div>

          <div className="mt-8 grid grid-cols-6 items-end gap-3">
            {[40, 54, 48, 72, 86, 96].map((height, index) => (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className="w-full rounded-t-2xl bg-gradient-to-t from-violet-600 to-indigo-400" style={{ height: `${height}px` }} />
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[30px] border border-violet-100 bg-white/85 p-6 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Customer health</p>
          <div className="mt-5 space-y-4">
            {[
              { label: 'New trials', value: '164', tone: 'bg-violet-600' },
              { label: 'Expansions', value: '53', tone: 'bg-indigo-500' },
              { label: 'Churn risk', value: '12', tone: 'bg-[#ff7b6b]' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>{stat.label}</span>
                  <span className="font-semibold text-slate-800">{stat.value}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div className={`h-2.5 rounded-full ${stat.tone}`} style={{ width: `${Math.min(100, Number(stat.value) / 2)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-violet-100 bg-violet-50 p-4">
            <div className="flex items-center gap-3 text-violet-700">
              <Users className="h-5 w-5" />
              <span className="text-sm font-semibold">Retention watchlist</span>
            </div>
            <p className="mt-2 text-sm text-violet-700/80">12 accounts need expansion follow-up this week.</p>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[30px] border border-violet-100 bg-white/85 p-6 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Collections</p>
            <CircleDollarSign className="h-5 w-5 text-violet-500" />
          </div>
          <p className="mt-4 text-4xl font-semibold text-slate-900">$81,420</p>
          <p className="mt-2 text-sm text-slate-600">Unpaid invoices have dropped 14% over the last 30 days.</p>
        </article>

        <article className="rounded-[30px] border border-violet-100 bg-white/85 p-6 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Pilot launches</p>
            <ArrowUpRight className="h-5 w-5 text-violet-500" />
          </div>
          <p className="mt-4 text-4xl font-semibold text-slate-900">9</p>
          <p className="mt-2 text-sm text-slate-600">New pricing experiments are active across growth and enterprise segments.</p>
        </article>
      </section>
    </div>
  )
}
