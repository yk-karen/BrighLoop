import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../features/access/LoginPage'
import SignupPage from '../features/access/SignupPage'
import DashboardPage from '../features/finance/DashboardPage'
import CustomerInvoicesPage from '../features/billing/CustomerInvoicesPage'
import CustomerSubscriptionsPage from '../features/billing/CustomerSubscriptionsPage'
import InvoicesPage from '../features/billing/InvoicesPage'
import PaymentsPage from '../features/billing/PaymentsPage'
import SubscriptionsPage from '../features/billing/SubscriptionsPage'
import ProductsPage from '../features/setup/ProductsPage'
import PlansPage from '../features/setup/PlansPage'
import TaxesPage from '../features/setup/TaxesPage'
import DiscountsPage from '../features/setup/DiscountsPage'
import { AdminLayout } from '../layouts/AdminLayout'
import { CustomerLayout } from '../layouts/CustomerLayout'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/customer" element={<CustomerLayout />}>
        <Route path="subscriptions" element={<CustomerSubscriptionsPage />} />
        <Route path="invoices" element={<CustomerInvoicesPage />} />
        <Route index element={<Navigate to="/customer/subscriptions" replace />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="taxes" element={<TaxesPage />} />
        <Route path="discounts" element={<DiscountsPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
