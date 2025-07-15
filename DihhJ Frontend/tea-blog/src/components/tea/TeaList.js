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
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [newPostsAvailable, setNewPostsAvailable] = useState(false);

  const loadTeas = async (isLoadMore = false) => {
    console.log('Loading teas...', { isLoadMore, filters });
    try {
      const currentPage = isLoadMore ? page : 0;
      const params = {
        skip: currentPage * 10,
        limit: 10,
        ...filters
      };

      console.log('API call params:', params);
      const response = await teaAPI.getTeaPosts(params);
      console.log('API response:', response);

      if (response && response.teas) {
        if (isLoadMore) {
          setTeas(prev => [...prev, ...response.teas]);
        } else {
          setTeas(response.teas);
        }

        setHasMore(response.teas.length === 10);
        setPage(currentPage + 1);
        console.log('Teas loaded successfully:', response.teas.length);
      } else {
        console.warn('No teas in response:', response);
        setTeas([]);
      }
    } catch (error) {
      console.error('Error loading teas:', error);
      setError(`Failed to load tea posts: ${error.message}`);
    } finally {
      setLoading(false);
      console.log('Loading finished');
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    setPage(0);
    setNewPostsAvailable(false);
    loadTeas(false);
    setLastRefresh(Date.now());
  }, [filters, refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh mechanism
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const checkForNewPosts = async () => {
      try {
        // Only check if we're on the first page and not currently loading
        if (page > 0 || loading) return;

        const params = {
          skip: 0,
          limit: 1, // Just check if there's a newer post
          ...filters
        };

        const response = await teaAPI.getTeaPosts(params);
        if (response && response.teas && response.teas.length > 0) {
          const latestPost = response.teas[0];
          const latestPostTime = new Date(latestPost.created_at).getTime();

          // If there's a newer post than our last refresh, show notification
          if (latestPostTime > lastRefresh && teas.length > 0) {
            setNewPostsAvailable(true);
          }
        }
      } catch (error) {
        console.error('Error checking for new posts:', error);
      }
    };

    // Check for new posts every 30 seconds
    const interval = setInterval(checkForNewPosts, 30000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, page, loading, filters, lastRefresh, teas.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh every 5 minutes if enabled
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const autoRefresh = () => {
      // Only auto-refresh if user is on first page and not actively loading
      if (page === 0 && !loading) {
        console.log('Auto-refreshing tea posts...');
        loadTeas(false);
        setLastRefresh(Date.now());
        setNewPostsAvailable(false);
      }
    };

    const interval = setInterval(autoRefresh, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, page, loading]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setNewPostsAvailable(false);
  };

  const handleManualRefresh = () => {
    setLoading(true);
    setError('');
    setPage(0);
    loadTeas(false);
    setLastRefresh(Date.now());
    setNewPostsAvailable(false);
  };

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
  };

  const handleNewPostsClick = () => {
    handleManualRefresh();
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
      {/* New Posts Notification */}
      {newPostsAvailable && (
        <div className="new-posts-notification">
          <div className="notification-content">
            <span className="notification-icon">✨</span>
            <span className="notification-text">New tea posts available!</span>
            <button
              onClick={handleNewPostsClick}
              className="refresh-btn"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      )}

      {/* Refresh Controls */}
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

        <button
          onClick={toggleAutoRefresh}
          className={`auto-refresh-toggle ${autoRefreshEnabled ? 'active' : ''}`}
          title={`Auto-refresh is ${autoRefreshEnabled ? 'enabled' : 'disabled'}`}
        >
          <span className="toggle-icon">{autoRefreshEnabled ? '🔄' : '⏸️'}</span>
          Auto-refresh {autoRefreshEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="tea-list">
        {teas.map(tea => (
          <TeaCard
            key={tea.id}
            tea={tea}
            onTeaUpdate={handleTeaUpdate}
            onTeaClick={onTeaClick}
          />
        ))}
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
