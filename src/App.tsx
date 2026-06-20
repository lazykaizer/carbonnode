/** Module containing UI components for App. */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Loader from '@/components/common/Loader';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const CarbonSubtitlesPage = lazy(() => import('@/pages/CarbonSubtitlesPage'));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-green-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>

        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center">
              <Loader size="lg" message="Loading Carbon Node..." />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/carbon-subtitles" element={<CarbonSubtitlesPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
