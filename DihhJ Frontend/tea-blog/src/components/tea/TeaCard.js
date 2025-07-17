import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { teaAPI } from '../../services/api';
import LazyImage from '../common/LazyImage';
import './Tea.css';

const TeaCard = ({ tea, onTeaUpdate, onTeaClick }) => {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [currentScore, setCurrentScore] = useState(tea.score);
  const [userVote, setUserVote] = useState(null); // Track user's vote: 'upvote', 'downvote', or null

  // Load user's vote status when component mounts or user changes
  useEffect(() => {
    const loadUserVoteStatus = async () => {
      if (!user) {
        setUserVote(null);
        return;
      }

      try {
        const voteStatus = await teaAPI.getUserVoteStatus(tea.id, user.username);
        setUserVote(voteStatus.user_vote);
      } catch (error) {
        console.error('Error loading vote status:', error);
        setUserVote(null);
      }
    };

    loadUserVoteStatus();
  }, [user, tea.id]);

  const handleVote = async (voteType) => {
    if (!user) {
      // Create a temporary notification for login requirement
      const notification = document.createElement('div');
      notification.className = 'vote-notification';
      notification.textContent = 'Please login to vote!';
      document.body.appendChild(notification);
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 2000);
      return;
    }

    // Check if user has already voted
    if (userVote) {
      const notification = document.createElement('div');
      notification.className = 'vote-notification';
      notification.textContent = `You already ${userVote}d this post!`;
      document.body.appendChild(notification);
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 2000);
      return;
    }

    setIsVoting(true);
    try {
      await teaAPI.voteOnTea(tea.id, voteType, user.username);

      // Update user vote state
      setUserVote(voteType);

      // Optimistically update the UI score only
      if (voteType === 'upvote') {
        setCurrentScore(prev => prev + 1);
      } else {
        setCurrentScore(prev => prev - 1);
      }

      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'vote-notification success';
      notification.textContent = `${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'} successfully!`;
      document.body.appendChild(notification);
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 2000);

      // REMOVED onTeaUpdate call - was causing infinite reloading!
      // if (onTeaUpdate) {
      //   onTeaUpdate(tea.id);
      // }
    } catch (error) {
      console.error('Error voting:', error);
      const notification = document.createElement('div');
      notification.className = 'vote-notification error';

      // Show specific error message from backend if available
      if (error.response && error.response.data && error.response.data.detail) {
        notification.textContent = error.response.data.detail;
      } else {
        notification.textContent = 'Failed to vote. Please try again.';
      }

      document.body.appendChild(notification);
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 2000);
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  // Get post freshness info for visual indicators
  const getPostFreshness = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return { level: 'fresh', icon: '🔥', label: 'Hot', color: '#ef4444' };
    } else if (diffInHours < 6) {
      return { level: 'recent', icon: '✨', label: 'Fresh', color: '#f97316' };
    } else if (diffInHours < 24) {
      return { level: 'today', icon: '☀️', label: 'Today', color: '#eab308' };
    } else if (diffInHours < 72) {
      return { level: 'recent-days', icon: '📅', label: 'Recent', color: '#3b82f6' };
    } else if (diffInHours < 168) {
      return { level: 'this-week', icon: '📊', label: 'This Week', color: '#8b5cf6' };
    } else {
      return { level: 'old', icon: '📚', label: 'Archive', color: '#6b7280' };
    }
  };

  const truncateContent = (content, maxLength = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const freshness = getPostFreshness(tea.created_at);

  return (
    <article className={`tea-card card card-elevated card-interactive freshness-${freshness.level}`}>
      {/* Freshness Indicator */}
      <div
        className="freshness-indicator"
        style={{ backgroundColor: freshness.color }}
        title={`${freshness.label} - ${formatDate(tea.created_at)}`}
      >
        <span className="freshness-icon">{freshness.icon}</span>
        <span className="freshness-label">{freshness.label}</span>
      </div>

      <div className="tea-voting">
        <button
          className={`vote-btn upvote btn-icon-sm ${userVote === 'upvote' ? 'voted' : ''}`}
          onClick={() => handleVote('upvote')}
          disabled={isVoting || !user || userVote}
          title={!user ? 'Login to vote' : userVote ? 'Already voted' : 'Upvote'}
          aria-label="Upvote this post"
        >
          ▲
        </button>
        <span
          className={`score ${currentScore > 0 ? 'positive' : currentScore < 0 ? 'negative' : ''}`}
          aria-label={`Score: ${currentScore}`}
        >
          {currentScore}
        </span>
        <button
          className={`vote-btn downvote btn-icon-sm ${userVote === 'downvote' ? 'voted' : ''}`}
          onClick={() => handleVote('downvote')}
          disabled={isVoting || !user || userVote}
          title={!user ? 'Login to vote' : userVote ? 'Already voted' : 'Downvote'}
          aria-label="Downvote this post"
        >
          ▼
        </button>
      </div>

      <div className="tea-content">
        <header className="tea-header">
          <h3
            className="tea-title"
            onClick={() => onTeaClick && onTeaClick(tea)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTeaClick && onTeaClick(tea);
              }
            }}
          >
            {tea.title}
          </h3>
          <div className="tea-meta">
            <span className="tea-author">
              <span className="author-icon">✨</span>
              @{tea.author_username}
            </span>
            <span className="tea-batch">
              <span className="batch-icon">🎓</span>
              Batch '{tea.author_batch}
            </span>
            <time className="tea-time" dateTime={tea.created_at}>
              <span className="time-icon">📅</span>
              {formatDate(tea.created_at)}
            </time>
          </div>
        </header>

        <div className="tea-body">
          <p className="tea-text">{truncateContent(tea.content)}</p>
          
          {tea.images && tea.images.length > 0 && (
            <div className="tea-images">
              {tea.images.slice(0, 3).map((image, index) => (
                <LazyImage
                  key={index}
                  src={image}
                  alt={`Tea post image ${index + 1}`}
                  className="tea-image"
                  placeholder="🖼️"
                />
              ))}
              {tea.images.length > 3 && (
                <div className="more-images">
                  <span className="more-icon">📸</span>
                  +{tea.images.length - 3} more
                </div>
              )}
            </div>
          )}

          {tea.tags && tea.tags.length > 0 && (
            <div className="tea-tags">
              {tea.tags.map((tag, index) => (
                <span key={index} className={`tea-tag tag-${tag}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="tea-footer">
          <div className="tea-stats">
            <span className="stat">
              💬 {tea.comment_count} {tea.comment_count === 1 ? 'bitchin' : 'bitchins'}
            </span>
            <span className="stat">
              ⚡ {Math.abs(currentScore)} vibes
            </span>
          </div>

          <button
            className="tea-discuss-btn btn btn-primary btn-sm"
            onClick={() => onTeaClick && onTeaClick(tea)}
            aria-label={`View comments for ${tea.title}`}
          >
            <span>🔥</span>
            Spill More Tea
          </button>
        </div>
      </div>
    </article>
  );
};

export default TeaCard;
