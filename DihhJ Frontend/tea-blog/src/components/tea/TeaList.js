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
    try {
      const currentPage = isLoadMore ? page : 0;
      const params = {
        skip: currentPage * 10,
        limit: 10,
        ...filters
      };

      const response = await teaAPI.getTeaPosts(params);
      console.log('🔥 TEA API RESPONSE:', response);

      if (response && response.teas) {
        console.log('✅ Found teas:', response.teas.length);
        if (isLoadMore) {
          setTeas(prev => [...prev, ...response.teas]);
        } else {
          setTeas(response.teas);
        }

        setHasMore(response.teas.length === 10);
        setPage(currentPage + 1);
      } else {
        console.log('❌ No teas found in response');
        setTeas([]);
      }
    } catch (error) {
      console.error('Error loading teas:', error);
      setError(`Failed to load tea posts: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    setPage(0);
    loadTeas(false);
    setLastRefresh(Date.now());
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



  if (loading && teas.length === 0) {
    return (
      <div className="tea-list-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading tea posts...</p>
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
      {/* Debug Info */}
      <div style={{ padding: '10px', backgroundColor: '#2a2a2a', color: 'white', marginBottom: '10px' }}>
        <strong>🔥 DEBUG INFO:</strong><br/>
        Teas loaded: {teas.length}<br/>
        Loading: {loading ? 'Yes' : 'No'}<br/>
        Error: {error || 'None'}<br/>
        {teas.length > 0 && (
          <div>
            First tea: {teas[0].title}
          </div>
        )}
      </div>

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
            <div key={tea.id} style={{
              padding: '20px',
              margin: '10px',
              backgroundColor: '#333',
              color: 'white',
              borderRadius: '8px'
            }}>
              <h3>🔥 {tea.title}</h3>
              <p>{tea.content}</p>
              <small>By: {tea.author} | Batch: {tea.batch} | Tag: {tea.tag}</small>
              <br/>
              <small>👍 {tea.upvotes} | 👎 {tea.downvotes} | Score: {tea.score}</small>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            <h3>No tea posts found</h3>
            <p>Click refresh to load posts</p>
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
