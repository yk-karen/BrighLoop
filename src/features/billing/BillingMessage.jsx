export function BillingMessage({ loading, error }) {
  if (loading) return <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Loading billing data...</p>
  if (error) return <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
  return null
}
