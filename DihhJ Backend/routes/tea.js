const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

const router = express.Router();

// Available tags for tea posts
const AVAILABLE_TAGS = ['general', 'informative', 'hari-bitch', 'snitching-on-my-bestie'];

// Get tea posts with pagination and filtering
router.get('/list', async (req, res) => {
  try {
    const {
      skip = 0,
      limit = 10,
      sort_by = 'hot',
      order = 'desc',
      tag,
      batch,
      search
    } = req.query;
    
    const db = getDB();
    const teasCollection = db.collection('teas');
    
    // Build query
    const query = {};
    
    if (tag && AVAILABLE_TAGS.includes(tag)) {
      query.tag = tag;
    }
    
    if (batch) {
      query.batch = batch;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort
    let sortOptions = {};
    if (sort_by === 'hot') {
      sortOptions = { score: order === 'desc' ? -1 : 1 };
    } else if (sort_by === 'new') {
      sortOptions = { created_at: order === 'desc' ? -1 : 1 };
    } else {
      sortOptions = { created_at: -1 }; // Default to newest first
    }
    
    // Get teas with pagination
    const teas = await teasCollection
      .find(query)
      .sort(sortOptions)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();
    
    // Get total count for pagination
    const total = await teasCollection.countDocuments(query);
    
    res.json({
      teas: teas.map(tea => ({
        id: tea._id,
        title: tea.title,
        content: tea.content,
        tag: tea.tag,
        batch: tea.batch,
        author: tea.author,
        upvotes: tea.upvotes || 0,
        downvotes: tea.downvotes || 0,
        score: tea.score || 0,
        created_at: tea.created_at,
        updated_at: tea.updated_at
      })),
      total,
      skip: parseInt(skip),
      limit: parseInt(limit),
      hasMore: (parseInt(skip) + parseInt(limit)) < total
    });
    
  } catch (error) {
    console.error('Get teas error:', error);
    res.status(500).json({
      error: 'Failed to fetch teas',
      message: 'An error occurred while fetching tea posts'
    });
  }
});

// Create new tea post
router.post('/create', async (req, res) => {
  try {
    const { title, content, tag = 'general', batch } = req.body;
    const { username } = req.query;
    
    // Validation
    if (!username) {
      return res.status(400).json({
        error: 'Missing username',
        message: 'Username is required'
      });
    }
    
    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title and content are required'
      });
    }
    
    if (title.length < 3 || title.length > 200) {
      return res.status(400).json({
        error: 'Invalid title',
        message: 'Title must be between 3 and 200 characters'
      });
    }
    
    if (content.length < 10 || content.length > 5000) {
      return res.status(400).json({
        error: 'Invalid content',
        message: 'Content must be between 10 and 5000 characters'
      });
    }
    
    if (!AVAILABLE_TAGS.includes(tag)) {
      return res.status(400).json({
        error: 'Invalid tag',
        message: `Tag must be one of: ${AVAILABLE_TAGS.join(', ')}`
      });
    }
    
    const db = getDB();
    const teasCollection = db.collection('teas');
    
    // Create tea post
    const newTea = {
      title: title.trim(),
      content: content.trim(),
      tag,
      batch: batch || null,
      author: username,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await teasCollection.insertOne(newTea);
    
    res.status(201).json({
      message: 'Tea posted successfully!',
      tea: {
        id: result.insertedId,
        ...newTea
      }
    });
    
  } catch (error) {
    console.error('Create tea error:', error);
    res.status(500).json({
      error: 'Failed to create tea',
      message: 'An error occurred while creating the tea post'
    });
  }
});

// Get available tags
router.get('/tags', async (req, res) => {
  try {
    res.json({
      tags: AVAILABLE_TAGS
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      error: 'Failed to fetch tags',
      message: 'An error occurred while fetching tags'
    });
  }
});

// Get batch statistics
router.get('/batches', async (req, res) => {
  try {
    const db = getDB();
    const teasCollection = db.collection('teas');

    // Get batch counts
    const batchCounts = await teasCollection.aggregate([
      { $match: { batch: { $ne: null } } },
      { $group: { _id: '$batch', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    const batches = batchCounts.map(item => ({
      batch: item._id,
      count: item.count
    }));

    // Add default batches if they don't exist
    const defaultBatches = ['25', '26', '27'];
    defaultBatches.forEach(batch => {
      if (!batches.find(b => b.batch === batch)) {
        batches.push({ batch, count: 0 });
      }
    });

    // Sort batches
    batches.sort((a, b) => a.batch.localeCompare(b.batch));

    res.json({ batches });

  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({
      error: 'Failed to fetch batches',
      message: 'An error occurred while fetching batch statistics'
    });
  }
});

// Get single tea post
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid tea ID',
        message: 'Please provide a valid tea ID'
      });
    }

    const db = getDB();
    const teasCollection = db.collection('teas');

    const tea = await teasCollection.findOne({ _id: new ObjectId(id) });

    if (!tea) {
      return res.status(404).json({
        error: 'Tea not found',
        message: 'Tea post does not exist'
      });
    }

    res.json({
      id: tea._id,
      title: tea.title,
      content: tea.content,
      tag: tea.tag,
      batch: tea.batch,
      author: tea.author,
      upvotes: tea.upvotes || 0,
      downvotes: tea.downvotes || 0,
      score: tea.score || 0,
      created_at: tea.created_at,
      updated_at: tea.updated_at
    });

  } catch (error) {
    console.error('Get tea error:', error);
    res.status(500).json({
      error: 'Failed to fetch tea',
      message: 'An error occurred while fetching the tea post'
    });
  }
});

