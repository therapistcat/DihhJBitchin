import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { commentsAPI } from '../../services/api';
import Comment from './Comment';
import './Comments.css';

const CommentsList = ({ teaId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await commentsAPI.getComments(teaId, {
        order: sortOrder,
        limit: 100 // Load more comments at once
      });

      if (response.bitches) {
        // Organize comments into a tree structure
        const organizedComments = organizeComments(response.bitches);
        setComments(organizedComments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setError('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [teaId, sortOrder]);

  // Organize flat comments into a nested tree structure
  const organizeComments = (flatComments) => {
    const commentMap = {};
    const rootComments = [];

    // First pass: create a map of all comments
    flatComments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    // Second pass: organize into tree structure
    flatComments.forEach(comment => {
      if (comment.parent_id && commentMap[comment.parent_id]) {
        commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  useEffect(() => {
    if (teaId) {
      loadComments();
    }
  }, [teaId, sortOrder, loadComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to comment!');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const commentData = {
        content: newComment.trim()
      };

      await commentsAPI.createComment(teaId, commentData, user.username);
      setNewComment('');
      loadComments(); // Reload comments
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (replyData) => {
    if (!user) {
      alert('Please login to reply!');
      return;
    }

    try {
      await commentsAPI.createComment(teaId, replyData, user.username);
      loadComments(); // Reload comments
    } catch (error) {
      console.error('Error creating reply:', error);
      alert('Failed to post reply. Please try again.');
    }
  };

  const renderComment = (comment, level = 0) => {
    return (
      <div key={comment.id}>
        <Comment
          comment={comment}
          onCommentUpdate={loadComments}
          onReply={handleReply}
          level={level}
        />
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map(reply => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="comments-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comments-container card">
      <div className="comments-header">
        <h3>🔥 Bitchin' Section 🔥</h3>
        <div className="comments-controls">
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="sort-select"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* New Comment Form */}
      <div className="new-comment-form">
        {user ? (
          <form onSubmit={handleSubmitComment}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Drop your thoughts... keep it bitchin'! 🔥"
              rows={4}
              maxLength={1000}
              disabled={isSubmitting}
              className="comment-textarea"
            />
            <div className="comment-form-footer">
              <small>{newComment.length}/1000 characters</small>
              <button 
                type="submit" 
                disabled={isSubmitting || !newComment.trim()}
                className="submit-comment-btn"
              >
                {isSubmitting ? 'Dropping...' : '🔥 Drop Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="login-prompt">
            <p>Please log in to join the discussion!</p>
          </div>
        )}
      </div>

      {/* Comments List */}
      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadComments} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {comments.length === 0 && !error ? (
        <div className="empty-comments">
          <p>No comments yet. Be the first to drop some heat! 🔥</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default CommentsList;
