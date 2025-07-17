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

  // Connection status (simplified)
  const [connectionStatus, setConnectionStatus] = useState('✅ Connected');

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

  // Removed auto-refresh interval - user requested no auto-reload

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleTeaClick = (tea) => {
    navigate(`/tea/${tea.id}`);
  };



  const handleSearch = (searchQuery) => {
    setFilters(prev => ({
      ...prev,
      search: searchQuery
    }));
  };



  return (
    <div className="tea-feed">
      {/* Removed emergency API test button and auto-refresh functionality */}

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
      />
    </div>
  );
};

export default TeaFeed;
