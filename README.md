# Project Tracker

A full-stack project tracking application with React frontend and GraphQL backend.

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Hook Form
- Apollo Client (GraphQL)

### Backend
- Node.js
- Express
- Apollo Server (GraphQL)
- MySQL
- TypeScript

## Project Structure

```
project_tracker/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── lib/       # Apollo Client configuration
│   │   ├── pages/     # React pages/components
│   │   └── ...
│   └── package.json
├── backend/           # GraphQL backend server
│   ├── src/
│   │   ├── db.ts      # Database connection
│   │   ├── schema.ts  # GraphQL schema
│   │   ├── resolvers.ts # GraphQL resolvers
│   │   └── ...
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root (or backend directory):
```env
# Backend Server Port
PORT=4000

# JWT Secret Key (generate a secure random string)
JWT_SECRET=your-secure-random-jwt-secret-key-change-in-production

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=project_tracker_mysql_db
```

**Note:** 
- Place the `.env` file either in the project root directory or the `backend` directory
- The migration script will automatically find it in either location
- If MySQL is on the default port (3306), you can omit `DB_PORT`

4. **Generate the Database and Tables:**

   The migration script will create the `project_tracker_mysql_db` database and all required tables.

   **Method 1: Using npm script (Recommended)**
   ```bash
   cd backend
   npm run migrate
   ```

   **Method 2: Using MySQL command line**
   ```bash
   mysql -u root -p < backend/src/database/migrations/001_create_projects_table.sql
   ```

   The migration will:
   - Create the database `project_tracker_mysql_db`
   - Create all 14 tables (users, projects, tasks, comments, etc.)
   - Set up all indexes, foreign keys, and triggers
   - Configure automatic UUID generation and versioning

   **Verify the migration:**
   ```bash
   mysql -u root -p -e "USE project_tracker_mysql_db; SHOW TABLES;"
   ```
   You should see all 14 tables listed.

5. Start the backend server:
```bash
npm run dev
```

The GraphQL server will be running at `http://localhost:4000/graphql`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be running at `http://localhost:3000`

### Quick Start (Single Command)

**To start both frontend and backend servers with one command:**

1. Install all dependencies (root, backend, and frontend):
```bash
npm run install:all
```

2. Start both servers simultaneously:
```bash
npm run dev
```

This will start:
- **Backend** on `http://localhost:4000` (GraphQL endpoint: `http://localhost:4000/graphql`)
- **Frontend** on `http://localhost:3000`

The output will be color-coded:
- Blue logs = Backend server
- Green logs = Frontend server

## Development

- Backend runs on port 4000
- Frontend runs on port 3000
- GraphQL endpoint: `http://localhost:4000/graphql`
- Use `npm run dev` from the root directory to start both servers

## Database Schema

The database `project_tracker_mysql_db` includes the following tables:

### Core Tables
- **users** - User accounts with roles and authentication
- **projects** - Project information and status
- **tasks** - Task management within projects
- **comments** - Comments on tasks
- **tags** - Tagging system for categorization

### Relationship Tables
- **project_members** - Project membership and roles
- **permissions** - Access control permissions
- **task_tags** - Many-to-many relationship between tasks and tags

### Interaction Tables
- **task_likes** - User likes on tasks
- **comment_likes** - User likes on comments
- **project_likes** - User likes on projects

### System Tables
- **refresh_tokens** - Authentication token management
- **activity_logs** - Audit trail for all operations
- **notifications** - User notifications

### Key Features
- **Auto-generated UUIDs** - All entities have unique UUIDs
- **Soft deletes** - Records are marked as deleted, not removed
- **Version tracking** - Optimistic locking via version numbers
- **Automatic audit logging** - All CRUD operations are logged
- **Full-text search** - Indexes on searchable fields

