const express = require('express');
const router = express.Router();
const { getSchedule } = require('../controllers/taskController');

/**
 * @route  GET /api/tasks/schedule
 * @desc   Fetch working schedule - joined tasks, working_times, and users
 * @access Public
 */
router.get('/schedule', getSchedule);

module.exports = router;
