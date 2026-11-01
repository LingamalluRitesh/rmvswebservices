import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';

// Critical First-Paint Page (Synchronous for instant render)
import { HomePage } from './pages/public/HomePage';

// Lazy-Loaded Public Pages (Code-split for maximum load speed)
const AboutPage = lazy(() => import('./pages/public/AboutPage').then(m => ({ default: m.AboutPage })));
const TeamPage = lazy(() => import('./pages/public/TeamPage').then(m => ({ default: m.TeamPage })));
const ServicesPage = lazy(() => import('./pages/public/ServicesPage').then(m => ({ default: m.ServicesPage })));
const DevelopersDirectory = lazy(() => import('./pages/public/DevelopersDirectory').then(m => ({ default: m.DevelopersDirectory })));
const DeveloperProfilePage = lazy(() => import('./pages/public/DeveloperProfilePage').then(m => ({ default: m.DeveloperProfilePage })));
const ProjectsDirectory = lazy(() => import('./pages/public/ProjectsDirectory').then(m => ({ default: m.ProjectsDirectory })));
const ProjectDetailPage = lazy(() => import('./pages/public/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const ContactPage = lazy(() => import('./pages/public/ContactPage').then(m => ({ default: m.ContactPage })));
const OrderTrackingPage = lazy(() => import('./pages/public/OrderTrackingPage').then(m => ({ default: m.OrderTrackingPage })));

// Lazy-Loaded Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));

// Lazy-Loaded Heavy Dashboard & Workspace Pages
const DeveloperDashboard = lazy(() => import('./pages/dashboard/DeveloperDashboard').then(m => ({ default: m.DeveloperDashboard })));
const MyProjectsPage = lazy(() => import('./pages/dashboard/MyProjectsPage').then(m => ({ default: m.MyProjectsPage })));
const InquiriesPage = lazy(() => import('./pages/dashboard/InquiriesPage').then(m => ({ default: m.InquiriesPage })));
const CommunityChatPage = lazy(() => import('./pages/dashboard/CommunityChatPage').then(m => ({ default: m.CommunityChatPage })));
const DirectMessagesPage = lazy(() => import('./pages/dashboard/DirectMessagesPage').then(m => ({ default: m.DirectMessagesPage })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
    <div className="w-7 h-7 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin mb-3" />
    <span className="text-slate-400 font-mono text-xs uppercase tracking-widest">Loading...</span>
  </div>
);

const AppShell: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 selection:bg-black/10 selection:text-black">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/developers" element={<DevelopersDirectory />} />
            <Route path="/developers/:username" element={<DeveloperProfilePage />} />
            <Route path="/projects" element={<ProjectsDirectory />} />
            <Route path="/projects/:slug" element={<ProjectDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Delivery & Order Tracking Routes */}
            <Route path="/track" element={<OrderTrackingPage />} />
            <Route path="/track/:trackingNumber" element={<OrderTrackingPage />} />
            <Route path="/orders/track/:trackingNumber" element={<OrderTrackingPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Workspace & Portal Routes */}
            <Route path="/dashboard" element={<DeveloperDashboard />} />
            <Route path="/developer/dashboard" element={<DeveloperDashboard />} />
            <Route path="/client/dashboard" element={<DeveloperDashboard />} />
            <Route path="/dashboard/my-projects" element={<MyProjectsPage />} />
            <Route path="/dashboard/projects" element={<MyProjectsPage />} />
            <Route path="/dashboard/inquiries" element={<InquiriesPage />} />
            <Route path="/community" element={<CommunityChatPage />} />
            <Route path="/messages" element={<DirectMessagesPage />} />

            {/* CEO Command Suite */}
            <Route path="/ceo" element={<AdminDashboard />} />
            <Route path="/admin" element={<Navigate to="/ceo" replace />} />

            {/* Fallback */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <WebSocketProvider>
            <AppShell />
          </WebSocketProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
