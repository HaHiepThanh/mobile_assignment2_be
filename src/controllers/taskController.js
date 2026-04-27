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

module.exports = { getSchedule };
