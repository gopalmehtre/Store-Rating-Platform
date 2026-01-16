const pool = require('../config/db');
const { hashPassword } = require('../utils/hash');
const validators = require('../utils/validators');

const ownerController = {
  getMyStoreRatings: async (req, res) => {
    try {
      const ownerId = req.user.id;

      const storeResult = await pool.query(
        'SELECT * FROM stores WHERE owner_id = $1',
        [ownerId]
      );

      if (storeResult.rows.length === 0) {
        return res.json({
          success: true,
          data: {
            store: null,
            avgRating: 0,
            ratings: []
          }
        });
      }

      const store = storeResult.rows[0];

      const ratingsResult = await pool.query(
        `SELECT 
          r.*,
          u.name as user_name,
          u.email as user_email
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        WHERE r.store_id = $1
        ORDER BY r.created_at DESC`,
        [store.id]
      );

      const avgResult = await pool.query(
        'SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as avg_rating FROM ratings WHERE store_id = $1',
        [store.id]
      );

      res.json({
        success: true,
        data: {
          store,
          avgRating: parseFloat(avgResult.rows[0].avg_rating),
          ratings: ratingsResult.rows
        }
      });
    } catch (error) {
      console.error('Get store ratings error:', error);
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

module.exports = ownerController;