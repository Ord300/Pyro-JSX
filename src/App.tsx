import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';

// Layouts (chargés immédiatement - critiques pour le rendu)
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { UserLayout } from './layouts/UserLayout';

// Public Pages (chargées immédiatement - page d'accueil critique)
import { Home } from './pages/public/Home';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';

// Lazy loading pour les pages non critiques
const Activities = lazy(() => import('./pages/public/Activities').then(m => ({ default: m.Activities })));
const Trainers = lazy(() => import('./pages/public/Trainers').then(m => ({ default: m.Trainers })));
const Places = lazy(() => import('./pages/public/Places').then(m => ({ default: m.Places })));
const Pricing = lazy(() => import('./pages/public/Pricing').then(m => ({ default: m.Pricing })));
const Contact = lazy(() => import('./pages/public/Contact').then(m => ({ default: m.Contact })));
const Equipements = lazy(() => import('./pages/public/NosEquipements.tsx').then(m => ({ default: m.default })));
const Verification = lazy(() => import('./pages/public/Verification').then(m => ({ default: m.Verification })));
const ChangePassword = lazy(() => import('./pages/public/ChangePassword').then(m => ({ default: m.ChangePassword })));

// Admin Pages (lazy)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminRequests = lazy(() => import('./pages/admin/AdminRequests').then(m => ({ default: m.AdminRequests })));
const AdminSubscribers = lazy(() => import('./pages/admin/AdminSubscribers').then(m => ({ default: m.AdminSubscribers })));
const AdminActivities = lazy(() => import('./pages/admin/AdminActivities').then(m => ({ default: m.AdminActivities })));
const AdminTrainers = lazy(() => import('./pages/admin/AdminTrainers').then(m => ({ default: m.AdminTrainers })));
const AdminPlaces = lazy(() => import('./pages/admin/AdminPlaces').then(m => ({ default: m.AdminPlaces })));
const AdminReports = lazy(() => import('./pages/admin/AdminReports').then(m => ({ default: m.AdminReports })));
const AdminSubscriptions = lazy(() => import('./pages/admin/AdminSubscriptions').then(m => ({ default: m.AdminSubscriptions })));
const AdminEquipment = lazy(() => import('./pages/admin/AdminEquipment').then(m => ({ default: m.AdminEquipment })));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments').then(m => ({ default: m.AdminPayments })));
const AdminReceipts = lazy(() => import('./pages/admin/AdminReceipts').then(m => ({ default: m.AdminReceipts })));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications').then(m => ({ default: m.AdminNotifications })));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages').then(m => ({ default: m.AdminMessages })));

// User Pages (lazy)
const UserDashboard = lazy(() => import('./pages/user/UserDashboard').then(m => ({ default: m.UserDashboard })));
const UserSubscription = lazy(() => import('./pages/user/UserSubscription').then(m => ({ default: m.UserSubscription })));
const UserReservations = lazy(() => import('./pages/user/UserReservations').then(m => ({ default: m.UserReservations })));
const UserPayments = lazy(() => import('./pages/user/UserPayments').then(m => ({ default: m.UserPayments })));
const UserReceipts = lazy(() => import('./pages/user/UserReceipts').then(m => ({ default: m.UserReceipts })));
const UserHistory = lazy(() => import('./pages/user/UserHistory').then(m => ({ default: m.UserHistory })));
const UserNotifications = lazy(() => import('./pages/user/UserNotifications').then(m => ({ default: m.UserNotifications })));
const UserProfile = lazy(() => import('./pages/user/UserProfile').then(m => ({ default: m.UserProfile })));

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex h-full min-h-[calc(100vh-8rem)] items-center justify-center p-8" role="status" aria-label="Chargement">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>
    </div>
  </div>
);

// Placeholder for pages in progress
const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex h-full min-h-[calc(100vh-8rem)] items-center justify-center p-8 text-center">
    <div>
      <div className="text-6xl mb-4" role="img" aria-label="En construction">🚧</div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Cette page est en cours de construction.</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="sport-center-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<ComingSoon title="À propos" />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/trainers" element={<Trainers />} />
                <Route path="/places" element={<Places />} />
                <Route path="/equipements" element={<Equipements />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/verification" element={<Verification />} />
              </Route>

              {/* Auth Pages (no public layout) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ComingSoon title="Mot de passe oublié" />} />
              <Route path="/change-password" element={<ChangePassword />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="subscribers" element={<AdminSubscribers />} />
                <Route path="requests" element={<AdminRequests />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="activities" element={<AdminActivities />} />
                <Route path="trainers" element={<AdminTrainers />} />
                <Route path="places" element={<AdminPlaces />} />
                <Route path="equipment" element={<AdminEquipment />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="reservations" element={<ComingSoon title="Gestion Réservations" />} />
                <Route path="receipts" element={<AdminReceipts />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<ComingSoon title="Paramètres" />} />
              </Route>

              {/* User Dashboard Routes */}
              <Route path="/dashboard" element={<UserLayout />}>
                <Route index element={<UserDashboard />} />
                <Route path="subscription" element={<UserSubscription />} />
                <Route path="reservations" element={<UserReservations />} />
                <Route path="payments" element={<UserPayments />} />
                <Route path="receipts" element={<UserReceipts />} />
                <Route path="history" element={<UserHistory />} />
                <Route path="notifications" element={<UserNotifications />} />
                <Route path="profile" element={<UserProfile />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={
                <div className="flex min-h-screen items-center justify-center text-center px-4 bg-slate-50 dark:bg-slate-950">
                  <div>
                    <h1 className="text-8xl font-extrabold text-primary-600 dark:text-primary-400">404</h1>
                    <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Page introuvable</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">La page que vous recherchez n'existe pas.</p>
                    <a href="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 text-white px-6 py-3 font-medium hover:bg-primary-700 transition-colors">
                      ← Retour à l'accueil
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
