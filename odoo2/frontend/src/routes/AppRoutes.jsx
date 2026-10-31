import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Layout
import { AppLayout } from '../components/layout/AppLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

// Admin & Staff Workspace
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { CustomerListPage } from '../pages/customers/CustomerListPage';
import { ProductListPage } from '../pages/products/ProductListPage';
import { PlanListPage } from '../pages/plans/PlanListPage';
import { QuotationListPage } from '../pages/quotations/QuotationListPage';
import { SubscriptionListPage } from '../pages/subscriptions/SubscriptionListPage';
import { InvoiceListPage } from '../pages/invoices/InvoiceListPage';
import { PaymentListPage } from '../pages/payments/PaymentListPage';
import { DiscountListPage } from '../pages/discounts/DiscountListPage';
import { TaxListPage } from '../pages/settings/TaxListPage';
import { StaffListPage } from '../pages/staff/StaffListPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';

// Customer Portal
import { CustomerOverviewPage } from '../pages/portal/CustomerOverviewPage';
import { CustomerSubscriptionsPage } from '../pages/portal/CustomerSubscriptionsPage';
import { CustomerInvoicesPage } from '../pages/portal/CustomerInvoicesPage';
import { CustomerPaymentsPage } from '../pages/portal/CustomerPaymentsPage';
import { CustomerProfilePage } from '../pages/portal/CustomerProfilePage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated, roles } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Checking authentication session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const hasRole = allowedRoles.some(
      (r) => roles.includes(r) || roles.includes(`ROLE_${r}`)
    );
    if (!hasRole) {
      // If Customer tries to access staff/admin page, redirect to customer portal
      if (roles.includes('ROLE_CUSTOMER') || roles.includes('CUSTOMER')) {
        return <Navigate to="/portal/overview" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Default Landing Redirection Guard
const RootRedirect = () => {
  const { isAuthenticated, isCustomer, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isCustomer) {
    return <Navigate to="/portal/overview" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Authenticated Workspace */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Admin & Staff Common Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <CustomerListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotations"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <QuotationListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <SubscriptionListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <InvoiceListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <PaymentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <ProductListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plans"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <PlanListPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Only Routes */}
        <Route
          path="/discounts"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DiscountListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/taxes"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <TaxListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <StaffListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Customer Portal Routes */}
        <Route
          path="/portal/overview"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/subscriptions"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerSubscriptionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/invoices"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerInvoicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/payments"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerPaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/profile"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
