import { Routes, Route, Outlet, Navigate } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar"
import { AppHeader, AppSidebar } from "./components/app-sidebar"
import LoginPage from "./pages/auth/Login"
import { PublicRoute } from "./components/auth/PublicRoute"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import Invoice from "./pages/invoice/Invoice"
import Customers from "./pages/customer/Customers"
import BankAccounts from "./pages/bank-accounts/BankAccounts"
import Dashboard from "./pages/dashboard/Dashboard"
import Payment from "./pages/payment/Payment"
import Project from "./pages/project/Project"
import { ProjectDetail } from "./pages/project/ProjectDetail"
import SettingsPage from "./pages/settings/Settings"
import WorkersPage from "./pages/workers/Workers"
import SignatureApprovalsPage from "./pages/signature-approvals/SignatureApprovals"
import { useAuthStore } from "./store/use-auth-store"

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <AppHeader />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

function AuthLayout() {
  return <Outlet />
}

export default function AppRoutes() {
  const user = useAuthStore((state) => state.user)
  const isWorker = user?.role === "worker"
  
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to={isWorker ? "/projects" : "/dashboard"} replace />} />
          <Route path="/dashboard" element={isWorker ? <Navigate to="/projects" replace /> : <Dashboard />} />
          <Route path="/customers" element={isWorker ? <Navigate to="/projects" replace /> : <Customers />} />
          <Route path="/bank-accounts" element={isWorker ? <Navigate to="/projects" replace /> : <BankAccounts />} />
          <Route
            path="/invoices"
            element={isWorker ? <Navigate to="/projects" replace /> : <Invoice key={window.location.search} />}
          />
          <Route path="/payments" element={isWorker ? <Navigate to="/projects" replace /> : <Payment />} />

          <Route path="/projects">
            <Route index element={<Project />} />
            <Route path=":id" element={<ProjectDetail />} />
          </Route>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/workers" element={isWorker ? <Navigate to="/projects" replace /> : <WorkersPage />} />
          <Route path="/signature-approvals" element={isWorker ? <Navigate to="/projects" replace /> : <SignatureApprovalsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={isWorker ? "/projects" : "/dashboard"} replace />} />
    </Routes>
  )
}