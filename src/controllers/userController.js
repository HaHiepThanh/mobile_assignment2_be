const pool = require('../config/db');

/**
 * getUsers - Controller for GET /api/users
 *
 * Returns list of all users. Optional query param ?role=employee|manager|assignee
 */
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let query = 'SELECT id, name, role, email FROM users';
    const params = [];

    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }

    query += ' ORDER BY name ASC';

    const [rows] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('[UserController] getUsers error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching users.',
      error: error.message,
    });
  }
};

module.exports = { getUsers };
