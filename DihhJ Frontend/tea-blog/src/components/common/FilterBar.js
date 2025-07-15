import React, { useState, useEffect, useCallback } from 'react';
import { teaAPI } from '../../services/api';
import './Common.css';

const FilterBar = ({ filters, onFilterChange }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const tagOptions = ['general', 'informative', 'hari-bitch', 'snitching-on-my-bestie'];

  const timeFilterOptions = [
    { value: 'all', label: '🌍 All Time', icon: '♾️' },
    { value: 'hour', label: '⚡ Last Hour', icon: '🔥' },
    { value: 'day', label: '📅 Today', icon: '☀️' },
    { value: 'week', label: '📊 This Week', icon: '📈' },
    { value: 'month', label: '📆 This Month', icon: '🗓️' }
  ];

  const sortOptions = [
    { value: 'hot', label: '🔥 Hot', description: 'Trending now' },
    { value: 'new', label: '✨ Fresh', description: 'Latest posts' },
    { value: 'top', label: '👑 Top', description: 'Most upvoted' }
  ];

  const loadTags = useCallback(async () => {
    try {
      const response = await teaAPI.getTags();
      if (response.tags) {
        setAvailableTags(response.tags);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
      // Fallback to default tags
      setAvailableTags(tagOptions.map(tag => ({ tag, count: 0 })));
    }
  }, [tagOptions]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);



  const handleTagToggle = (tag) => {
    const currentTags = filters.tags ? filters.tags.split(',') : [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    onFilterChange({
      ...filters,
      tags: newTags.length > 0 ? newTags.join(',') : null
    });
  };

  const handleTimeFilterChange = (timeFilter) => {
    onFilterChange({
      ...filters,
      time_filter: timeFilter === 'all' ? null : timeFilter
    });
  };

  const handleSortChange = (sortBy) => {
    onFilterChange({
      ...filters,
      sort_by: sortBy,
      order: 'desc' // Always use desc for these sort types
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      sort_by: 'hot',
      order: 'desc',
      time_filter: null
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.tags) count++;
    if (filters.batch) count++;
    if (filters.time_filter && filters.time_filter !== 'all') count++;
    return count;
  };

  const selectedTags = filters.tags ? filters.tags.split(',') : [];
  const currentTimeFilter = filters.time_filter || 'all';
  const currentSort = filters.sort_by || 'hot';

  return (
    <div className="filter-bar">
      <div className="filter-main">
        {/* Quick Sort Options */}
        <div className="quick-sort-section">
          <div className="sort-options">
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`sort-btn ${currentSort === option.value ? 'active' : ''}`}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Filter Section */}
        <div className="time-filter-section">
          <div className="time-filters">
            {timeFilterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleTimeFilterChange(option.value)}
                className={`time-filter-btn ${currentTimeFilter === option.value ? 'active' : ''}`}
                title={`Show posts from ${option.label.toLowerCase()}`}
              >
                <span className="filter-icon">{option.icon}</span>
                <span className="filter-text">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="filter-controls">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`filter-toggle-btn ${showAdvanced ? 'active' : ''}`}
          >
            <span>🔧</span>
            More Filters
            {getActiveFilterCount() > 0 && (
              <span className="filter-count">{getActiveFilterCount()}</span>
            )}
          </button>

          {getActiveFilterCount() > 0 && (
            <button onClick={handleClearFilters} className="clear-filters-btn">
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="filter-advanced">
          {/* Tag Filters */}
          <div className="filter-section">
            <h4>Tags</h4>
            <div className="tag-filters">
              {tagOptions.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`tag-filter-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                >
                  {tag}
                  {availableTags.find(t => t.tag === tag)?.count > 0 && (
                    <span className="tag-count">
                      {availableTags.find(t => t.tag === tag)?.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.batch || (filters.time_filter && filters.time_filter !== 'all')) && (
            <div className="filter-section">
              <h4>Active Filters</h4>
              <div className="active-filters">
                {filters.batch && (
                  <span className="active-filter">
                    Batch {filters.batch}
                    <button
                      onClick={() => onFilterChange({ ...filters, batch: null })}
                      className="remove-filter-btn"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.time_filter && filters.time_filter !== 'all' && (
                  <span className="active-filter">
                    {timeFilterOptions.find(opt => opt.value === filters.time_filter)?.label || filters.time_filter}
                    <button
                      onClick={() => handleTimeFilterChange('all')}
                      className="remove-filter-btn"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Search Results Info */}
          {filters.search && (
            <div className="filter-section">
              <div className="search-info">
                <span>Searching for: "{filters.search}"</span>
                <button
                  onClick={() => {
                    onFilterChange({ ...filters, search: null });
                  }}
                  className="remove-filter-btn"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
