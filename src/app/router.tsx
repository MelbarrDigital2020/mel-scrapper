import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layout/AuthLayout";
import AppLayout from "../layout/AppLayout";

import ProtectedRoute from "./ProtectedRoute";

import Dashboard from "../pages/dashboard/DashboardHome";
import Contacts from "../pages/contacts/ContactsPage";
import Companies from "../pages/companies/CompaniesPage";
import Exporthistory from "../pages/export-history/ExportHistoryPage";
import Debounce from "../pages/debounce/DebouncePage";
import IntentBasePage from "../pages/intent-base/IntentBasePage";
import ListHistoryPage from "../pages/list-history/ListHistoryPage";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

import SettingsPage from "../pages/settings/SettingsPage";
import ProfileSettings from "../pages/settings/components/ProfileSettings";
import SecuritySettings from "../pages/settings/components/SecuritySettings";
import NotificationSettings from "../pages/settings/components/NotificationSettings";
import SyncSettings from "../pages/settings/components/SyncSettings";

export default function AppRouter() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* App routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            {" "}
            <AppLayout />{" "}
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="companies" element={<Companies />} />
        <Route path="export-history" element={<Exporthistory />} />
        <Route path="debounce" element={<Debounce />} />
        <Route path="intentbase" element={<IntentBasePage />} />
        <Route path="list-history" element={<ListHistoryPage />} />

        {/* ✅ Settings routes */}
        <Route path="settings" element={<SettingsPage />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="notifications" element={<NotificationSettings />} />
          <Route path="sync" element={<SyncSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}
