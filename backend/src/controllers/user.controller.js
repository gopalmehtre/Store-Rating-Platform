const pool = require('../config/db');
const { hashPassword } = require('../utils/hash');
const validators = require('../utils/validators');

const userController = {
  getStores: async (req, res) => {
    try {
      const { search, sortBy = 'name', order = 'ASC' } = req.query;
      const userId = req.user.id;

      let query = `
        SELECT 
          s.*,
          COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as avg_rating,
          ur.rating as user_rating
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1
        WHERE 1=1
      `;
      const params = [userId];
      let paramIndex = 2;

      if (search) {
        query += ` AND (s.name ILIKE $${paramIndex} OR s.address ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ' GROUP BY s.id, ur.rating';

      const allowedSortFields = ['name', 'avg_rating', 'created_at'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
      const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortField === 'name' ? 's.name' : sortField} ${sortOrder}`;

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get stores error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  submitRating: async (req, res) => {
    try {
      const { storeId, rating } = req.body;
      const userId = req.user.id;

      const error = validators.rating(rating);
      if (error) {
        return res.status(400).json({ success: false, message: error });
      }

      const storeCheck = await pool.query(
        'SELECT id FROM stores WHERE id = $1',
        [storeId]
      );

      if (storeCheck.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Store not found' 
        });
      }
      const result = await pool.query(
        `INSERT INTO ratings (user_id, store_id, rating) 
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, store_id) 
         DO UPDATE SET rating = $3, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId, storeId, rating]
      );

      res.json({
        success: true,
        message: 'Rating submitted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Submit rating error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  updatePassword: async (req, res) => {
    try {
      const { newPassword } = req.body;
      const userId = req.user.id;

      
      const error = validators.password(newPassword);
      if (error) {
        return res.status(400).json({ success: false, message: error });
      }

      const hashedPassword = await hashPassword(newPassword);

      await pool.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedPassword, userId]
      );

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = userController;