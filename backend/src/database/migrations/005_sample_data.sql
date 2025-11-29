-- =========================
-- SAMPLE DATA FOR PROJECT TRACKER
-- =========================
-- Author: Thang Truong
-- Date: 2025-01-27
-- Note: This script uses INSERT IGNORE to skip duplicates if data already exists
-- Foreign keys use subqueries to find IDs based on unique fields
-- This data is completely different from 001, 002, 003, and 004
-- Project owners must have 'Admin' or 'Project Manager' role
-- Each task assigned_to must be a project member, and one member per project has no tasks

USE project_tracker_mysql_db;

-- =========================
-- USERS (5 users - different from 001, 002, 003, and 004)
-- =========================
INSERT IGNORE INTO users (uuid, first_name, last_name, email, password, role) VALUES
(UUID(), 'Patricia', 'White', 'patricia.white@example.com', '$2b$10$example_hash_here', 'Admin'),
(UUID(), 'Matthew', 'Harris', 'matthew.harris@example.com', '$2b$10$example_hash_here', 'Frontend Developer'),
(UUID(), 'Elizabeth', 'Clark', 'elizabeth.clark@example.com', '$2b$10$example_hash_here', 'Backend Developer'),
(UUID(), 'Anthony', 'Lewis', 'anthony.lewis@example.com', '$2b$10$example_hash_here', 'QA Engineer'),
(UUID(), 'Jessica', 'Walker', 'jessica.walker@example.com', '$2b$10$example_hash_here', 'Project Manager');

-- =========================
-- TAGS (20 tags - completely different from 001, 002, 003, and 004)
-- =========================
INSERT IGNORE INTO tags (name, description, title, type, category) VALUES
('version-control', 'Version control systems', 'Version Control', 'TECH', 'DEVOPS'),
('ci-cd', 'CI/CD pipelines', 'CI/CD', 'TECH', 'DEVOPS'),
('testing-framework', 'Testing frameworks', 'Testing Framework', 'TECH', 'QA'),
('code-quality', 'Code quality tools', 'Code Quality', 'TECH', 'QUALITY'),
('documentation-tool', 'Documentation tools', 'Documentation Tool', 'TECH', 'DOC'),
('api-documentation', 'API documentation', 'API Documentation', 'TECH', 'DOC'),
('sdk', 'Software development kits', 'SDK', 'TECH', 'DEVELOPMENT'),
('library', 'Code libraries', 'Library', 'TECH', 'DEVELOPMENT'),
('framework', 'Development frameworks', 'Framework', 'TECH', 'DEVELOPMENT'),
('template', 'Code templates', 'Template', 'TECH', 'DEVELOPMENT'),
('configuration', 'Configuration management', 'Configuration', 'TECH', 'OPS'),
('environment', 'Environment setup', 'Environment', 'TECH', 'OPS'),
('localization', 'Localization and i18n', 'Localization', 'TECH', 'I18N'),
('accessibility', 'Accessibility features', 'Accessibility', 'TECH', 'UX'),
('responsive', 'Responsive design', 'Responsive', 'TECH', 'UI'),
('mobile-first', 'Mobile-first design', 'Mobile First', 'TECH', 'UI'),
('progressive-web-app', 'Progressive web apps', 'PWA', 'TECH', 'WEB'),
('single-page-app', 'Single page applications', 'SPA', 'TECH', 'WEB'),
('serverless', 'Serverless architecture', 'Serverless', 'TECH', 'ARCHITECTURE'),
('edge-computing', 'Edge computing', 'Edge Computing', 'TECH', 'INFRASTRUCTURE');

-- =========================
-- PROJECTS (5 projects - different from 001, 002, 003, and 004)
-- =========================
INSERT IGNORE INTO projects (uuid, name, description, status, owner_id) VALUES
(UUID(), 'Travel Booking Platform', 'Build comprehensive travel booking system with flights and hotels', 'IN_PROGRESS', (SELECT id FROM users WHERE email = 'patricia.white@example.com' LIMIT 1)),
(UUID(), 'Real Estate Marketplace', 'Develop real estate marketplace for property listings', 'PLANNING', (SELECT id FROM users WHERE email = 'patricia.white@example.com' LIMIT 1)),
(UUID(), 'Healthcare Appointment System', 'Create healthcare appointment scheduling and management', 'IN_PROGRESS', (SELECT id FROM users WHERE email = 'jessica.walker@example.com' LIMIT 1)),
(UUID(), 'Event Management Platform', 'Build event management and ticketing platform', 'COMPLETED', (SELECT id FROM users WHERE email = 'jessica.walker@example.com' LIMIT 1)),
(UUID(), 'Job Portal', 'Develop job portal with resume matching and applications', 'PLANNING', (SELECT id FROM users WHERE email = 'jessica.walker@example.com' LIMIT 1));

