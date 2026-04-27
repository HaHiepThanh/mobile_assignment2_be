-- ============================================================
-- Task App Dashboard Module - Database Schema & Seed Data
-- ============================================================

CREATE DATABASE IF NOT EXISTS assignment2;
USE assignment2;

-- ────────────────────────────────────────────────────────────
-- Table: users
-- Roles: employee | manager | assignee
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id        INT           NOT NULL AUTO_INCREMENT,
  name      VARCHAR(100)  NOT NULL,
  role      ENUM('employee', 'manager', 'assignee') NOT NULL,
  email     VARCHAR(150)  NOT NULL UNIQUE,
  PRIMARY KEY (id)
);

-- ────────────────────────────────────────────────────────────
-- Table: tasks
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id           INT           NOT NULL AUTO_INCREMENT,
  title        VARCHAR(200)  NOT NULL,
  description  TEXT,
  assignee_id  INT           NOT NULL,
  creator_id   INT           NOT NULL,
  event_type   ENUM('meeting', 'personal', 'task') NOT NULL DEFAULT 'task',
  status       ENUM('todo', 'coding', 'review', 'done') NOT NULL DEFAULT 'todo',
  priority     ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  PRIMARY KEY (id),
  CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_creator  FOREIGN KEY (creator_id)  REFERENCES users(id) ON DELETE CASCADE
);

-- ────────────────────────────────────────────────────────────
-- Table: working_times
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS working_times (
  id          INT       NOT NULL AUTO_INCREMENT,
  task_id     INT       NOT NULL,
  start_time  DATETIME  NOT NULL,
  end_time    DATETIME  NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_working_times_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Users (3 roles represented)
INSERT INTO users (name, role, email) VALUES
  ('Alice Manager',   'manager',  'alice@taskapp.com'),
  ('Bob Employee',    'employee', 'bob@taskapp.com'),
  ('Carol Assignee',  'assignee', 'carol@taskapp.com'),
  ('David Assignee',  'assignee', 'david@taskapp.com'),
  ('Eve Employee',    'employee', 'eve@taskapp.com');

-- Tasks (covering all statuses & event types)
INSERT INTO tasks (title, description, assignee_id, creator_id, event_type, status, priority) VALUES
  ('Sprint Planning Meeting',    'Kick-off for Q2 sprint',           3, 1, 'meeting',  'done',   'high'),
  ('Implement Login Screen',     'Build JWT-based auth flow',         3, 1, 'task',     'coding', 'high'),
  ('Code Review - Auth Module',  'Review PRs from Bob',               4, 1, 'task',     'review', 'medium'),
  ('Write Unit Tests',           'Coverage for service layer',        2, 2, 'task',     'todo',   'medium'),
  ('Personal Dev Study',         'Read Clean Architecture book',      2, 2, 'personal', 'todo',   'low'),
  ('Daily Standup',              'Team sync - 15 min',                3, 1, 'meeting',  'done',   'medium'),
  ('Dashboard UI Components',    'Build TimeSlot & TaskCard',         4, 1, 'task',     'coding', 'high'),
  ('Refactor Redux Store',       'Split slices, add RTK Query',       5, 2, 'task',     'review', 'medium'),
  ('Database Schema Design',     'Finalize ER diagram with team',     3, 1, 'meeting',  'done',   'high'),
  ('Deploy to Staging',          'Push release candidate to staging', 5, 1, 'task',     'todo',   'high');

-- Working Times (realistic time slots for the tasks)
INSERT INTO working_times (task_id, start_time, end_time) VALUES
  (1,  '2026-04-28 09:00:00', '2026-04-28 10:00:00'),
  (2,  '2026-04-28 10:30:00', '2026-04-28 12:30:00'),
  (3,  '2026-04-28 13:00:00', '2026-04-28 14:00:00'),
  (4,  '2026-04-28 14:30:00', '2026-04-28 16:00:00'),
  (5,  '2026-04-28 07:00:00', '2026-04-28 08:30:00'),
  (6,  '2026-04-29 09:00:00', '2026-04-29 09:15:00'),
  (7,  '2026-04-29 10:00:00', '2026-04-29 12:00:00'),
  (8,  '2026-04-29 13:30:00', '2026-04-29 15:00:00'),
  (9,  '2026-04-29 15:30:00', '2026-04-29 16:30:00'),
  (10, '2026-04-30 09:00:00', '2026-04-30 11:00:00');
