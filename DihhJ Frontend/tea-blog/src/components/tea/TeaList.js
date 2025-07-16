import React, { useState, useEffect } from 'react';
import { teaAPI } from '../../services/api';
import TeaCard from './TeaCard';
import './Tea.css';

const TeaList = ({ filters = {}, onTeaClick, refreshTrigger, onRefresh }) => {
  const [teas, setTeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const loadTeas = async (isLoadMore = false) => {
    console.log('🔥 LOADING TEAS STARTED!', { isLoadMore, loading });

    try {
      const currentPage = isLoadMore ? page : 0;
      const params = {
        skip: currentPage * 10,
        limit: 10,
        ...filters
      };

      console.log('🔥 CALLING API WITH PARAMS:', params);
      const response = await teaAPI.getTeaPosts(params);
      console.log('🔥 API RESPONSE RECEIVED:', response);

      if (response && response.teas) {
        console.log('✅ SETTING TEAS:', response.teas.length, 'posts');
        if (isLoadMore) {
          setTeas(prev => [...prev, ...response.teas]);
        } else {
          setTeas(response.teas);
        }

        setHasMore(response.teas.length === 10);
        setPage(currentPage + 1);
        setError(''); // Clear any previous errors
      } else {
        console.log('⚠️ NO TEAS IN RESPONSE');
        setTeas([]);
      }
    } catch (error) {
      console.error('❌ ERROR LOADING TEAS:', error);
      setError(`Failed to load tea posts: ${error.message}`);
      setTeas([]); // Set empty array on error
    } finally {
      console.log('🔥 SETTING LOADING TO FALSE');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔥 USEEFFECT TRIGGERED - LOADING TEAS');
    setLoading(true);
    setError('');
    setPage(0);
    setTeas([]); // Clear existing teas

    // Force loading to stop after 15 seconds if stuck
    const loadingTimeout = setTimeout(() => {
      console.log('⏰ LOADING TIMEOUT - FORCING STOP');
      setLoading(false);
      setError('Loading timeout - please refresh manually');
    }, 15000);

    loadTeas(false).finally(() => {
      clearTimeout(loadingTimeout);
    });

    setLastRefresh(Date.now());

    return () => clearTimeout(loadingTimeout);
  }, [filters, refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadTeas(true);
    }
  };

  const handleTeaUpdate = (teaId) => {
    // Refresh the specific tea post or the entire list
    // For simplicity, we'll refresh the entire list
    loadTeas(false);
    setLastRefresh(Date.now());
  };

  const handleManualRefresh = () => {
    setLoading(true);
    setError('');
    setPage(0);
    loadTeas(false);
    setLastRefresh(Date.now());
  };



  // EMERGENCY: Show data even if loading is stuck
  React.useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      if (loading) {
        console.log('🚨 EMERGENCY: Forcing loading to stop!');
        setLoading(false);
      }
    }, 5000); // 5 second emergency timeout

    return () => clearTimeout(emergencyTimeout);
  }, [loading]);

  if (loading && teas.length === 0) {
    return (
      <div className="tea-list-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading tea posts...</p>
          <button
            onClick={() => {
              console.log('🔥 EMERGENCY STOP LOADING');
              setLoading(false);
            }}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Stop Loading (Emergency)
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tea-list-container">
        <div className="error-state">
          <p>{error}</p>
          <button 
            onClick={() => loadTeas(false)}
            className="retry-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (teas.length === 0) {
    return (
      <div className="tea-list-container">
        <div className="empty-state">
          <h3>No heat found</h3>
          <p>Be the first to drop some heat! 🔥</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tea-list-container">


      {/* Manual Refresh Button */}
      <div className="refresh-controls">
        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="manual-refresh-btn"
          title="Refresh posts"
        >
          <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>🔄</span>
          Refresh
        </button>
      </div>

      <div className="tea-list">
        {teas.length > 0 ? (
          teas.map(tea => (
            <TeaCard
              key={tea.id}
              tea={tea}
              onTeaUpdate={handleTeaUpdate}
              onTeaClick={onTeaClick}
            />
          ))
        ) : (
          <div className="no-posts-message">
            <h3>No tea posts found</h3>
            <p>Click refresh to load posts or create a new tea post!</p>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="load-more-container">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="load-more-btn"
          >
            {loading ? 'Loading...' : '🔥 Load More Heat'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TeaList;
