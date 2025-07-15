import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { teaAPI } from '../../services/api';
import CommentsList from '../comments/CommentsList';
import LoadingSpinner from '../common/LoadingSpinner';
import './Tea.css';

const TeaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTea, setCurrentTea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState(null);

  // Load tea data on component mount
  useEffect(() => {
    const loadTea = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await teaAPI.getTeaPost(id);
        if (response.tea) {
          setCurrentTea(response.tea);
        } else {
          setError('Tea post not found');
        }
      } catch (error) {
        console.error('Error loading tea:', error);
        setError('Failed to load tea post');
      } finally {
        setLoading(false);
      }
    };

    loadTea();
  }, [id]);

  // Load user's vote status when tea is loaded or user changes
  useEffect(() => {
    const loadUserVoteStatus = async () => {
      if (!user || !currentTea) {
        setUserVote(null);
        return;
      }

      try {
        const voteStatus = await teaAPI.getUserVoteStatus(currentTea.id, user.username);
        setUserVote(voteStatus.user_vote);
      } catch (error) {
        console.error('Error loading vote status:', error);
        setUserVote(null);
      }
    };

    loadUserVoteStatus();
  }, [user, currentTea]);

  const handleClose = () => {
    navigate('/');
  };

  const handleVote = async (voteType) => {
    if (!user) {
      alert('Please login to vote!');
      return;
    }

    // Prevent voting if user has already voted
    if (userVote) {
      alert(`You have already ${userVote}d this post!`);
      return;
    }

    setIsVoting(true);
    try {
      await teaAPI.voteOnTea(currentTea.id, voteType, user.username);

      // Update user vote state
      setUserVote(voteType);

      // Optimistically update the UI score only
      setCurrentTea(prev => ({
        ...prev,
        score: voteType === 'upvote' ? prev.score + 1 : prev.score - 1
      }));
    } catch (error) {
      console.error('Error voting:', error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(error.response.data.detail);
      } else {
        alert('Failed to vote. Please try again.');
      }
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="tea-detail-overlay">
        <div className="tea-detail-container">
          <LoadingSpinner message="Loading tea post..." />
        </div>
      </div>
    );
  }

  if (error || !currentTea) {
    return (
      <div className="tea-detail-overlay">
        <div className="tea-detail-container">
          <div className="tea-detail-error">
            <p>{error || 'Tea post not found'}</p>
            <button onClick={handleClose} className="close-btn">← Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tea-detail-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="tea-detail-container">
        <div className="tea-detail-header">
          <button onClick={handleClose} className="close-detail-btn">
            ← Back
          </button>
        </div>

        <div className="tea-detail-content">
          {/* Tea Post Content */}
          <div className="tea-detail-post">
            <div className="tea-detail-voting">
              <button
                className={`vote-btn upvote large ${userVote === 'upvote' ? 'voted' : ''}`}
                onClick={() => handleVote('upvote')}
                disabled={isVoting || !user || userVote}
                title={!user ? 'Login to vote' : userVote ? 'Already voted' : 'Upvote'}
              >
                ▲
              </button>
              <span className={`score large ${currentTea.score > 0 ? 'positive' : currentTea.score < 0 ? 'negative' : ''}`}>
                {currentTea.score}
              </span>
              <button
                className={`vote-btn downvote large ${userVote === 'downvote' ? 'voted' : ''}`}
                onClick={() => handleVote('downvote')}
                disabled={isVoting || !user || userVote}
                title={!user ? 'Login to vote' : userVote ? 'Already voted' : 'Downvote'}
              >
                ▼
              </button>
            </div>

            <div className="tea-detail-main">
              <h1 className="tea-detail-title">{currentTea.title}</h1>
              
              <div className="tea-detail-meta">
                <span className="tea-author">
                  <span>✨</span>
                  @{currentTea.author_username}
                </span>
                <span className="tea-batch">
                  <span>🎓</span>
                  Batch '{currentTea.author_batch}
                </span>
                <span className="tea-time">
                  <span>📅</span>
                  {formatDate(currentTea.created_at)}
                </span>
                {currentTea.created_at !== currentTea.updated_at && (
                  <span className="tea-edited">
                    <span>✏️</span>
                    edited {formatDate(currentTea.updated_at)}
                  </span>
                )}
              </div>

              <div className="tea-detail-body">
                <p className="tea-detail-text">{currentTea.content}</p>
                
                {currentTea.images && currentTea.images.length > 0 && (
                  <div className="tea-detail-images">
                    {currentTea.images.map((image, index) => (
                      <img 
                        key={index} 
                        src={image} 
                        alt={`Tea post ${index + 1}`}
                        className="tea-detail-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                )}

                {currentTea.tags && currentTea.tags.length > 0 && (
                  <div className="tea-detail-tags">
                    {currentTea.tags.map((tag, index) => (
                      <span key={index} className={`tea-tag tag-${tag}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="tea-detail-stats">
                <div className="stat-item">
                  <span className="stat-icon">⚡</span>
                  <span>{Math.abs(currentTea.score)} vibes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">💬</span>
                  <span>{currentTea.comment_count} {currentTea.comment_count === 1 ? 'bitchin' : 'bitchins'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🔥</span>
                  <span>Hot Tea</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <CommentsList teaId={currentTea.id} />
        </div>
      </div>
    </div>
  );
};

export default TeaDetail;
