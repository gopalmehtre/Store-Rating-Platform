const pool = require('../config/db');
const { hashPassword } = require('../utils/hash');
const validators = require('../utils/validators');

const adminController = {
  
  getDashboard: async (req, res) => {
    try {
      const usersCount = await pool.query('SELECT COUNT(*) FROM users');
      const storesCount = await pool.query('SELECT COUNT(*) FROM stores');
      const ratingsCount = await pool.query('SELECT COUNT(*) FROM ratings');

      res.json({
        success: true,
        data: {
          totalUsers: parseInt(usersCount.rows[0].count),
          totalStores: parseInt(storesCount.rows[0].count),
          totalRatings: parseInt(ratingsCount.rows[0].count)
        }
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  createUser: async (req, res) => {
    try {
      const { name, email, password, address, role } = req.body;

      const errors = validators.validateAll(
        { name, email, password, address },
        ['name', 'email', 'password', 'address']
      );

      if (errors) {
        return res.status(400).json({ success: false, errors });
      }

      if (!['ADMIN', 'USER', 'OWNER'].includes(role)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid role' 
        });
      }

      
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }

      const hashedPassword = await hashPassword(password);

      const result = await pool.query(
        `INSERT INTO users (name, email, password, address, role) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, email, address, role, created_at`,
        [name, email, hashedPassword, address, role]
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  createStore: async (req, res) => {
    try {
      const { name, email, address, ownerId } = req.body;

      const errors = validators.validateAll(
        { name, email, address },
        ['name', 'email', 'address']
      );

      if (errors) {
        return res.status(400).json({ success: false, errors });
      }

      const existingStore = await pool.query(
        'SELECT id FROM stores WHERE email = $1',
        [email]
      );

      if (existingStore.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Store email already exists' 
        });
      }

      if (ownerId) {
        const owner = await pool.query(
          "SELECT id FROM users WHERE id = $1 AND role = 'OWNER'",
          [ownerId]
        );

        if (owner.rows.length === 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid owner ID or user is not an owner' 
          });
        }
      }

      
      const result = await pool.query(
        `INSERT INTO stores (name, email, address, owner_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [name, email, address, ownerId || null]
      );

      res.status(201).json({
        success: true,
        message: 'Store created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Create store error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getUsers: async (req, res) => {
    try {
      const { search, role, sortBy = 'name', order = 'ASC' } = req.query;

      let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      if (search) {
        query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR address ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (role && role !== 'ALL') {
        query += ` AND role = $${paramIndex}`;
        params.push(role);
        paramIndex++;
      }

      const allowedSortFields = ['name', 'email', 'role', 'created_at'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
      const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortField} ${sortOrder}`;

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getStores: async (req, res) => {
    try {
      const { search, sortBy = 'name', order = 'ASC' } = req.query;

      let query = `
        SELECT 
          s.*,
          COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as rating
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND (s.name ILIKE $${paramIndex} OR s.email ILIKE $${paramIndex} OR s.address ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ' GROUP BY s.id';

      const allowedSortFields = ['name', 'email', 'rating', 'created_at'];
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
  }
};

module.exports = adminController;