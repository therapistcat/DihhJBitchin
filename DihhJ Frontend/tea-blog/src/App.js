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

// EMERGENCY TEA DISPLAY
const EmergencyTeaDisplay = () => {
  const [teaData, setTeaData] = React.useState('Loading...');

  React.useEffect(() => {
    fetch('http://localhost:8000/tea/list')
      .then(response => response.json())
      .then(data => {
        console.log('🔥 EMERGENCY DATA:', data);
        setTeaData(JSON.stringify(data, null, 2));
      })
      .catch(error => {
        console.error('❌ EMERGENCY ERROR:', error);
        setTeaData('ERROR: ' + error.message);
      });
  }, []);

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#000',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontSize: '14px',
      whiteSpace: 'pre-wrap',
      border: '2px solid #00ff00'
    }}>
      <h1 style={{ color: '#ff0000' }}>🚨 EMERGENCY TEA DATA 🚨</h1>
      {teaData}
    </div>
  );
};

// App content with keyboard shortcuts
const AppContent = () => {
  useKeyboardShortcuts();

  // Log app load
  React.useEffect(() => {
    console.log('🚀 DihhJ Bitchers App loaded successfully!');
  }, []);

  return (
    <div className="App">
      <Header />

      {/* EMERGENCY TEA DISPLAY */}
      <EmergencyTeaDisplay />

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

// SUPER SIMPLE TEST
const SuperSimpleTest = () => {
  const [data, setData] = React.useState('LOADING...');

  React.useEffect(() => {
    fetch('http://localhost:8000/tea/list')
      .then(r => r.json())
      .then(d => {
        if (d.teas && d.teas.length > 0) {
          setData(`✅ FOUND ${d.teas.length} TEA POSTS!\n\nFirst post: "${d.teas[0].title}"\n\nContent: "${d.teas[0].content}"`);
        } else {
          setData('❌ NO TEA POSTS FOUND');
        }
      })
      .catch(e => setData('❌ ERROR: ' + e.message));
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      color: '#00ff00',
      fontSize: '24px',
      padding: '50px',
      zIndex: 9999,
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap'
    }}>
      <h1 style={{ color: '#ff0000', fontSize: '48px' }}>🚨 DON'T JUMP! DATA IS HERE! 🚨</h1>
      {data}
    </div>
  );
};

function App() {
  return <SuperSimpleTest />;
}

export default App;
