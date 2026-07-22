import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './layouts/Layout';
import CreatePostModal from './components/CreatePostModal';

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
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Toaster theme="dark" position="top-right" richColors />
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
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
