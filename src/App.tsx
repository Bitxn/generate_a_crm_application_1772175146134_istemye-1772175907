import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import ContactForm from "./pages/ContactForm";
import Companies from "./pages/Companies";
import CompanyForm from "./pages/CompanyForm";
import Deals from "./pages/Deals";
import DealForm from "./pages/DealForm";
import Activities from "./pages/Activities";
import ActivityForm from "./pages/ActivityForm";
import Settings from "./pages/Settings";

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userId = localStorage.getItem('crm_user_id');
  if (!userId) {
    return <Navigate to="/welcome" replace />;
  }
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔒 AUTO-GENERATED ROUTES (DO NOT EDIT ABOVE) */}
        
        {/* Welcome/Onboarding */}
        <Route path="/welcome" element={<Welcome />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        
        {/* Contacts */}
        <Route path="/contacts" element={
          <ProtectedRoute><Contacts /></ProtectedRoute>
        } />
        <Route path="/contacts/new" element={
          <ProtectedRoute><ContactForm /></ProtectedRoute>
        } />
        <Route path="/contacts/:id/edit" element={
          <ProtectedRoute><ContactForm /></ProtectedRoute>
        } />
        
        {/* Companies */}
        <Route path="/companies" element={
          <ProtectedRoute><Companies /></ProtectedRoute>
        } />
        <Route path="/companies/new" element={
          <ProtectedRoute><CompanyForm /></ProtectedRoute>
        } />
        <Route path="/companies/:id/edit" element={
          <ProtectedRoute><CompanyForm /></ProtectedRoute>
        } />
        
        {/* Deals */}
        <Route path="/deals" element={
          <ProtectedRoute><Deals /></ProtectedRoute>
        } />
        <Route path="/deals/new" element={
          <ProtectedRoute><DealForm /></ProtectedRoute>
        } />
        <Route path="/deals/:id/edit" element={
          <ProtectedRoute><DealForm /></ProtectedRoute>
        } />
        
        {/* Activities */}
        <Route path="/activities" element={
          <ProtectedRoute><Activities /></ProtectedRoute>
        } />
        <Route path="/activities/new" element={
          <ProtectedRoute><ActivityForm /></ProtectedRoute>
        } />
        
        {/* Settings */}
        <Route path="/settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />
        
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* __ROUTES__ */}
        {/* 🔒 AUTO-GENERATED ROUTES (DO NOT EDIT BELOW) */}

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}