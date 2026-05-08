const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');

/**
 * @route  GET /api/users
 * @desc   Fetch all users (optional ?role=employee|manager|assignee)
 * @access Public
 */
router.get('/', getUsers);

module.exports = router;
