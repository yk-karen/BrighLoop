import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import StaffManagementPage from '../features/admin/StaffManagementPage'
import LoginPage from '../features/access/LoginPage'
import ForgotPasswordPage from '../features/access/ForgotPasswordPage'
import ResetPasswordPage from '../features/access/ResetPasswordPage'
import SignupPage from '../features/access/SignupPage'
import DashboardPage from '../features/finance/DashboardPage'
import MyInvoicesPage from '../features/customer/MyInvoicesPage'
import MySubscriptionsPage from '../features/customer/MySubscriptionsPage'
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
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="subscriptions" element={<MySubscriptionsPage />} />
        <Route path="my-subscriptions" element={<MySubscriptionsPage />} />
        <Route path="invoices" element={<MyInvoicesPage />} />
        <Route path="my-invoices" element={<MyInvoicesPage />} />
        <Route index element={<Navigate to="/customer/subscriptions" replace />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="staff" element={<ProtectedRoute allowedRoles={['admin']}><StaffManagementPage /></ProtectedRoute>} />
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
