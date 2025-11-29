CREATE DATABASE IF NOT EXISTS project_tracker_mysql_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE project_tracker_mysql_db;

-- USERS TABLE
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid CHAR(36) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE COLLATE utf8mb4_general_ci,
  password VARCHAR(255) NOT NULL,
  role ENUM(
    'Admin',
    'Project Manager',
    'Software Architect',
    'Frontend Developer',
    'Backend Developer',
    'Full-Stack Developer',
    'DevOps Engineer',
    'QA Engineer',
    'QC Engineer',
    'UX/UI Designer',
    'Business Analyst',
    'Database Administrator',
    'Technical Writer',
    'Support Engineer'
  ) DEFAULT 'Frontend Developer',
  is_deleted BOOLEAN DEFAULT FALSE,
  version INT DEFAULT 1,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE INDEX idx_users_is_deleted ON users(is_deleted);

-- REFRESH TOKENS TABLE
CREATE TABLE refresh_tokens (
  id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- PROJECTS TABLE
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid CHAR(36) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('PLANNING', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'PLANNING',
  owner_id INT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  version INT DEFAULT 1,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_projects_owner FOREIGN KEY (owner_id)
    REFERENCES users(id) ON DELETE SET NULL,
  FULLTEXT idx_projects_name_description (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_is_deleted ON projects(is_deleted);

-- PROJECT MEMBERS TABLE
CREATE TABLE project_members (
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  role ENUM('VIEWER', 'EDITOR', 'OWNER') DEFAULT 'VIEWER',
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (project_id, user_id),
  CONSTRAINT fk_project_members_project FOREIGN KEY (project_id)
    REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_members_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_is_deleted ON project_members(is_deleted);

-- PERMISSIONS TABLE
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  resource_type ENUM('PROJECT', 'TASK', 'COMMENT') NOT NULL,
  resource_id INT NOT NULL,
  permission ENUM('READ', 'WRITE', 'DELETE', 'ADMIN') NOT NULL,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_permissions_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_permissions_user_resource (user_id, resource_type, resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- TASKS TABLE
CREATE TABLE tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid CHAR(36) NOT NULL UNIQUE,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('TODO', 'IN_PROGRESS', 'DONE') DEFAULT 'TODO',
  priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
  due_date DATE,
  project_id INT NOT NULL,
  assigned_to INT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  version INT DEFAULT 1,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_tasks_project FOREIGN KEY (project_id)
    REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_assigned_to FOREIGN KEY (assigned_to)
    REFERENCES users(id) ON DELETE SET NULL,
  FULLTEXT idx_tasks_title_description (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_is_deleted ON tasks(is_deleted);

-- TAGS TABLE
CREATE TABLE tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  title VARCHAR(255),
  type VARCHAR(255),
  category VARCHAR(255),
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FULLTEXT idx_tags_name_description (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TASK_TAGS TABLE
CREATE TABLE task_tags (
  task_id INT NOT NULL,
  tag_id INT NOT NULL,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (task_id, tag_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- COMMENTS TABLE
CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid CHAR(36) NOT NULL UNIQUE,
  project_id INT NULL,                      
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  version INT DEFAULT 1,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_comments_project FOREIGN KEY (project_id)
    REFERENCES projects(id) ON DELETE CASCADE,   
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  FULLTEXT idx_comments_content (content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create indices for the updated table
CREATE INDEX idx_comments_project_id ON comments(project_id);    
CREATE INDEX idx_comments_user_id ON comments(user_id);          
CREATE INDEX idx_comments_is_deleted ON comments(is_deleted);    

-- TASK_LIKES TABLE
CREATE TABLE task_likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  task_id INT NOT NULL,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_task_likes_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_likes_task FOREIGN KEY (task_id)
    REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE (user_id, task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE INDEX idx_task_likes_user_id ON task_likes(user_id);

-- COMMENT_LIKES TABLE
CREATE TABLE comment_likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  comment_id INT NOT NULL,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_comment_likes_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_likes_comment FOREIGN KEY (comment_id)
    REFERENCES comments(id) ON DELETE CASCADE,
  UNIQUE (user_id, comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);

-- PROJECT_LIKES TABLE
CREATE TABLE project_likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  project_id INT NOT NULL,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_project_likes_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_likes_project FOREIGN KEY (project_id)
    REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE (user_id, project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE INDEX idx_project_likes_user_id ON project_likes(user_id);

-- ACTIVITY_LOGS TABLE
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  target_user_id INT,
  project_id INT,
  task_id INT,
  action VARCHAR(255) NULL,
  type ENUM(
    'USER_CREATED',
    'USER_UPDATED',
    'USER_DELETED',
    'PROJECT_CREATED',
    'PROJECT_UPDATED',
    'PROJECT_DELETED',
    'TASK_CREATED',
    'TASK_UPDATED',
    'TASK_DELETED'
  ) NOT NULL,
  metadata JSON DEFAULT NULL,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_logs_target_user FOREIGN KEY (target_user_id)
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_activity_logs_project FOREIGN KEY (project_id)
    REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_logs_task FOREIGN KEY (task_id)
    REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE INDEX idx_activity_logs_type ON activity_logs(type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_target_user_id ON activity_logs(target_user_id);
CREATE INDEX idx_activity_logs_user_created_at ON activity_logs(user_id, created_at);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE INDEX idx_notifications_user_id_is_read ON notifications(user_id, is_read);

-- ============================================
-- TRIGGERS FOR AUTOMATED OPERATIONS
-- ============================================

-- UUID Generation Triggers
-- Automatically generate UUID for users on INSERT
CREATE TRIGGER trg_users_before_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  IF NEW.uuid IS NULL OR NEW.uuid = '' THEN
    SET NEW.uuid = UUID();
  END IF;
END;

-- Automatically generate UUID for projects on INSERT
CREATE TRIGGER trg_projects_before_insert
BEFORE INSERT ON projects
FOR EACH ROW
BEGIN
  IF NEW.uuid IS NULL OR NEW.uuid = '' THEN
    SET NEW.uuid = UUID();
  END IF;
END;

-- Automatically generate UUID for tasks on INSERT
CREATE TRIGGER trg_tasks_before_insert
BEFORE INSERT ON tasks
FOR EACH ROW
BEGIN
  IF NEW.uuid IS NULL OR NEW.uuid = '' THEN
    SET NEW.uuid = UUID();
  END IF;
END;

-- Automatically generate UUID for comments on INSERT
CREATE TRIGGER trg_comments_before_insert
BEFORE INSERT ON comments
FOR EACH ROW
BEGIN
  IF NEW.uuid IS NULL OR NEW.uuid = '' THEN
    SET NEW.uuid = UUID();
  END IF;
END;

-- Version Increment Triggers (Optimistic Locking)
-- Automatically increment version on UPDATE for users
CREATE TRIGGER trg_users_before_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  IF OLD.version IS NOT NULL THEN
    SET NEW.version = OLD.version + 1;
  END IF;
END;

-- Automatically increment version on UPDATE for projects
CREATE TRIGGER trg_projects_before_update
BEFORE UPDATE ON projects
FOR EACH ROW
BEGIN
  IF OLD.version IS NOT NULL THEN
    SET NEW.version = OLD.version + 1;
  END IF;
END;

-- Automatically increment version on UPDATE for tasks
CREATE TRIGGER trg_tasks_before_update
BEFORE UPDATE ON tasks
FOR EACH ROW
BEGIN
  IF OLD.version IS NOT NULL THEN
    SET NEW.version = OLD.version + 1;
  END IF;
END;

-- Automatically increment version on UPDATE for comments
CREATE TRIGGER trg_comments_before_update
BEFORE UPDATE ON comments
FOR EACH ROW
BEGIN
  IF OLD.version IS NOT NULL THEN
    SET NEW.version = OLD.version + 1;
  END IF;
END;

-- Soft Delete Cascade Triggers
-- When a project is soft deleted, soft delete related tasks
CREATE TRIGGER trg_projects_after_soft_delete
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
  IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
    UPDATE tasks SET is_deleted = TRUE WHERE project_id = NEW.id AND is_deleted = FALSE;
    UPDATE project_members SET is_deleted = TRUE WHERE project_id = NEW.id AND is_deleted = FALSE;
  END IF;
END;

-- Comments are now project-level, not task-level
-- When a project is deleted, comments are automatically deleted via CASCADE foreign key
-- No trigger needed for task deletion since comments belong to projects

-- Activity Log Triggers
-- Log user creation
CREATE TRIGGER trg_users_after_insert_log
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO activity_logs (user_id, type, metadata, created_at)
  VALUES (NEW.id, 'USER_CREATED', JSON_OBJECT('uuid', NEW.uuid, 'email', NEW.email, 'role', NEW.role), NOW(3));
END;

-- Log user updates
CREATE TRIGGER trg_users_after_update_log
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
    INSERT INTO activity_logs (user_id, type, metadata, created_at)
    VALUES (NEW.id, 'USER_DELETED', JSON_OBJECT('uuid', NEW.uuid, 'email', NEW.email), NOW(3));
  ELSEIF NEW.is_deleted = FALSE THEN
    INSERT INTO activity_logs (user_id, type, metadata, created_at)
    VALUES (NEW.id, 'USER_UPDATED', JSON_OBJECT('uuid', NEW.uuid, 'version', NEW.version), NOW(3));
  END IF;
END;

-- Log project creation
CREATE TRIGGER trg_projects_after_insert_log
AFTER INSERT ON projects
FOR EACH ROW
BEGIN
  INSERT INTO activity_logs (user_id, project_id, type, metadata, created_at)
  VALUES (COALESCE(NEW.owner_id, 1), NEW.id, 'PROJECT_CREATED', JSON_OBJECT('uuid', NEW.uuid, 'name', NEW.name, 'status', NEW.status), NOW(3));
END;

-- Log project updates
CREATE TRIGGER trg_projects_after_update_log
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
  IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
    INSERT INTO activity_logs (user_id, project_id, type, metadata, created_at)
    VALUES (COALESCE(NEW.owner_id, 1), NEW.id, 'PROJECT_DELETED', JSON_OBJECT('uuid', NEW.uuid), NOW(3));
  ELSEIF NEW.is_deleted = FALSE THEN
    INSERT INTO activity_logs (user_id, project_id, type, metadata, created_at)
    VALUES (COALESCE(NEW.owner_id, 1), NEW.id, 'PROJECT_UPDATED', JSON_OBJECT('uuid', NEW.uuid, 'version', NEW.version), NOW(3));
  END IF;
END;

-- Log task creation
CREATE TRIGGER trg_tasks_after_insert_log
AFTER INSERT ON tasks
FOR EACH ROW
BEGIN
  INSERT INTO activity_logs (user_id, target_user_id, project_id, task_id, type, metadata, created_at)
  VALUES (
    COALESCE(NEW.assigned_to, 1),
    NEW.assigned_to,
    NEW.project_id,
    NEW.id,
    'TASK_CREATED',
    JSON_OBJECT('uuid', NEW.uuid, 'title', NEW.title, 'status', NEW.status),
    NOW(3)
  );
END;

-- Log task updates
CREATE TRIGGER trg_tasks_after_update_log
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
  IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
    INSERT INTO activity_logs (user_id, target_user_id, project_id, task_id, type, metadata, created_at)
    VALUES (
      COALESCE(NEW.assigned_to, 1),
      NEW.assigned_to,
      NEW.project_id,
      NEW.id,
      'TASK_DELETED',
      JSON_OBJECT('uuid', NEW.uuid),
      NOW(3)
    );
  ELSEIF NEW.is_deleted = FALSE THEN
    INSERT INTO activity_logs (user_id, target_user_id, project_id, task_id, type, metadata, created_at)
    VALUES (
      COALESCE(NEW.assigned_to, 1),
      NEW.assigned_to,
      NEW.project_id,
      NEW.id,
      'TASK_UPDATED',
      JSON_OBJECT('uuid', NEW.uuid, 'version', NEW.version),
      NOW(3)
    );
  END IF;
END;