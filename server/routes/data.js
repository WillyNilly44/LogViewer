const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Initialize database connection
db.connect().catch(console.error);

// GET /api/data - Fetch all data (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Example query - replace with your actual table name and columns
    const query = `
      SELECT * FROM logs 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const data = await db.query(query, [limit, offset]);
    
    // Get total count for pagination
    const countQuery = 'SELECT COUNT(*) FROM logs';
    const countResult = await db.query(countQuery);
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

    // Example search query - adjust based on your table structure
    const query = `
      SELECT * FROM logs 
      WHERE message ILIKE $1 OR level ILIKE $1
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const searchTerm = `%${q}%`;
    const data = await db.query(query, [searchTerm, limit, offset]);

    res.json({ data });
  } catch (error) {
    console.error('Error searching data:', error);
    res.status(500).json({ error: 'Failed to search data' });
  }
});

// GET /api/data/stats - Get statistics
router.get('/stats', async (req, res) => {
  try {
    // Example statistics queries - adjust based on your needs
    const queries = {
      total: 'SELECT COUNT(*) as count FROM logs',
      today: `SELECT COUNT(*) as count FROM logs WHERE DATE(created_at) = CURRENT_DATE`,
      byLevel: `SELECT level, COUNT(*) as count FROM logs GROUP BY level`
    };

    const results = {};
    for (const [key, query] of Object.entries(queries)) {
      results[key] = await db.query(query);
    }

    res.json({
      total: results.total[0].count,
      today: results.today[0].count,
      byLevel: results.byLevel
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
    const query = 'SELECT * FROM logs WHERE id = $1';
    const data = await db.query(query, [id]);

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
