const express = require('express');
const router = express.Router();
const { getSchedule, createTask } = require('../controllers/taskController');

/**
 * @route  GET /api/tasks/schedule
 * @desc   Fetch working schedule - joined tasks, working_times, and users
 * @access Public
 */
router.get('/schedule', getSchedule);

/**
 * @route  POST /api/tasks
 * @desc   Create a new task with working time (manager assigns to employee)
 * @access Public
 */
router.post('/', createTask);

module.exports = router;
