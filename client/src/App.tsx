import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LoginPage } from './customer/pages/LoginPage'
import { MenuPage } from './customer/pages/MenuPage'
import { CartPage } from './customer/pages/CartPage'
import { OrderHistoryPage } from './customer/pages/OrderHistoryPage'
import { OrderSuccessPage } from './customer/pages/OrderSuccessPage'
import { AdminLoginPage } from './admin/pages/LoginPage'
import { DashboardPage } from './admin/pages/DashboardPage'
import { useCustomerAuth } from './customer/stores/auth-store'
import { useAdminAuth } from './admin/stores/auth-store'
import { LoadingSpinner } from './shared/components/LoadingSpinner'

function CustomerGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useCustomerAuth((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAdminAuth((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/admin" replace />
  return <>{children}</>
}

export default function App() {
  const restoreCustomer = useCustomerAuth((s) => s.restore)
  const restoreAdmin = useAdminAuth((s) => s.restore)
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    Promise.all([restoreCustomer(), restoreAdmin()]).finally(() => {
      setIsRestoring(false)
    })
  }, [restoreCustomer, restoreAdmin])

  if (isRestoring) return <LoadingSpinner />

  return (
    <BrowserRouter>
      <Routes>
        {/* Customer */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/menu" element={<CustomerGuard><MenuPage /></CustomerGuard>} />
        <Route path="/cart" element={<CustomerGuard><CartPage /></CustomerGuard>} />
        <Route path="/orders" element={<CustomerGuard><OrderHistoryPage /></CustomerGuard>} />
        <Route path="/order-success" element={<CustomerGuard><OrderSuccessPage /></CustomerGuard>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminGuard><DashboardPage /></AdminGuard>} />
      </Routes>
    </BrowserRouter>
  )
}
