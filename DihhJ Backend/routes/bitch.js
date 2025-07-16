const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

const router = express.Router();

// Get comments for a tea post
router.get('/:teaId/list', async (req, res) => {
  try {
    const { teaId } = req.params;
    const { skip = 0, limit = 20, sort_by = 'new', order = 'desc' } = req.query;
    
    if (!ObjectId.isValid(teaId)) {
      return res.status(400).json({
        error: 'Invalid tea ID',
        message: 'Please provide a valid tea ID'
      });
    }
    
    const db = getDB();
    const commentsCollection = db.collection('comments');
    
    // Build sort
    let sortOptions = {};
    if (sort_by === 'hot') {
      sortOptions = { score: order === 'desc' ? -1 : 1 };
    } else {
      sortOptions = { created_at: order === 'desc' ? -1 : 1 };
    }
    
    // Get comments
    const comments = await commentsCollection
      .find({ tea_id: teaId })
      .sort(sortOptions)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();
    
    // Get total count
    const total = await commentsCollection.countDocuments({ tea_id: teaId });
    
    res.json({
      comments: comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        author: comment.author,
        tea_id: comment.tea_id,
        upvotes: comment.upvotes || 0,
        downvotes: comment.downvotes || 0,
        score: comment.score || 0,
        created_at: comment.created_at,
        updated_at: comment.updated_at
      })),
      total,
      skip: parseInt(skip),
      limit: parseInt(limit),
      hasMore: (parseInt(skip) + parseInt(limit)) < total
    });
    
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      error: 'Failed to fetch comments',
      message: 'An error occurred while fetching comments'
    });
  }
});

// Create new comment
router.post('/:teaId/create', async (req, res) => {
  try {
    const { teaId } = req.params;
    const { content } = req.body;
    const { username } = req.query;
    
    // Validation
    if (!username) {
      return res.status(400).json({
        error: 'Missing username',
        message: 'Username is required'
      });
    }
    
    if (!ObjectId.isValid(teaId)) {
      return res.status(400).json({
        error: 'Invalid tea ID',
        message: 'Please provide a valid tea ID'
      });
    }
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Missing content',
        message: 'Comment content is required'
      });
    }
    
    if (content.length < 1 || content.length > 1000) {
      return res.status(400).json({
        error: 'Invalid content',
        message: 'Comment must be between 1 and 1000 characters'
      });
    }
    
    const db = getDB();
    const teasCollection = db.collection('teas');
    const commentsCollection = db.collection('comments');
    
    // Check if tea exists
    const tea = await teasCollection.findOne({ _id: new ObjectId(teaId) });
    if (!tea) {
      return res.status(404).json({
        error: 'Tea not found',
        message: 'Tea post does not exist'
      });
    }
    
    // Create comment
    const newComment = {
      content: content.trim(),
      author: username,
      tea_id: teaId,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await commentsCollection.insertOne(newComment);
    
    res.status(201).json({
      message: 'Comment posted successfully!',
      comment: {
        id: result.insertedId,
        ...newComment
      }
    });
    
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      error: 'Failed to create comment',
      message: 'An error occurred while creating the comment'
    });
  }
});

// Update comment
router.put('/comment/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const { username } = req.query;
    
    // Validation
    if (!username) {
      return res.status(400).json({
        error: 'Missing username',
        message: 'Username is required'
      });
    }
    
    if (!ObjectId.isValid(commentId)) {
      return res.status(400).json({
        error: 'Invalid comment ID',
        message: 'Please provide a valid comment ID'
      });
    }
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Missing content',
        message: 'Comment content is required'
      });
    }
    
    if (content.length < 1 || content.length > 1000) {
      return res.status(400).json({
        error: 'Invalid content',
        message: 'Comment must be between 1 and 1000 characters'
      });
    }
    
    const db = getDB();
    const commentsCollection = db.collection('comments');
    
    // Check if comment exists and user owns it
    const comment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
        message: 'Comment does not exist'
      });
    }
    
    if (comment.author !== username) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only edit your own comments'
      });
    }
    
    // Update comment
    await commentsCollection.updateOne(
      { _id: new ObjectId(commentId) },
      {
        $set: {
          content: content.trim(),
          updated_at: new Date()
        }
      }
    );
    
    // Get updated comment
    const updatedComment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
    
    res.json({
      message: 'Comment updated successfully!',
      comment: {
        id: updatedComment._id,
        content: updatedComment.content,
        author: updatedComment.author,
        tea_id: updatedComment.tea_id,
        upvotes: updatedComment.upvotes || 0,
        downvotes: updatedComment.downvotes || 0,
        score: updatedComment.score || 0,
        created_at: updatedComment.created_at,
        updated_at: updatedComment.updated_at
      }
    });
    
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      error: 'Failed to update comment',
      message: 'An error occurred while updating the comment'
    });
  }
});