// Update tea post
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tag, batch } = req.body;
    const { username } = req.query;

    // Validation
    if (!username) {
      return res.status(400).json({
        error: 'Missing username',
        message: 'Username is required'
      });
    }

    // For memory database, accept string IDs, for MongoDB validate ObjectId
    if (id.startsWith('teas_')) {
      // Memory database ID format
    } else if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid tea ID',
        message: 'Please provide a valid tea ID'
      });
    }

    const db = getDB();
    const teasCollection = db.collection('teas');

    // Check if tea exists and user owns it
    const query = id.startsWith('teas_') ? { _id: id } : { _id: new ObjectId(id) };
    const tea = await teasCollection.findOne(query);
    if (!tea) {
      return res.status(404).json({
        error: 'Tea not found',
        message: 'Tea post does not exist'
      });
    }

    if (tea.author !== username) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only edit your own tea posts'
      });
    }

    // Prepare update data
    const updateData = { updated_at: new Date() };

    if (title) {
      if (title.length < 3 || title.length > 200) {
        return res.status(400).json({
          error: 'Invalid title',
          message: 'Title must be between 3 and 200 characters'
        });
      }
      updateData.title = title.trim();
    }

    if (content) {
      if (content.length < 10 || content.length > 5000) {
        return res.status(400).json({
          error: 'Invalid content',
          message: 'Content must be between 10 and 5000 characters'
        });
      }
      updateData.content = content.trim();
    }

    if (tag) {
      if (!AVAILABLE_TAGS.includes(tag)) {
        return res.status(400).json({
          error: 'Invalid tag',
          message: `Tag must be one of: ${AVAILABLE_TAGS.join(', ')}`
        });
      }
      updateData.tag = tag;
    }

    if (batch !== undefined) {
      updateData.batch = batch;
    }

    // Update tea post
    await teasCollection.updateOne(
      query,
      { $set: updateData }
    );

    // Get updated tea
    const updatedTea = await teasCollection.findOne(query);

    res.json({
      message: 'Tea updated successfully!',
      tea: {
        id: updatedTea._id,
        title: updatedTea.title,
        content: updatedTea.content,
        tag: updatedTea.tag,
        batch: updatedTea.batch,
        author: updatedTea.author,
        upvotes: updatedTea.upvotes || 0,
        downvotes: updatedTea.downvotes || 0,
        score: updatedTea.score || 0,
        created_at: updatedTea.created_at,
        updated_at: updatedTea.updated_at
      }
    });

  } catch (error) {
    console.error('Update tea error:', error);
    res.status(500).json({
      error: 'Failed to update tea',
      message: 'An error occurred while updating the tea post'
    });
  }
});

// Delete tea post
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.query;

    // Validation
    if (!username) {
      return res.status(400).json({
        error: 'Missing username',
        message: 'Username is required'
      });
    }

    // For memory database, accept string IDs, for MongoDB validate ObjectId
    if (id.startsWith('teas_')) {
      // Memory database ID format
    } else if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid tea ID',
        message: 'Please provide a valid tea ID'
      });
    }

    const db = getDB();
    const teasCollection = db.collection('teas');
    const votesCollection = db.collection('votes');
    const commentsCollection = db.collection('comments');
    const commentVotesCollection = db.collection('comment_votes');

    // Check if tea exists and user owns it
    const query = id.startsWith('teas_') ? { _id: id } : { _id: new ObjectId(id) };
    const tea = await teasCollection.findOne(query);
    if (!tea) {
      return res.status(404).json({
        error: 'Tea not found',
        message: 'Tea post does not exist'
      });
    }

    if (tea.author !== username) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only delete your own tea posts'
      });
    }

    // Get all comments for this tea to delete their votes too
    const comments = await commentsCollection.find({ tea_id: id }).toArray();
    const commentIds = comments.map(comment => comment._id.toString());

    // Delete tea post and all related data
    await teasCollection.deleteOne(query);
    await votesCollection.deleteMany({ tea_id: id });
    await commentsCollection.deleteMany({ tea_id: id });

    // Delete comment votes for all comments of this tea
    if (commentIds.length > 0) {
      await commentVotesCollection.deleteMany({
        comment_id: { $in: commentIds }
      });
    }

    res.json({
      message: 'Tea post deleted successfully!'
    });

  } catch (error) {
    console.error('Delete tea error:', error);
    res.status(500).json({
      error: 'Failed to delete tea',
      message: 'An error occurred while deleting the tea post'
    });
  }
});

