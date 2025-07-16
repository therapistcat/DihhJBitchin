import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FilterBar from '../common/FilterBar';
import SearchBar from '../common/SearchBar';
import TeaList from './TeaList';
import './Tea.css';

const TeaFeed = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get filters from URL params
  const [filters, setFilters] = useState({
    sort_by: searchParams.get('sort') || 'hot',
    order: searchParams.get('order') || 'desc',
    batch: searchParams.get('batch') || null,
    search: searchParams.get('search') || ''
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewStartTime, setViewStartTime] = useState(Date.now());
  const [showStaleContentWarning, setShowStaleContentWarning] = useState(false);

  // API connectivity test
  const [emergencyData, setEmergencyData] = useState('Testing connection...');

  React.useEffect(() => {
    // Use the same API base URL as the rest of the app
    const apiUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:8000'
      : 'https://dihhjbitchin-backend.onrender.com';

    fetch(`${apiUrl}/tea/list?_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      mode: 'cors',
      cache: 'no-cache',
    })
      .then(r => {
        console.log('🚨 Emergency test response status:', r.status);
        return r.json();
      })
      .then(d => {
        console.log('🚨 Emergency test data:', d);
        if (d.teas && d.teas.length > 0) {
          setEmergencyData(`✅ FOUND ${d.teas.length} POSTS: "${d.teas[0].title}"`);
        } else {
          setEmergencyData('❌ NO POSTS FOUND');
        }
      })
      .catch(e => {
        console.error('🚨 Emergency test error:', e);
        setEmergencyData('❌ ERROR: ' + e.message);
      });
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.sort_by !== 'hot') params.set('sort', filters.sort_by);
    if (filters.order !== 'desc') params.set('order', filters.order);
    if (filters.batch) params.set('batch', filters.batch);
    if (filters.search) params.set('search', filters.search);
    if (filters.time_filter && filters.time_filter !== 'all') params.set('time_filter', filters.time_filter);

    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Check for stale content warning
  useEffect(() => {
    const checkStaleContent = () => {
      const now = Date.now();
      const timeSinceView = now - viewStartTime;

      // Show warning after 10 minutes of viewing the same content
      if (timeSinceView > 10 * 60 * 1000 && !showStaleContentWarning) {
        setShowStaleContentWarning(true);
      }
    };

    const interval = setInterval(checkStaleContent, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [viewStartTime, showStaleContentWarning]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setViewStartTime(Date.now()); // Reset view time when filters change
    setShowStaleContentWarning(false);
  };

  const handleTeaClick = (tea) => {
    navigate(`/tea/${tea.id}`);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    setViewStartTime(Date.now()); // Reset view time when refreshing
    setShowStaleContentWarning(false);
  };

  const handleSearch = (searchQuery) => {
    setFilters(prev => ({
      ...prev,
      search: searchQuery
    }));
    setViewStartTime(Date.now()); // Reset view time when searching
    setShowStaleContentWarning(false);
  };

  const dismissStaleWarning = () => {
    setShowStaleContentWarning(false);
    setViewStartTime(Date.now()); // Reset the timer
  };

  return (
    <div className="tea-feed">
      {/* EMERGENCY STATUS */}
      <div style={{
        padding: '20px',
        backgroundColor: '#ff0000',
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: '10px 0'
      }}>
        🚨 EMERGENCY STATUS: {emergencyData} 🚨
      </div>

      {/* Stale Content Warning */}
      {showStaleContentWarning && (
        <div className="stale-content-warning">
          <div className="warning-content">
            <span className="warning-icon">⏰</span>
            <span className="warning-text">
              You've been viewing the same content for a while. Check for fresh tea!
            </span>
            <button onClick={handleRefresh} className="refresh-warning-btn">
              🔄 Refresh
            </button>
            <button onClick={dismissStaleWarning} className="dismiss-warning-btn">
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="tea-feed-header">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search for tea, drama, or spill the beans... 🔍"
          className="tea-search"
        />
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>
      <TeaList
        filters={filters}
        onTeaClick={handleTeaClick}
        refreshTrigger={refreshTrigger}
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default TeaFeed;
