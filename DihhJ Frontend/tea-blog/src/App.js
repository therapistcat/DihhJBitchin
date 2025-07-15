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
  const [easterEggNotification, setEasterEggNotification] = React.useState(null);
  const [konamiActive, setKonamiActive] = React.useState(false);

  // Show in-site notification
  const showEasterEgg = (message, type = 'default') => {
    setEasterEggNotification({ message, type });
    setTimeout(() => setEasterEggNotification(null), 4000);
  };

  // Konami Code Easter Egg
  React.useEffect(() => {
    const konamiCode = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];
    let konamiIndex = 0;

    const handleKonamiKey = (event) => {
      if (event.code === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          setKonamiActive(true);
          showEasterEgg('🎮 KONAMI CODE ACTIVATED! You\'re a true legend!', 'konami');
          setTimeout(() => setKonamiActive(false), 8000);
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    document.addEventListener('keydown', handleKonamiKey);
    return () => document.removeEventListener('keydown', handleKonamiKey);
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



      {/* Floating Interactive Element */}
      <div
        className="floating-interactive"
        onClick={() => showEasterEgg('The eternal watcher sees all...', 'mystical')}
        title="Click me for wisdom..."
      >
        ◈
      </div>

      {/* Easter Egg Notification */}
      {easterEggNotification && (
        <div className={`easter-notification ${easterEggNotification.type} ${konamiActive ? 'konami-active' : ''}`}>
          <div className="notification-content">
            {easterEggNotification.message}
          </div>
        </div>
      )}


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