-- =========================
-- PROJECT_MEMBERS (3 members per project)
-- =========================
INSERT IGNORE INTO project_members (project_id, user_id, role) VALUES
-- Project 1: users patricia.white, matthew.harris, elizabeth.clark
((SELECT id FROM projects WHERE name = 'Travel Booking Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'patricia.white@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Travel Booking Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Travel Booking Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'elizabeth.clark@example.com' LIMIT 1), 'VIEWER'),
-- Project 2: users patricia.white, elizabeth.clark, anthony.lewis
((SELECT id FROM projects WHERE name = 'Real Estate Marketplace' LIMIT 1), (SELECT id FROM users WHERE email = 'patricia.white@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Real Estate Marketplace' LIMIT 1), (SELECT id FROM users WHERE email = 'elizabeth.clark@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Real Estate Marketplace' LIMIT 1), (SELECT id FROM users WHERE email = 'anthony.lewis@example.com' LIMIT 1), 'VIEWER'),
-- Project 3: users jessica.walker, matthew.harris, elizabeth.clark
((SELECT id FROM projects WHERE name = 'Healthcare Appointment System' LIMIT 1), (SELECT id FROM users WHERE email = 'jessica.walker@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Healthcare Appointment System' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Healthcare Appointment System' LIMIT 1), (SELECT id FROM users WHERE email = 'elizabeth.clark@example.com' LIMIT 1), 'VIEWER'),
-- Project 4: users jessica.walker, anthony.lewis, matthew.harris
((SELECT id FROM projects WHERE name = 'Event Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'jessica.walker@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Event Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'anthony.lewis@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Event Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1), 'VIEWER'),
-- Project 5: users jessica.walker, matthew.harris, elizabeth.clark
((SELECT id FROM projects WHERE name = 'Job Portal' LIMIT 1), (SELECT id FROM users WHERE email = 'jessica.walker@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Job Portal' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Job Portal' LIMIT 1), (SELECT id FROM users WHERE email = 'elizabeth.clark@example.com' LIMIT 1), 'VIEWER');

-- =========================
-- TASKS (5 tasks per project = 25 tasks)
-- Note: Each task assigned_to must be a project member, and one member per project has no tasks
-- =========================
INSERT IGNORE INTO tasks (uuid, title, description, status, priority, due_date, project_id, assigned_to) VALUES
-- Project 1 tasks (members: patricia.white, matthew.harris, elizabeth.clark; patricia.white has no tasks)
(UUID(), 'Flight Search Engine', 'Build flight search and comparison engine', 'IN_PROGRESS', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 7 DAY)), (SELECT id FROM projects WHERE name = 'Travel Booking Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1)),
(UUID(), 'Hotel Booking System', 'Implement hotel search and reservation system', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 14 DAY)), (SELECT id FROM projects WHERE name = 'Travel Booking Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'elizabeth.clark@example.com' LIMIT 1)),
(UUID(), 'Payment Gateway', 'Integrate payment processing for bookings', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 21 DAY)), (SELECT id FROM projects WHERE name = 'Travel Booking Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1)),
(UUID(), 'Booking Confirmation', 'Create booking confirmation and email system', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 28 DAY)), (SELECT id FROM projects WHERE name = 'Travel Booking Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'elizabeth.clark@example.com' LIMIT 1)),
(UUID(), 'User Dashboard', 'Build user dashboard for booking management', 'DONE', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL -5 DAY)), (SELECT id FROM projects WHERE name = 'Travel Booking Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1)),
-- Project 2 tasks (members: patricia.white, elizabeth.clark, anthony.lewis; patricia.white has no tasks)
(UUID(), 'Property Listing System', 'Create property listing and search functionality', 'IN_PROGRESS', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 10 DAY)), (SELECT id FROM projects WHERE name = 'Real Estate Marketplace' LIMIT 1), (SELECT id FROM users WHERE email = 'elizabeth.clark@example.com' LIMIT 1)),
(UUID(), 'Image Gallery', 'Build image gallery for property photos', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 17 DAY)), (SELECT id FROM projects WHERE name = 'Real Estate Marketplace' LIMIT 1), (SELECT id FROM users WHERE email = 'anthony.lewis@example.com' LIMIT 1)),
(UUID(), 'Map Integration', 'Integrate maps for property locations', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 24 DAY)), (SELECT id FROM projects WHERE name = 'Real Estate Marketplace' LIMIT 1), (SELECT id FROM users WHERE email = 'elizabeth.clark@example.com' LIMIT 1)),
(UUID(), 'Contact Agent', 'Implement contact agent functionality', 'TODO', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 31 DAY)), (SELECT id FROM projects WHERE name = 'Real Estate Marketplace' LIMIT 1), (SELECT id FROM users WHERE email = 'anthony.lewis@example.com' LIMIT 1)),
(UUID(), 'Property Filters', 'Build advanced property search filters', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 38 DAY)), (SELECT id FROM projects WHERE name = 'Real Estate Marketplace' LIMIT 1), (SELECT id FROM users WHERE email = 'elizabeth.clark@example.com' LIMIT 1)),
-- Project 3 tasks (members: jessica.walker, matthew.harris, elizabeth.clark; elizabeth.clark has no tasks)
(UUID(), 'Appointment Scheduler', 'Build appointment scheduling system', 'IN_PROGRESS', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 8 DAY)), (SELECT id FROM projects WHERE name = 'Healthcare Appointment System' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1)),
(UUID(), 'Patient Portal', 'Create patient portal for medical records', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 15 DAY)), (SELECT id FROM projects WHERE name = 'Healthcare Appointment System' LIMIT 1), (SELECT id FROM users WHERE email = 'jessica.walker@example.com' LIMIT 1)),
(UUID(), 'Reminder System', 'Implement appointment reminder notifications', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 22 DAY)), (SELECT id FROM projects WHERE name = 'Healthcare Appointment System' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1)),
(UUID(), 'Doctor Availability', 'Build doctor availability management system', 'TODO', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 29 DAY)), (SELECT id FROM projects WHERE name = 'Healthcare Appointment System' LIMIT 1), (SELECT id FROM users WHERE email = 'jessica.walker@example.com' LIMIT 1)),
(UUID(), 'Medical Records', 'Implement secure medical records storage', 'DONE', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL -3 DAY)), (SELECT id FROM projects WHERE name = 'Healthcare Appointment System' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1)),
-- Project 4 tasks (members: jessica.walker, anthony.lewis, matthew.harris; matthew.harris has no tasks)
(UUID(), 'Event Creation Tool', 'Build event creation and management tool', 'DONE', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL -10 DAY)), (SELECT id FROM projects WHERE name = 'Event Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'anthony.lewis@example.com' LIMIT 1)),
(UUID(), 'Ticket Sales System', 'Implement ticket sales and processing', 'DONE', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL -7 DAY)), (SELECT id FROM projects WHERE name = 'Event Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'jessica.walker@example.com' LIMIT 1)),
(UUID(), 'Event Discovery', 'Create event discovery and search features', 'DONE', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL -4 DAY)), (SELECT id FROM projects WHERE name = 'Event Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'anthony.lewis@example.com' LIMIT 1)),
(UUID(), 'QR Code Tickets', 'Implement QR code ticket generation', 'DONE', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL -1 DAY)), (SELECT id FROM projects WHERE name = 'Event Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'jessica.walker@example.com' LIMIT 1)),
(UUID(), 'Event Analytics', 'Build analytics dashboard for event organizers', 'DONE', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 2 DAY)), (SELECT id FROM projects WHERE name = 'Event Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'anthony.lewis@example.com' LIMIT 1)),
-- Project 5 tasks (members: jessica.walker, matthew.harris, elizabeth.clark; jessica.walker has no tasks)
(UUID(), 'Job Posting System', 'Create job posting and management system', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 12 DAY)), (SELECT id FROM projects WHERE name = 'Job Portal' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1)),
(UUID(), 'Resume Builder', 'Build resume creation and editing tool', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 19 DAY)), (SELECT id FROM projects WHERE name = 'Job Portal' LIMIT 1), (SELECT id FROM users WHERE email = 'elizabeth.clark@example.com' LIMIT 1)),
(UUID(), 'Application Tracking', 'Implement job application tracking system', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 26 DAY)), (SELECT id FROM projects WHERE name = 'Job Portal' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1)),
(UUID(), 'Job Matching Algorithm', 'Create job matching algorithm for candidates', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 33 DAY)), (SELECT id FROM projects WHERE name = 'Job Portal' LIMIT 1), (SELECT id FROM users WHERE email = 'elizabeth.clark@example.com' LIMIT 1)),
(UUID(), 'Employer Dashboard', 'Build dashboard for employers and recruiters', 'TODO', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 40 DAY)), (SELECT id FROM projects WHERE name = 'Job Portal' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1));

