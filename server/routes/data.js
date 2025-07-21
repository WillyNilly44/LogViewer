const express = require('express');
const router = express.Router();
const db = require('../config/database');
const SqlHelper = require('../utils/sqlHelper');

// Initialize database connection
db.connect().catch(console.error);

// Initialize SQL helper
const sqlHelper = new SqlHelper(process.env.DB_TYPE || 'postgresql');

// GET /api/data - Fetch all data (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Get paginated data using SQL helper
    const { query, params } = sqlHelper.getPaginatedQuery('logs', 'created_at DESC', limit, offset);
    const data = await db.query(query, params);
    
    // Get total count for pagination
    const { query: countQuery, params: countParams } = sqlHelper.getCountQuery('logs');
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult[0].count);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// GET /api/data/search - Search data
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Search in message and level columns
    const { query, params } = sqlHelper.getSearchQuery('logs', ['message', 'level'], q, limit, offset);
    const data = await db.query(query, params);

    res.json({ data });
  } catch (error) {
    console.error('Error searching data:', error);
    res.status(500).json({ error: 'Failed to search data' });
  }
});

// GET /api/data/stats - Get statistics
router.get('/stats', async (req, res) => {
  try {
    // Get statistics using SQL helper
    const totalQuery = sqlHelper.getCountQuery('logs');
    const todayQuery = sqlHelper.getTodayQuery('logs');
    const levelQuery = sqlHelper.getByLevelQuery('logs');

    const [totalResult, todayResult, levelResult] = await Promise.all([
      db.query(totalQuery.query, totalQuery.params),
      db.query(todayQuery.query, todayQuery.params),
      db.query(levelQuery.query, levelQuery.params)
    ]);

    res.json({
      total: totalResult[0].count,
      today: todayResult[0].count,
      byLevel: levelResult
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/data/:id - Get specific record
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { query, params } = sqlHelper.getByIdQuery('logs', id);
    const data = await db.query(query, params);

    if (data.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(data[0]);
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

module.exports = router;
