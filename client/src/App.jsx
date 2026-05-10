import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'

import LandingPage from './pages/LandingPage'
import AuctionsPage from './pages/AuctionsPage'
import AuctionDetailPage from './pages/AuctionDetailPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAuctions from './pages/admin/AdminAuctions'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCreateAuction from './pages/admin/AdminCreateAuction'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-[#0f0a1a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"/></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-[#0f0a1a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"/></div>
  if (!user) return <Navigate to="/login" replace />
  if (!user.isAdmin) return <Navigate to="/auctions" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auctions" element={<AuctionsPage />} />
      <Route path="/auctions/:id" element={<AuctionDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="auctions" element={<AdminAuctions />} />
        <Route path="auctions/new" element={<AdminCreateAuction />} />
        <Route path="auctions/edit/:id" element={<AdminCreateAuction />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </AuthProvider>
  )
}
