export function DataState({ loading, error, empty, emptyMessage, children }) {
  if (loading) {
    return (
      <div className="rounded-[28px] border border-violet-100 bg-white/85 p-8 text-center shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
        <p className="mt-4 text-sm font-medium text-slate-600">Loading your data…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-[0_18px_40px_rgba(190,24,93,0.06)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em]">Error</p>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    )
  }

  if (empty) {
    return (
      <div className="rounded-[28px] border border-dashed border-violet-200 bg-violet-50/60 p-8 text-center">
        <p className="text-lg font-semibold text-slate-900">Nothing here yet</p>
        <p className="mt-2 text-sm text-slate-600">{emptyMessage || 'There are no records to display yet.'}</p>
      </div>
    )
  }

  return children
}
