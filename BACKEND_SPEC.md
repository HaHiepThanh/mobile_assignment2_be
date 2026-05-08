# 📦 Backend Specification — Task App Dashboard API

## 1. Tổng quan
Backend phục vụ module "Lịch làm việc & Slot thời gian" cho ứng dụng quản lý công việc.

| Mục | Chi tiết |
|---|---|
| Framework | **ExpressJS** (Node.js) |
| Database | **MySQL** (qua `mysql2/promise`) |
| Port | `3001` (cấu hình qua `SERVER_PORT` trong `.env`) |
| Bind address | `0.0.0.0` (cho phép kết nối từ thiết bị khác trong LAN) |

## 2. Cấu trúc thư mục

```
backend/
├── database/
│   └── schema.sql                 ← Tạo bảng + dữ liệu mẫu
├── src/
│   ├── config/
│   │   └── db.js                  ← MySQL connection pool
│   ├── controllers/
│   │   └── taskController.js      ← Logic xử lý API
│   ├── routes/
│   │   └── taskRoutes.js          ← Định nghĩa route
│   └── server.js                  ← Entry point Express
├── .env                           ← Biến môi trường (DB credentials)
├── .env.example                   ← Template biến môi trường
├── .gitignore
└── package.json
```

## 3. Dependencies

| Package | Version | Vai trò |
|---|---|---|
| `express` | ^4.19.2 | Web framework |
| `mysql2` | ^3.9.7 | MySQL driver (promise-based) |
| `cors` | ^2.8.5 | Cross-origin cho Expo/React Native |
| `dotenv` | ^16.4.5 | Đọc biến .env |
| `nodemon` | ^3.1.0 (dev) | Hot reload khi phát triển |

## 4. Database Schema

### Bảng `users`
| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | INT AUTO_INCREMENT | PK |
| `name` | VARCHAR(100) | Tên người dùng |
| `role` | ENUM('employee','manager','assignee') | Vai trò |
| `email` | VARCHAR(150) UNIQUE | Email |

### Bảng `tasks`
| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | INT AUTO_INCREMENT | PK |
| `title` | VARCHAR(200) | Tiêu đề công việc |
| `description` | TEXT | Mô tả chi tiết |
| `assignee_id` | INT (FK → users.id) | Người được giao |
| `creator_id` | INT (FK → users.id) | Người tạo |
| `event_type` | ENUM('meeting','personal','task') | Loại sự kiện |
| `status` | ENUM('todo','coding','review','done') | Trạng thái |
| `priority` | ENUM('low','medium','high') | Độ ưu tiên |

### Bảng `working_times`
| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | INT AUTO_INCREMENT | PK |
| `task_id` | INT (FK → tasks.id) | Liên kết task |
| `start_time` | DATETIME | Bắt đầu |
| `end_time` | DATETIME | Kết thúc |

### Dữ liệu mẫu
- **5 users**: 1 manager, 2 employees, 2 assignees
- **10 tasks**: phủ đủ 4 status (todo, coding, review, done), 3 event_type (meeting, personal, task), 3 priority (low, medium, high)
- **10 working_times**: slots thời gian cho từng task

## 5. API Endpoints

### `GET /api/tasks/schedule`
Trả về danh sách lịch làm việc — JOIN 3 bảng (`tasks` + `working_times` + `users` × 2: assignee & creator).

**Response mẫu:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "taskId": 5,
      "title": "Personal Dev Study",
      "description": "Read Clean Architecture book",
      "eventType": "personal",
      "status": "todo",
      "priority": "low",
      "timeSlot": {
        "id": 5,
        "startTime": "2026-04-28T00:00:00.000Z",
        "endTime": "2026-04-28T01:30:00.000Z"
      },
      "assignee": {
        "id": 2,
        "name": "Bob Employee",
        "role": "employee",
        "email": "bob@taskapp.com"
      },
      "creator": {
        "id": 2,
        "name": "Bob Employee",
        "role": "employee"
      }
    }
  ]
}
```

**Lưu ý quan trọng:**
- Response data nằm trong `res.data.data` (Axios → Express wrapper)
- Sắp xếp theo `wt.start_time ASC`
- Key format: camelCase (frontend-friendly)

### `GET /health`
Health check — trả `{ status: 'ok', timestamp: '...' }`.

## 6. File chi tiết

### `src/config/db.js`
MySQL connection pool sử dụng `mysql2/promise`. Đọc cấu hình từ `.env`:
- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 3306)
- `DB_USER` (default: root)
- `DB_PASSWORD` (default: thanhhhtt)
- `DB_NAME` (default: assignment2)

### `src/controllers/taskController.js`
Chứa hàm `getSchedule`:
- Thực hiện SQL JOIN 4 bảng (tasks, working_times, users×2)
- Map kết quả từ snake_case SQL → camelCase JSON
- Trả `{ success, count, data }` hoặc `{ success: false, message, error }`

### `src/routes/taskRoutes.js`
Đăng ký route duy nhất: `router.get('/schedule', getSchedule)`
Mount tại `/api/tasks` trong server.js → URL đầy đủ: `/api/tasks/schedule`

### `src/server.js`
- Middleware: `cors()`, `express.json()`
- Routes: `/api/tasks` → taskRoutes
- 404 handler, global error handler
- Listen trên `0.0.0.0:3001`

## 7. Cách chạy

```bash
# 1. Import schema vào MySQL
mysql -u root -p < backend/database/schema.sql

# 2. Tạo file .env (copy từ .env.example)
cp backend/.env.example backend/.env
# Sửa DB_PASSWORD trong .env

# 3. Cài dependencies
cd backend && npm install

# 4. Chạy server
node src/server.js
# Hoặc: npm run dev (nodemon)
```

## 8. Kết nối từ thiết bị khác (LAN)
Server bind `0.0.0.0` → thiết bị khác trong cùng WiFi có thể gọi:
```
http://<IP_MÁY_HOST>:3001/api/tasks/schedule
```
