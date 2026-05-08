const pool = require('../config/db');

/**
 * getSchedule - Controller for GET /api/tasks/schedule
 *
 * Returns a joined dataset of:
 *  - tasks (with title, description, event_type, status, priority)
 *  - working_times (start_time, end_time)
 *  - assignee user (name, role, email)
 *  - creator user (name, role)
 */
const getSchedule = async (req, res) => {
  try {
    const query = `
      SELECT
        t.id              AS task_id,
        t.title,
        t.description,
        t.event_type,
        t.status,
        t.priority,

        wt.id             AS working_time_id,
        wt.start_time,
        wt.end_time,

        assignee.id       AS assignee_id,
        assignee.name     AS assignee_name,
        assignee.role     AS assignee_role,
        assignee.email    AS assignee_email,

        creator.id        AS creator_id,
        creator.name      AS creator_name,
        creator.role      AS creator_role

      FROM tasks t

      INNER JOIN working_times wt
        ON wt.task_id = t.id

      INNER JOIN users assignee
        ON assignee.id = t.assignee_id

      INNER JOIN users creator
        ON creator.id = t.creator_id

      ORDER BY wt.start_time ASC;
    `;

    const [rows] = await pool.query(query);

    // Shape the response into a clean JSON structure
    const schedule = rows.map((row) => ({
      taskId:    row.task_id,
      title:     row.title,
      description: row.description,
      eventType: row.event_type,
      status:    row.status,
      priority:  row.priority,
      timeSlot: {
        id:        row.working_time_id,
        startTime: row.start_time,
        endTime:   row.end_time,
      },
      assignee: {
        id:    row.assignee_id,
        name:  row.assignee_name,
        role:  row.assignee_role,
        email: row.assignee_email,
      },
      creator: {
        id:   row.creator_id,
        name: row.creator_name,
        role: row.creator_role,
      },
    }));

    return res.status(200).json({
      success: true,
      count:   schedule.length,
      data:    schedule,
    });
  } catch (error) {
    console.error('[TaskController] getSchedule error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching schedule.',
      error:   error.message,
    });
  }
};

/**
 * createTask - Controller for POST /api/tasks
 *
 * Creates a new task + working_time entry.
 * Request body: { title, description, assignee_id, creator_id, event_type, status, priority, start_time, end_time }
 */
const createTask = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { title, description, assignee_id, creator_id, event_type, status, priority, start_time, end_time } = req.body;

    // Validate required fields
    if (!title || !assignee_id || !creator_id || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, assignee_id, creator_id, start_time, end_time.',
      });
    }

    await connection.beginTransaction();

    // Insert task
    const [taskResult] = await connection.query(
      `INSERT INTO tasks (title, description, assignee_id, creator_id, event_type, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description || '', assignee_id, creator_id, event_type || 'task', status || 'todo', priority || 'medium']
    );

    const taskId = taskResult.insertId;

    // Insert working_time
    await connection.query(
      `INSERT INTO working_times (task_id, start_time, end_time) VALUES (?, ?, ?)`,
      [taskId, start_time, end_time]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: { taskId },
    });
  } catch (error) {
    await connection.rollback();
    console.error('[TaskController] createTask error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating task.',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = { getSchedule, createTask };
