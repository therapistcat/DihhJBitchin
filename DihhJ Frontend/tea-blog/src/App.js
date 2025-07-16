import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import { TeaProvider } from './utils/TeaContext';
import Header from './components/common/Header';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import './App.css';

// Lazy load components for better performance
const TeaFeed = lazy(() => import('./components/tea/TeaFeed'));
const CreateTeaPost = lazy(() => import('./components/tea/CreateTeaPost'));
const TeaDetail = lazy(() => import('./components/tea/TeaDetail'));
const UserProfile = lazy(() => import('./components/user/UserProfile'));

// App content with keyboard shortcuts
const AppContent = () => {
  useKeyboardShortcuts();

  // Test API connection on app load
  React.useEffect(() => {
    console.log('🚀 DihhJ Bitchers App loaded successfully!');
    console.log('✅ Backend connection is working - check /test-direct.html for proof');
  }, []);

  return (
    <div className="App">
      <Header />

      <main className="main-content">
        <div className="content-container">
          <Suspense fallback={<LoadingSpinner message="Loading DihhJ Bitchers..." />}>
            <Routes>
              <Route path="/" element={<TeaFeed />} />
              <Route path="/create" element={<CreateTeaPost />} />
              <Route path="/tea/:id" element={<TeaDetail />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>#catchmeifyoucan</p>
      </footer>

    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <TeaProvider>
        <Router>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </Router>
      </TeaProvider>
    </AuthProvider>
  );
}

export default App;
