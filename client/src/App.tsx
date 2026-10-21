import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthProvider } from './context/AuthContext';

// Pages
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { ServiceDetail } from './pages/ServiceDetail';
import { SearchPage } from './pages/SearchPage';
import { ProviderProfilePage } from './pages/ProviderProfilePage';
import { HowItWorks } from './pages/HowItWorks';
import { BecomeAPro } from './pages/BecomeAPro';
import { HelpSupport } from './pages/HelpSupport';
import { Legal } from './pages/Legal';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/providers/:id" element={<ProviderProfilePage />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/become-a-pro" element={<BecomeAPro />} />
              <Route path="/help" element={<HelpSupport />} />
              <Route path="/privacy" element={<Legal type="privacy" />} />
              <Route path="/terms" element={<Legal type="terms" />} />

              {/* Authenticated Portals */}
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/provider/dashboard" element={<ProviderDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
