import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import {
  createQuotationTemplate, createSubscription, listDiscounts, listPlans, listQuotationTemplates,
  listSubscriptions, listTaxRates, updateSubscriptionStatus,
} from '../../lib/billing'
import { BillingMessage } from './BillingMessage'
import { formatMoney } from './billingFormat'
import { useBillingData } from './useBillingData'

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700',
  trialing: 'bg-violet-50 text-violet-700',
  paused: 'bg-amber-50 text-amber-700',
  past_due: 'bg-orange-50 text-orange-700',
  canceled: 'bg-slate-100 text-slate-600',
}

export default function SubscriptionsPage() {
  const subscriptions = useBillingData(listSubscriptions)
  const plans = useBillingData(listPlans)
  const discounts = useBillingData(listDiscounts)
  const taxes = useBillingData(listTaxRates)
  const templates = useBillingData(listQuotationTemplates)
  const [showForm, setShowForm] = useState(false)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({ customerId: '', planId: '', quantity: 1, discountId: '', taxRateId: '', startsAt: '', notes: '' })
  const [template, setTemplate] = useState({ name: '', description: '', planId: '', discountId: '', taxRateId: '', terms: '' })

  async function submitSubscription(event) {
    event.preventDefault()
    setMessage(null)
    try {
      await createSubscription({ ...form, planId: selectedPlanId })
      setMessage('Subscription and its first invoice were created.')
      setShowForm(false)
      subscriptions.reload()
    } catch (error) {
      setMessage(error.message || 'Subscription could not be created.')
    }
  }

  async function submitTemplate(event) {
    event.preventDefault()
    setMessage(null)
    try {
      await createQuotationTemplate(template)
      setMessage('Quotation template saved.')
      setShowTemplateForm(false)
      templates.reload()
    } catch (error) {
      setMessage(error.message || 'Quotation template could not be saved.')
    }
  }

  async function changeStatus(id, status) {
    setMessage(null)
    try {
      await updateSubscriptionStatus(id, status)
      subscriptions.reload()
    } catch (error) {
      setMessage(error.message || 'Subscription status could not be updated.')
    }
  }

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100'
  const defaultPlanId = plans.data[0]?.id || ''
  const selectedPlanId = form.planId || defaultPlanId
  const selectedTemplatePlanId = template.planId || defaultPlanId
  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" subtitle="Create subscriptions, apply pricing rules, and manage the full lifecycle." action={
        <div className="flex gap-2">
          <button onClick={() => setShowTemplateForm(true)} className="rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700">Quotation template</button>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> New subscription</button>
        </div>
      } />
      {message && <p className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800">{message}</p>}
      <BillingMessage {...subscriptions} />

      {showForm && <form onSubmit={submitSubscription} className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Create subscription</h2><button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-500">Cancel</button></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">Customer user ID<input value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className={inputClass} placeholder="Optional in demo mode" /></label>
          <label className="text-sm font-medium">Plan<select required value={selectedPlanId} onChange={(e) => setForm({ ...form, planId: e.target.value })} className={inputClass}>{plans.data.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} · {formatMoney(plan.amount, plan.currency)}/{plan.billing_interval}</option>)}</select></label>
          <label className="text-sm font-medium">Quantity<input min="1" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className={inputClass} /></label>
          <label className="text-sm font-medium">Discount<select value={form.discountId} onChange={(e) => setForm({ ...form, discountId: e.target.value })} className={inputClass}><option value="">No discount</option>{discounts.data.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.type === 'percentage' ? `${item.value}%` : formatMoney(item.value)}</option>)}</select></label>
          <label className="text-sm font-medium">Tax rate<select value={form.taxRateId} onChange={(e) => setForm({ ...form, taxRateId: e.target.value })} className={inputClass}><option value="">No tax</option>{taxes.data.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.percentage}%</option>)}</select></label>
          <label className="text-sm font-medium">Start date<input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className={inputClass} /></label>
        </div>
        <label className="mt-4 block text-sm font-medium">Internal notes<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} rows="2" /></label>
        <button className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Create subscription and invoice</button>
      </form>}

      {showTemplateForm && <form onSubmit={submitTemplate} className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">New quotation template</h2><button type="button" onClick={() => setShowTemplateForm(false)} className="text-sm text-slate-500">Cancel</button></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">Template name<input required value={template.name} onChange={(e) => setTemplate({ ...template, name: e.target.value })} className={inputClass} /></label>
          <label className="text-sm font-medium">Plan<select required value={selectedTemplatePlanId} onChange={(e) => setTemplate({ ...template, planId: e.target.value })} className={inputClass}>{plans.data.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label>
          <label className="text-sm font-medium">Discount<select value={template.discountId} onChange={(e) => setTemplate({ ...template, discountId: e.target.value })} className={inputClass}><option value="">No discount</option>{discounts.data.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}</select></label>
          <label className="text-sm font-medium">Tax rate<select value={template.taxRateId} onChange={(e) => setTemplate({ ...template, taxRateId: e.target.value })} className={inputClass}><option value="">No tax</option>{taxes.data.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        </div>
        <label className="mt-4 block text-sm font-medium">Terms<textarea value={template.terms} onChange={(e) => setTemplate({ ...template, terms: e.target.value })} className={inputClass} rows="2" /></label>
        <button className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Save template</button>
      </form>}

      <section className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5"><h2 className="font-semibold">Subscription lifecycle</h2><button onClick={subscriptions.reload} className="rounded-lg p-2 text-slate-500 hover:bg-slate-50" aria-label="Refresh"><RefreshCw className="h-4 w-4" /></button></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Plan</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Period end</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{subscriptions.data.map((item) => <tr key={item.id}><td className="px-5 py-4 font-medium">{item.plan?.name || 'Unknown plan'}<span className="block text-xs text-slate-500">{item.quantity} seat(s)</span></td><td className="px-5 py-4 font-mono text-xs">{item.customer_id}</td><td className="px-5 py-4 text-slate-600">{new Date(item.current_period_end).toLocaleDateString()}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[item.status] || statusStyles.canceled}`}>{item.status.replace('_', ' ')}</span></td><td className="px-5 py-4">{item.status !== 'canceled' && <select value={item.status} onChange={(e) => changeStatus(item.id, e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">{['active', 'paused', 'past_due', 'canceled'].map((status) => <option key={status}>{status}</option>)}</select>}</td></tr>)}</tbody></table>{!subscriptions.loading && !subscriptions.data.length && <p className="p-8 text-center text-sm text-slate-500">No subscriptions yet.</p>}</div>
      </section>
      {templates.data.length > 0 && <section className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm"><h2 className="font-semibold">Quotation templates</h2><div className="mt-4 grid gap-3 md:grid-cols-3">{templates.data.map((item) => <div key={item.id} className="rounded-2xl bg-slate-50 p-4"><p className="font-medium">{item.name}</p><p className="mt-1 text-sm text-slate-500">{item.plan?.name} · {item.plan?.billing_interval}</p><p className="mt-3 text-xs text-slate-500">{item.terms || 'No custom terms'}</p></div>)}</div></section>}
    </div>
  )
}