// Vote on tea post
router.post('/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { vote_type } = req.body;
    const { username } = req.query;

    // Validation
    if (!username) {
      return res.status(400).json({
        error: 'Missing username',
        message: 'Username is required'
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid tea ID',
        message: 'Please provide a valid tea ID'
      });
    }

    if (!vote_type || !['upvote', 'downvote'].includes(vote_type)) {
      return res.status(400).json({
        error: 'Invalid vote type',
        message: 'Vote type must be "upvote" or "downvote"'
      });
    }

    const db = getDB();
    const teasCollection = db.collection('teas');
    const votesCollection = db.collection('votes');

    // Check if tea exists
    const tea = await teasCollection.findOne({ _id: new ObjectId(id) });
    if (!tea) {
      return res.status(404).json({
        error: 'Tea not found',
        message: 'Tea post does not exist'
      });
    }

    // Check for existing vote
    const existingVote = await votesCollection.findOne({
      user_id: username,
      tea_id: id
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
        await votesCollection.deleteOne({ _id: existingVote._id });
      } else {
        // Update to new vote type
        await votesCollection.updateOne(
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
      await votesCollection.insertOne({
        user_id: username,
        tea_id: id,
        vote_type,
        created_at: new Date()
      });

      if (vote_type === 'upvote') {
        upvoteChange += 1;
      } else {
        downvoteChange += 1;
      }
    }

    // Update tea vote counts
    const newUpvotes = Math.max(0, (tea.upvotes || 0) + upvoteChange);
    const newDownvotes = Math.max(0, (tea.downvotes || 0) + downvoteChange);
    const newScore = newUpvotes - newDownvotes;

    await teasCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          score: newScore,
          updated_at: new Date()
        }
      }
    );

    // Get updated tea
    const updatedTea = await teasCollection.findOne({ _id: new ObjectId(id) });

    res.json({
      message: 'Vote recorded!',
      tea: {
        id: updatedTea._id,
        title: updatedTea.title,
        content: updatedTea.content,
        tag: updatedTea.tag,
        batch: updatedTea.batch,
        author: updatedTea.author,
        upvotes: updatedTea.upvotes,
        downvotes: updatedTea.downvotes,
        score: updatedTea.score,
        created_at: updatedTea.created_at,
        updated_at: updatedTea.updated_at
      }
    });

  } catch (error) {
    console.error('Vote tea error:', error);
    res.status(500).json({
      error: 'Failed to vote',
      message: 'An error occurred while voting on the tea post'
    });
  }
});

// Get user's vote status for a tea
router.get('/:id/user-vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        error: 'Missing username',
        message: 'Username is required'
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid tea ID',
        message: 'Please provide a valid tea ID'
      });
    }

    const db = getDB();
    const votesCollection = db.collection('votes');

    const vote = await votesCollection.findOne({
      user_id: username,
      tea_id: id
    });

    res.json({
      user_vote: vote ? vote.vote_type : null
    });

  } catch (error) {
    console.error('Get user vote error:', error);
    res.status(500).json({
      error: 'Failed to fetch vote status',
      message: 'An error occurred while fetching vote status'
    });
  }
});

// Get user's tea posts
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { skip = 0, limit = 10, sort_by = 'new', order = 'desc' } = req.query;

    const db = getDB();
    const teasCollection = db.collection('teas');

    // Build sort
    let sortOptions = {};
    if (sort_by === 'hot') {
      sortOptions = { score: order === 'desc' ? -1 : 1 };
    } else {
      sortOptions = { created_at: order === 'desc' ? -1 : 1 };
    }

    // Get user's tea posts
    const teas = await teasCollection
      .find({ author: username })
      .sort(sortOptions)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();

    // Get total count
    const total = await teasCollection.countDocuments({ author: username });

    res.json({
      teas: teas.map(tea => ({
        id: tea._id,
        title: tea.title,
        content: tea.content,
        tag: tea.tag,
        batch: tea.batch,
        author: tea.author,
        upvotes: tea.upvotes || 0,
        downvotes: tea.downvotes || 0,
        score: tea.score || 0,
        created_at: tea.created_at,
        updated_at: tea.updated_at
      })),
      total,
      skip: parseInt(skip),
      limit: parseInt(limit),
      hasMore: (parseInt(skip) + parseInt(limit)) < total
    });

  } catch (error) {
    console.error('Get user teas error:', error);
    res.status(500).json({
      error: 'Failed to fetch user teas',
      message: 'An error occurred while fetching user tea posts'
    });
  }
});

module.exports = router;