// Delete comment
router.delete('/comment/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { username } = req.query;
    
    // Validation
    if (!username) {
      return res.status(400).json({
        error: 'Missing username',
        message: 'Username is required'
      });
    }
    
    if (!ObjectId.isValid(commentId)) {
      return res.status(400).json({
        error: 'Invalid comment ID',
        message: 'Please provide a valid comment ID'
      });
    }
    
    const db = getDB();
    const commentsCollection = db.collection('comments');
    const commentVotesCollection = db.collection('comment_votes');
    
    // Check if comment exists and user owns it
    const comment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
        message: 'Comment does not exist'
      });
    }
    
    if (comment.author !== username) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only delete your own comments'
      });
    }
    
    // Delete comment and its votes
    await commentsCollection.deleteOne({ _id: new ObjectId(commentId) });
    await commentVotesCollection.deleteMany({ comment_id: commentId });
    
    res.json({
      message: 'Comment deleted successfully!'
    });
    
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      error: 'Failed to delete comment',
      message: 'An error occurred while deleting the comment'
    });
  }
});

// Vote on comment
router.post('/comment/:commentId/vote', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { vote_type } = req.query;
    const { username } = req.query;

    // Validation
    if (!username) {
      return res.status(400).json({
        error: 'Missing username',
        message: 'Username is required'
      });
    }

    if (!ObjectId.isValid(commentId)) {
      return res.status(400).json({
        error: 'Invalid comment ID',
        message: 'Please provide a valid comment ID'
      });
    }

    if (!vote_type || !['upvote', 'downvote'].includes(vote_type)) {
      return res.status(400).json({
        error: 'Invalid vote type',
        message: 'Vote type must be "upvote" or "downvote"'
      });
    }

    const db = getDB();
    const commentsCollection = db.collection('comments');
    const commentVotesCollection = db.collection('comment_votes');

    // Check if comment exists
    const comment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
        message: 'Comment does not exist'
      });
    }

    // Check for existing vote
    const existingVote = await commentVotesCollection.findOne({
      user_id: username,
      comment_id: commentId
    });

    let upvoteChange = 0;
    let downvoteChange = 0;

    if (existingVote) {
      // Remove previous vote
      if (existingVote.vote_type === 'upvote') {
        upvoteChange -= 1;
      } else {
        downvoteChange -= 1;
      }

      // If same vote type, remove vote entirely
      if (existingVote.vote_type === vote_type) {
        await commentVotesCollection.deleteOne({ _id: existingVote._id });
      } else {
        // Update to new vote type
        await commentVotesCollection.updateOne(
          { _id: existingVote._id },
          { $set: { vote_type, updated_at: new Date() } }
        );

        if (vote_type === 'upvote') {
          upvoteChange += 1;
        } else {
          downvoteChange += 1;
        }
      }
    } else {
      // Create new vote
      await commentVotesCollection.insertOne({
        user_id: username,
        comment_id: commentId,
        vote_type,
        created_at: new Date()
      });

      if (vote_type === 'upvote') {
        upvoteChange += 1;
      } else {
        downvoteChange += 1;
      }
    }

    // Update comment vote counts
    const newUpvotes = Math.max(0, (comment.upvotes || 0) + upvoteChange);
    const newDownvotes = Math.max(0, (comment.downvotes || 0) + downvoteChange);
    const newScore = newUpvotes - newDownvotes;

    await commentsCollection.updateOne(
      { _id: new ObjectId(commentId) },
      {
        $set: {
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          score: newScore,
          updated_at: new Date()
        }
      }
    );

    // Get updated comment
    const updatedComment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });

    res.json({
      message: 'Vote recorded!',
      comment: {
        id: updatedComment._id,
        content: updatedComment.content,
        author: updatedComment.author,
        tea_id: updatedComment.tea_id,
        upvotes: updatedComment.upvotes,
        downvotes: updatedComment.downvotes,
        score: updatedComment.score,
        created_at: updatedComment.created_at,
        updated_at: updatedComment.updated_at
      }
    });

  } catch (error) {
    console.error('Vote comment error:', error);
    res.status(500).json({
      error: 'Failed to vote',
      message: 'An error occurred while voting on the comment'
    });
  }
});

// Get user's vote status for a comment
router.get('/comment/:commentId/user-vote', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        error: 'Missing username',
        message: 'Username is required'
      });
    }

    if (!ObjectId.isValid(commentId)) {
      return res.status(400).json({
        error: 'Invalid comment ID',
        message: 'Please provide a valid comment ID'
      });
    }

    const db = getDB();
    const commentVotesCollection = db.collection('comment_votes');

    const vote = await commentVotesCollection.findOne({
      user_id: username,
      comment_id: commentId
    });

    res.json({
      user_vote: vote ? vote.vote_type : null
    });

  } catch (error) {
    console.error('Get user comment vote error:', error);
    res.status(500).json({
      error: 'Failed to fetch vote status',
      message: 'An error occurred while fetching vote status'
    });
  }
});

// Get user's comments
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { skip = 0, limit = 10 } = req.query;

    const db = getDB();
    const commentsCollection = db.collection('comments');

    // Get user's comments
    const comments = await commentsCollection
      .find({ author: username })
      .sort({ created_at: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();

    // Get total count
    const total = await commentsCollection.countDocuments({ author: username });

    res.json({
      comments: comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        author: comment.author,
        tea_id: comment.tea_id,
        upvotes: comment.upvotes || 0,
        downvotes: comment.downvotes || 0,
        score: comment.score || 0,
        created_at: comment.created_at,
        updated_at: comment.updated_at
      })),
      total,
      skip: parseInt(skip),
      limit: parseInt(limit),
      hasMore: (parseInt(skip) + parseInt(limit)) < total
    });

  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({
      error: 'Failed to fetch user comments',
      message: 'An error occurred while fetching user comments'
    });
  }
});

module.exports = router;
