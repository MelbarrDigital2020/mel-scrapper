import { Routes, Route, Navigate } from "react-router-dom";
// import AppLayout from "../layout/AppLayout";
import AuthLayout from "../layout/AuthLayout";

// import Dashboard from "../pages/dashboard/DashboardPage";
// import Contacts from "../pages/contacts/ContactsPage";
// import Companies from "../pages/companies/CompaniesPage";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

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
      {/* <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/companies" element={<Companies />} />
      </Route> */}
    </Routes>
  );
}
