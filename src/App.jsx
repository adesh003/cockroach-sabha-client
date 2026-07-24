import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './layouts/Layout';
import CreatePostModal from './components/CreatePostModal';
import { Analytics } from '@vercel/analytics/react';

import { ThemeProvider, useTheme } from './context/ThemeContext';

// Code Splitting & Dynamic Route Lazy Loading for Production Performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const FeedPage = lazy(() => import('./pages/FeedPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function RouteLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 rounded-full border-2 border-[#9A6B32] border-t-transparent animate-spin"></div>
      <p className="text-xs text-[#9A6B32] font-mono font-bold">Entering Sabha Floor...</p>
    </div>
  );
}

import posthog from 'posthog-js';

// Initialize PostHog Privacy Analytics only when a valid environment key is supplied
const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
if (typeof window !== 'undefined' && posthogKey && posthogKey.startsWith('phc_')) {
  try {
    posthog.init(posthogKey, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
      autocapture: true,
      capture_pageview: true,
      persistence: 'localStorage',
    });
  } catch (e) {
    console.warn('PostHog initialization skipped:', e);
  }
}

function AdminProtectedRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function AppRoutes({ setIsCreateOpen, onOpenGazetteStudio, selectedCategory, setSelectedCategory }) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage onOpenGazetteStudio={onOpenGazetteStudio} />} />
        <Route
          path="/feed"
          element={
            <FeedPage
              onOpenCreatePost={() => setIsCreateOpen(true)}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />
          }
        />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* DEDICATED SEPARATE ADMIN ROUTE - STRICTLY PROTECTED */}
        <Route 
          path="/admin" 
          element={
            <AdminProtectedRoute>
              <AdminPage />
            </AdminProtectedRoute>
          } 
        />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function AppContent({ isCreateOpen, setIsCreateOpen, selectedCategory, setSelectedCategory }) {
  const { theme } = useTheme();

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster theme={theme} position="top-right" richColors />
      <Layout
        onOpenCreatePost={() => setIsCreateOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      >
        <AppRoutes
          setIsCreateOpen={setIsCreateOpen}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </Layout>
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={() => {
          window.location.reload();
        }}
      />
    </BrowserRouter>
  );
}

export default function App() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <AppContent
              isCreateOpen={isCreateOpen}
              setIsCreateOpen={setIsCreateOpen}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
            <Analytics />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
