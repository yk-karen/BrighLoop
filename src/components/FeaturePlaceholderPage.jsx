export function FeaturePlaceholderPage({
  eyebrow = 'Placeholder',
  title,
  description,
  cards = [],
}) {
  return (
    <section className="rounded-[30px] border border-violet-100 bg-white/85 p-6 shadow-[0_16px_40px_rgba(91,65,192,0.10)] backdrop-blur-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
        </div>
        <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
          Ready for implementation
        </span>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>

      {cards.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
            >
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                {card.label}
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-900">{card.value}</p>
              <p className="mt-1 text-sm text-slate-600">{card.note}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
