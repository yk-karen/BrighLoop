import { NavLink } from 'react-router-dom'

export function SidebarNav({ items, collapsed = false }) {
  return (
    <nav className="space-y-2 px-3 pb-6 pt-5">
      {items.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            [
              'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
              collapsed ? 'justify-center px-2' : 'justify-start',
              isActive
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700',
            ].join(' ')
          }
          title={label}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!collapsed ? <span>{label}</span> : null}
        </NavLink>
      ))}
    </nav>
  )
}
