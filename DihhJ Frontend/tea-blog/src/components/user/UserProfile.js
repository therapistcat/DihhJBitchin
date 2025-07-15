import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { teaAPI, commentsAPI } from '../../services/api';
import TeaCard from '../tea/TeaCard';
import LoadingSpinner from '../common/LoadingSpinner';
import './UserProfile.css';

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalUpvotes: 0,
    totalDownvotes: 0
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user's posts
      const postsResponse = await teaAPI.getTeaPosts({ 
        author: user.username,
        limit: 50 
      });
      
      if (postsResponse.teas) {
        setUserPosts(postsResponse.teas);
        
        // Calculate stats
        const totalUpvotes = postsResponse.teas.reduce((sum, post) => sum + post.upvotes, 0);
        const totalDownvotes = postsResponse.teas.reduce((sum, post) => sum + post.downvotes, 0);
        
        setStats(prev => ({
          ...prev,
          totalPosts: postsResponse.teas.length,
          totalUpvotes,
          totalDownvotes
        }));
      }

      // Load user's comments
      try {
        const commentsResponse = await commentsAPI.getUserComments(user.username, { limit: 50 });
        if (commentsResponse.bitches) {
          setUserComments(commentsResponse.bitches);
          setStats(prev => ({
            ...prev,
            totalComments: commentsResponse.bitches.length
          }));
        }
      } catch (error) {
        console.error('Error loading user comments:', error);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await teaAPI.deleteTeaPost(postId, user.username);
        setUserPosts(prev => prev.filter(post => post.id !== postId));
        setStats(prev => ({ ...prev, totalPosts: prev.totalPosts - 1 }));
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return null;
  }

  const handleClose = () => {
    navigate('/');
  };

  const handleTeaClick = (tea) => {
    navigate(`/tea/${tea.id}`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  return (
    <div className="profile-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="profile-container card">
        <div className="profile-header">
          <button onClick={handleClose} className="close-profile-btn">
            ← Back to Feed
          </button>
          <h1 className="profile-title">🔥 Your Profile 🔥</h1>
        </div>

        <div className="profile-content">
          {/* User Info Section */}
          <div className="user-info-section card">
            <div className="user-avatar">
              <div className="avatar-circle">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="user-details">
              <h2 className="username">{user.username}</h2>
              <p className="user-batch">Batch {user.year}</p>
              <p className="join-date">Bitcher since {formatDate(user.created_at || new Date())}</p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <div className="stat-card card">
              <div className="stat-number">{stats.totalPosts}</div>
              <div className="stat-label">Posts</div>
            </div>
            <div className="stat-card card">
              <div className="stat-number">{stats.totalComments}</div>
              <div className="stat-label">Comments</div>
            </div>
            <div className="stat-card card">
              <div className="stat-number">{stats.totalUpvotes}</div>
              <div className="stat-label">Upvotes</div>
            </div>
            <div className="stat-card card">
              <div className="stat-number">{stats.totalDownvotes}</div>
              <div className="stat-label">Downvotes</div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="profile-tabs">
            <button 
              className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              🔥 Your Heat ({stats.totalPosts})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              💬 Your Comments ({stats.totalComments})
            </button>
          </div>

          {/* Content Section */}
          <div className="profile-content-area">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading your content...</p>
              </div>
            ) : (
              <>
                {activeTab === 'posts' && (
                  <div className="user-posts">
                    {userPosts.length === 0 ? (
                      <div className="empty-state">
                        <h3>No posts yet</h3>
                        <p>Start dropping some heat! 🔥</p>
                      </div>
                    ) : (
                      userPosts.map(post => (
                        <div key={post.id} className="user-post-item">
                          <TeaCard
                            tea={post}
                            onTeaClick={handleTeaClick}
                            onTeaUpdate={loadUserData}
                          />
                          <div className="post-actions">
                            <button 
                              onClick={() => handleDeletePost(post.id)}
                              className="delete-post-btn"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="user-comments">
                    {userComments.length === 0 ? (
                      <div className="empty-state">
                        <h3>No comments yet</h3>
                        <p>Start bitchin' in the comments! 💬</p>
                      </div>
                    ) : (
                      userComments.map(comment => (
                        <div key={comment.id} className="user-comment-item card">
                          <div className="comment-content">
                            <p>{comment.content}</p>
                            <div className="comment-meta">
                              <span>Posted {formatDate(comment.created_at)}</span>
                              <span>Score: {comment.score}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