-- =========================
-- COMMENTS (2-5 comments per project, from project members)
-- =========================
INSERT IGNORE INTO comments (uuid, project_id, user_id, content) VALUES
-- Project 1 comments (5 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Travel Booking Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'patricia.white@example.com' LIMIT 1), 'Flight search engine is fast and accurate. Great performance!'),
(UUID(), (SELECT id FROM projects WHERE name = 'Travel Booking Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1), 'Hotel booking system needs better filtering options.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Travel Booking Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'elizabeth.clark@example.com' LIMIT 1), 'Payment gateway integration is secure and reliable.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Travel Booking Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'patricia.white@example.com' LIMIT 1), 'Booking confirmation emails are being sent correctly.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Travel Booking Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1), 'User dashboard is intuitive and easy to navigate.'),
-- Project 2 comments (4 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Real Estate Marketplace' LIMIT 1), (SELECT id FROM users WHERE email = 'patricia.white@example.com' LIMIT 1), 'Property listing system is comprehensive. All features working well.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Real Estate Marketplace' LIMIT 1), (SELECT id FROM users WHERE email = 'elizabeth.clark@example.com' LIMIT 1), 'Image gallery loads quickly. Good optimization.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Real Estate Marketplace' LIMIT 1), (SELECT id FROM users WHERE email = 'anthony.lewis@example.com' LIMIT 1), 'Map integration shows accurate property locations.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Real Estate Marketplace' LIMIT 1), (SELECT id FROM users WHERE email = 'patricia.white@example.com' LIMIT 1), 'Contact agent feature is working smoothly.'),
-- Project 3 comments (3 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Healthcare Appointment System' LIMIT 1), (SELECT id FROM users WHERE email = 'patricia.white@example.com' LIMIT 1), 'Appointment scheduler is user-friendly. Patients find it easy to use.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Healthcare Appointment System' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1), 'Patient portal provides secure access to medical records.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Healthcare Appointment System' LIMIT 1), (SELECT id FROM users WHERE email = 'jessica.walker@example.com' LIMIT 1), 'Reminder system is reducing no-shows significantly.'),
-- Project 4 comments (5 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Event Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'patricia.white@example.com' LIMIT 1), 'Event creation tool is powerful and flexible. Organizers love it.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Event Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'anthony.lewis@example.com' LIMIT 1), 'Ticket sales system handles high traffic well. No issues reported.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Event Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'jessica.walker@example.com' LIMIT 1), 'Event discovery feature helps users find interesting events.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Event Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'anthony.lewis@example.com' LIMIT 1), 'QR code tickets are working perfectly. Entry process is smooth.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Event Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'patricia.white@example.com' LIMIT 1), 'Event analytics provide valuable insights for organizers.'),
-- Project 5 comments (2 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Job Portal' LIMIT 1), (SELECT id FROM users WHERE email = 'patricia.white@example.com' LIMIT 1), 'Job posting system should support multiple job types and categories.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Job Portal' LIMIT 1), (SELECT id FROM users WHERE email = 'matthew.harris@example.com' LIMIT 1), 'Resume builder needs to support multiple resume formats and templates.');

-- =========================
-- TASK_TAGS (1-5 tags per task - using new tag names)
-- =========================
INSERT IGNORE INTO task_tags (task_id, tag_id) VALUES
-- Project 1 tasks
((SELECT id FROM tasks WHERE title = 'Flight Search Engine' LIMIT 1), (SELECT id FROM tags WHERE name = 'search-engine' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Hotel Booking System' LIMIT 1), (SELECT id FROM tags WHERE name = 'rest' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Payment Gateway' LIMIT 1), (SELECT id FROM tags WHERE name = 'payment-processing' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Booking Confirmation' LIMIT 1), (SELECT id FROM tags WHERE name = 'email-service' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'User Dashboard' LIMIT 1), (SELECT id FROM tags WHERE name = 'single-page-app' LIMIT 1)),
-- Project 2 tasks
((SELECT id FROM tasks WHERE title = 'Property Listing System' LIMIT 1), (SELECT id FROM tags WHERE name = 'search-engine' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Image Gallery' LIMIT 1), (SELECT id FROM tags WHERE name = 'responsive' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Map Integration' LIMIT 1), (SELECT id FROM tags WHERE name = 'sdk' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Contact Agent' LIMIT 1), (SELECT id FROM tags WHERE name = 'email-service' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Property Filters' LIMIT 1), (SELECT id FROM tags WHERE name = 'framework' LIMIT 1)),
-- Project 3 tasks
((SELECT id FROM tasks WHERE title = 'Appointment Scheduler' LIMIT 1), (SELECT id FROM tags WHERE name = 'framework' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Patient Portal' LIMIT 1), (SELECT id FROM tags WHERE name = 'accessibility' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Reminder System' LIMIT 1), (SELECT id FROM tags WHERE name = 'sms-service' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Doctor Availability' LIMIT 1), (SELECT id FROM tags WHERE name = 'configuration' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Medical Records' LIMIT 1), (SELECT id FROM tags WHERE name = 'encryption' LIMIT 1)),
-- Project 4 tasks
((SELECT id FROM tasks WHERE title = 'Event Creation Tool' LIMIT 1), (SELECT id FROM tags WHERE name = 'template' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Ticket Sales System' LIMIT 1), (SELECT id FROM tags WHERE name = 'payment-processing' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Event Discovery' LIMIT 1), (SELECT id FROM tags WHERE name = 'search-engine' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'QR Code Tickets' LIMIT 1), (SELECT id FROM tags WHERE name = 'library' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Event Analytics' LIMIT 1), (SELECT id FROM tags WHERE name = 'metrics' LIMIT 1)),
-- Project 5 tasks
((SELECT id FROM tasks WHERE title = 'Job Posting System' LIMIT 1), (SELECT id FROM tags WHERE name = 'framework' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Resume Builder' LIMIT 1), (SELECT id FROM tags WHERE name = 'template' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Application Tracking' LIMIT 1), (SELECT id FROM tags WHERE name = 'workflow' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Job Matching Algorithm' LIMIT 1), (SELECT id FROM tags WHERE name = 'recommendation' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Employer Dashboard' LIMIT 1), (SELECT id FROM tags WHERE name = 'single-page-app' LIMIT 1));

-- =========================
-- SET AUTO_INCREMENT VALUES
-- =========================
SET @max_user_id = (SELECT COALESCE(MAX(id), 0) FROM users);
SET @max_tag_id = (SELECT COALESCE(MAX(id), 0) FROM tags);
SET @max_project_id = (SELECT COALESCE(MAX(id), 0) FROM projects);
SET @max_task_id = (SELECT COALESCE(MAX(id), 0) FROM tasks);
SET @max_comment_id = (SELECT COALESCE(MAX(id), 0) FROM comments);
SET @max_task_like_id = (SELECT COALESCE(MAX(id), 0) FROM task_likes);
SET @max_comment_like_id = (SELECT COALESCE(MAX(id), 0) FROM comment_likes);
SET @max_project_like_id = (SELECT COALESCE(MAX(id), 0) FROM project_likes);

SET @sql = CONCAT('ALTER TABLE users AUTO_INCREMENT = ', @max_user_id + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = CONCAT('ALTER TABLE tags AUTO_INCREMENT = ', @max_tag_id + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = CONCAT('ALTER TABLE projects AUTO_INCREMENT = ', @max_project_id + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = CONCAT('ALTER TABLE tasks AUTO_INCREMENT = ', @max_task_id + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = CONCAT('ALTER TABLE comments AUTO_INCREMENT = ', @max_comment_id + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = CONCAT('ALTER TABLE task_likes AUTO_INCREMENT = ', @max_task_like_id + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = CONCAT('ALTER TABLE comment_likes AUTO_INCREMENT = ', @max_comment_like_id + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = CONCAT('ALTER TABLE project_likes AUTO_INCREMENT = ', @max_project_like_id + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

