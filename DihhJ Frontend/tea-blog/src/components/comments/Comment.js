import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { commentsAPI } from '../../services/api';
import './Comments.css';

const Comment = ({ comment, onCommentUpdate, onReply, level = 0 }) => {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [currentScore, setCurrentScore] = useState(comment.score);
  const [userVote, setUserVote] = useState(null);

  const maxNestingLevel = 5; // Limit nesting depth

  // Load user's vote status when component mounts or user changes
  useEffect(() => {
    const loadUserVoteStatus = async () => {
      if (!user) {
        setUserVote(null);
        return;
      }

      try {
        const voteStatus = await commentsAPI.getUserCommentVoteStatus(comment.id, user.username);
        setUserVote(voteStatus.user_vote);
      } catch (error) {
        console.error('Error loading comment vote status:', error);
        setUserVote(null);
      }
    };

    loadUserVoteStatus();
  }, [user, comment.id]);

  const handleVote = async (voteType) => {
    if (!user) {
      alert('Please login to vote!');
      return;
    }

    // Prevent voting if user has already voted
    if (userVote) {
      alert(`You have already ${userVote}d this comment!`);
      return;
    }

    setIsVoting(true);
    try {
      await commentsAPI.voteOnComment(comment.id, voteType, user.username);

      // Update user vote state
      setUserVote(voteType);

      // Optimistically update the UI score only
      if (voteType === 'upvote') {
        setCurrentScore(prev => prev + 1);
      } else {
        setCurrentScore(prev => prev - 1);
      }

      if (onCommentUpdate) {
        onCommentUpdate();
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(error.response.data.detail);
      } else {
        alert('Failed to vote. Please try again.');
      }
    } finally {
      setIsVoting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      await commentsAPI.updateComment(comment.id, { content: editContent }, user.username);
      setIsEditing(false);
      if (onCommentUpdate) {
        onCommentUpdate();
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentsAPI.deleteComment(comment.id, user.username);
        if (onCommentUpdate) {
          onCommentUpdate();
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment. Please try again.');
      }
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

  const canEdit = user && user.username === comment.author_username;
  const canReply = user && level < maxNestingLevel;

  return (
    <div className={`comment ${level > 0 ? 'comment-nested' : ''}`} style={{ marginLeft: `${level * 20}px` }}>
      <div className="comment-voting">
        <button
          className={`vote-btn upvote ${userVote === 'upvote' ? 'voted' : ''}`}
          onClick={() => handleVote('upvote')}
          disabled={isVoting || !user || userVote}
          title={!user ? 'Login to vote' : userVote ? 'Already voted' : 'Upvote'}
        >
          ▲
        </button>
        <span className={`score ${currentScore > 0 ? 'positive' : currentScore < 0 ? 'negative' : ''}`}>
          {currentScore}
        </span>
        <button
          className={`vote-btn downvote ${userVote === 'downvote' ? 'voted' : ''}`}
          onClick={() => handleVote('downvote')}
          disabled={isVoting || !user || userVote}
          title={!user ? 'Login to vote' : userVote ? 'Already voted' : 'Downvote'}
        >
          ▼
        </button>
      </div>

      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{comment.author_username}</span>
          <span className="comment-time">{formatDate(comment.created_at)}</span>
          {comment.created_at !== comment.updated_at && (
            <span className="comment-edited">(edited)</span>
          )}
        </div>

        <div className="comment-body">
          {isEditing ? (
            <div className="comment-edit-form">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                maxLength={1000}
                className="comment-edit-textarea"
              />
              <div className="comment-edit-actions">
                <button onClick={handleEdit} className="save-btn">Save</button>
                <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="comment-text">{comment.content}</p>
          )}
        </div>

        <div className="comment-actions">
          <div className="comment-stats">
            {comment.reply_count > 0 && (
              <span className="stat">💬 {comment.reply_count} replies</span>
            )}
          </div>
          
          <div className="comment-buttons">
            {canReply && (
              <button 
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="action-btn"
              >
                Reply
              </button>
            )}
            {canEdit && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="action-btn"
              >
                Edit
              </button>
            )}
            {canEdit && (
              <button 
                onClick={handleDelete}
                className="action-btn delete"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {showReplyForm && onReply && (
          <div className="reply-form">
            <ReplyForm
              parentId={comment.id}
              onReply={(replyData) => {
                onReply(replyData);
                setShowReplyForm(false);
              }}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Simple reply form component
const ReplyForm = ({ parentId, onReply, onCancel }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const replyData = {
        content: content.trim(),
        parent_id: parentId
      };
      
      onReply(replyData);
      setContent('');
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="reply-form-container">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        rows={3}
        maxLength={1000}
        required
        disabled={isSubmitting}
      />
      <div className="reply-form-actions">
        <button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? 'Posting...' : 'Reply'}
        </button>
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default Comment;
