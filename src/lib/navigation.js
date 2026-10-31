import {
  Banknote,
  Boxes,
  BriefcaseBusiness,
  CreditCard,
  FileText,
  Gift,
  LayoutDashboard,
  ReceiptText,
  TicketPercent,
  WalletCards,
} from 'lucide-react'

export const adminNavItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', to: '/admin/products', icon: Boxes },
  { label: 'Plans', to: '/admin/plans', icon: BriefcaseBusiness },
  { label: 'Taxes', to: '/admin/taxes', icon: ReceiptText },
  { label: 'Discounts', to: '/admin/discounts', icon: TicketPercent },
  { label: 'Subscriptions', to: '/admin/subscriptions', icon: CreditCard },
  { label: 'Invoices', to: '/admin/invoices', icon: FileText },
  { label: 'Payments', to: '/admin/payments', icon: WalletCards },
]

export const customerNavItems = [
  { label: 'Subscriptions', to: '/customer/subscriptions', icon: CreditCard },
  { label: 'Invoices', to: '/customer/invoices', icon: FileText },
]

export const platformHighlights = [
  {
    label: 'MRR',
    value: '$184.2K',
    delta: '+12.4%',
    accent: 'bg-violet-100 text-violet-700',
    icon: Banknote,
  },
  {
    label: 'Active plans',
    value: '1,286',
    delta: '+8.1%',
    accent: 'bg-indigo-100 text-indigo-700',
    icon: BriefcaseBusiness,
  },
  {
    label: 'Net retention',
    value: '118.7%',
    delta: '+3.8%',
    accent: 'bg-[#fff1ee] text-[#d1654f]',
    icon: Gift,
  },
]
