# API Documentation

## Authentication Routes (`/api/auth`)

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "role": "string (optional, default: 'student')"
}
```

**Response:**
```json
{
  "ok": true,
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "email",
    "role": "role"
  }
}
```

### POST /api/auth/login
Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "emailOrUsername": "string (required, can be email or username)",
  "password": "string (required)"
}
```

**Response:**
```json
{
  "ok": true,
  "token": "jwt-token",
  "user": {
    "_id": "user-id",
    "username": "username",
    "email": "email",
    "role": "role",
    "preferences": {}
  }
}
```

### GET /api/auth/me
Get current authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "_id": "user-id",
    "username": "username",
    "email": "email",
    "role": "role",
    "preferences": {}
  }
}
```

---

## User Management Routes (`/api/users`)

### POST /api/users
Create a new user (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "role": "string (optional)"
}
```

### GET /api/users
List all users (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

### GET /api/users/:id
Get a specific user by ID (Admin only).

### PUT /api/users/:id
Update a user (Admin only).

**Request Body:**
```json
{
  "username": "string (optional)",
  "email": "string (optional)",
  "role": "string (optional)",
  "password": "string (optional)",
  "forcePasswordChange": "boolean (optional)"
}
```

### DELETE /api/users/:id
Delete a user (Admin only).

### PUT /api/users/me
Update current user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "string (optional)",
  "email": "string (optional)",
  "password": "string (optional)",
  "preferences": "object (optional)"
}
```

---

## Lessons Routes (`/api/lessons`)

### GET /api/lessons
List lessons. Returns all lessons for admin/instructor, only published for others.

### GET /api/lessons/:id
Get a specific lesson by ID.

### POST /api/lessons
Create a new lesson (Instructor/Admin only).

**Headers:**
```
Authorization: Bearer <instructor-or-admin-token>
```

**Request Body:**
```json
{
  "title": "string (required)",
  "slug": "string (optional)",
  "summary": "string (optional)",
  "contentHtml": "string (optional)",
  "published": "boolean (optional)"
}
```

### PUT /api/lessons/:id
Update a lesson (Owner, Instructor, or Admin).

### DELETE /api/lessons/:id
Delete a lesson (Owner or Admin).

---

## Notes Routes (`/api/notes`)

### GET /api/notes
List all notes for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

### POST /api/notes
Create a new note.

**Request Body:**
```json
{
  "title": "string (optional, default: 'Untitled')",
  "content": "string (optional)"
}
```

### PUT /api/notes/:id
Update a note (Owner only).

**Request Body:**
```json
{
  "title": "string (optional)",
  "content": "string (optional)"
}
```

### DELETE /api/notes/:id
Delete a note (Owner only).

---

## Kanban Routes (`/api/kanban`)

### GET /api/kanban
List all boards for the authenticated user.

### POST /api/kanban
Create a new kanban board.

**Request Body:**
```json
{
  "title": "string (required)"
}
```

### GET /api/kanban/:id
Get a specific board by ID (Owner only).

### PUT /api/kanban/:id
Update a board (Owner only).

**Request Body:**
```json
{
  "title": "string (optional)",
  "columns": "array (optional)"
}
```

### DELETE /api/kanban/:id
Delete a board (Owner only).

---

## Calendar Routes (`/api/calendar`, `/api/events`)

### GET /api/calendar
List all events for the authenticated user.

### POST /api/calendar
Create a new event.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "start": "date (required)",
  "end": "date (optional)",
  "allDay": "boolean (optional)"
}
```

### PUT /api/calendar/:id
Update an event (Owner only).

### DELETE /api/calendar/:id
Delete an event (Owner only).

---

## Files Routes (`/api/files`)

### POST /api/files/upload
Upload a file.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
Form data with a file field named "file".

### GET /api/files
List all files uploaded by the authenticated user.

---

## Dashboard Routes (`/api/dashboard`, `/api/admin/dashboard`)

### GET /api/dashboard
Get role-specific dashboard widgets.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "role": "admin|instructor|student",
  "widgets": [
    {
      "name": "Widget name",
      "link": "/path"
    }
  ]
}
```

---

## Admin System Routes (`/api/admin/system`)

### GET /api/admin/system
Get system status (Admin only).

**Response:**
```json
{
  "ok": true,
  "serverTime": "ISO-8601 timestamp",
  "uptime": "seconds",
  "mongoState": "0=disconnected, 1=connected"
}
```

### POST /api/admin/system/backup
Trigger a system backup (Admin only).

---

## Raw Course Routes (`/api/raw`)

### GET /api/raw
List all raw course documents (limit 200).

### GET /api/raw/export
Export all raw course documents as JSON.

### GET /api/raw/:id
Get a specific raw course by ID.

### POST /api/raw/:id/rewrite
Rewrite course content using AI or fallback method.

**Request Body:**
```json
{
  "style": "string (optional)",
  "voiceSample": "string (optional)",
  "force": "boolean (optional)"
}
```

---

## Scrape Routes (`/api/scrape`)

### POST /api/scrape
Queue or process scraping jobs.

**Request Body:**
```json
{
  "links": [
    {
      "title": "string (optional)",
      "url": "string (required)"
    }
  ],
  "usePuppeteer": "boolean (optional)",
  "crawl": "boolean (optional)",
  "delayMs": "number (optional, default: 1000)",
  "randomize": "boolean (optional)",
  "maxPerSite": "number (optional, default: 25)",
  "processNow": "boolean (optional)"
}
```

---

## Ingest Routes (`/api/ingest`)

### POST /api/ingest
Ingest a lesson/course document.

**Request Body:**
```json
{
  "_id": "string (optional, for update)",
  "title": "string (optional)",
  "url": "string (optional)",
  "contentHtml": "string (optional)",
  "text": "string (optional)",
  "sections": "array (optional)",
  "metadata": "object (optional)"
}
```

---

## Authentication

Most endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained via `/api/auth/login` or `/api/auth/register`.

---

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error
