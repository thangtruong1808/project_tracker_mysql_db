-- =========================
-- SAMPLE DATA FOR PROJECT TRACKER
-- =========================
-- Author: Thang Truong
-- Date: 2025-01-27
-- Note: This script uses INSERT IGNORE to skip duplicates if data already exists
-- Foreign keys use subqueries to find IDs based on unique fields
-- This data is completely different from 001 and 002
-- Project owners must have 'Admin' or 'Project Manager' role
-- Each task assigned_to must be a project member, and one member per project has no tasks

USE project_tracker_mysql_db;

-- =========================
-- USERS (5 users - different from 001 and 002)
-- =========================
INSERT IGNORE INTO users (uuid, first_name, last_name, email, password, role) VALUES
(UUID(), 'Emma', 'Martinez', 'emma.martinez@example.com', '$2b$10$example_hash_here', 'Admin'),
(UUID(), 'James', 'Wilson', 'james.wilson@example.com', '$2b$10$example_hash_here', 'Frontend Developer'),
(UUID(), 'Olivia', 'Taylor', 'olivia.taylor@example.com', '$2b$10$example_hash_here', 'Backend Developer'),
(UUID(), 'William', 'Moore', 'william.moore@example.com', '$2b$10$example_hash_here', 'QA Engineer'),
(UUID(), 'Sophia', 'Jackson', 'sophia.jackson@example.com', '$2b$10$example_hash_here', 'Project Manager');

-- =========================
-- TAGS (20 tags - completely different from 001 and 002)
-- =========================
INSERT IGNORE INTO tags (name, description, title, type, category) VALUES
('virtualization', 'Virtualization technologies', 'Virtualization', 'TECH', 'INFRASTRUCTURE'),
('containerization', 'Container technologies', 'Containerization', 'TECH', 'INFRASTRUCTURE'),
('orchestration', 'Container orchestration', 'Orchestration', 'TECH', 'OPS'),
('networking', 'Network configuration', 'Networking', 'TECH', 'NETWORK'),
('storage', 'Storage solutions', 'Storage', 'TECH', 'INFRASTRUCTURE'),
('backup', 'Backup and recovery', 'Backup', 'TECH', 'DATA'),
('disaster-recovery', 'Disaster recovery planning', 'Disaster Recovery', 'TECH', 'DATA'),
('encryption', 'Data encryption', 'Encryption', 'TECH', 'SECURITY'),
('authentication', 'Authentication systems', 'Authentication', 'TECH', 'SECURITY'),
('authorization', 'Authorization mechanisms', 'Authorization', 'TECH', 'SECURITY'),
('api-gateway', 'API gateway services', 'API Gateway', 'TECH', 'API'),
('service-mesh', 'Service mesh architecture', 'Service Mesh', 'TECH', 'ARCHITECTURE'),
('event-driven', 'Event-driven architecture', 'Event-Driven', 'TECH', 'ARCHITECTURE'),
('streaming', 'Data streaming', 'Streaming', 'TECH', 'DATA'),
('batch-processing', 'Batch data processing', 'Batch Processing', 'TECH', 'DATA'),
('real-time', 'Real-time systems', 'Real-Time', 'TECH', 'PERFORMANCE'),
('distributed', 'Distributed systems', 'Distributed', 'TECH', 'ARCHITECTURE'),
('fault-tolerance', 'Fault tolerance', 'Fault Tolerance', 'TECH', 'RELIABILITY'),
('high-availability', 'High availability systems', 'High Availability', 'TECH', 'RELIABILITY'),
('cost-optimization', 'Cost optimization', 'Cost Optimization', 'BUSINESS', 'COST');

-- =========================
-- PROJECTS (5 projects - different from 001 and 002)
-- =========================
INSERT IGNORE INTO projects (uuid, name, description, status, owner_id) VALUES
(UUID(), 'Enterprise Resource Planning', 'Build comprehensive ERP system for business management', 'IN_PROGRESS', (SELECT id FROM users WHERE email = 'emma.martinez@example.com' LIMIT 1)),
(UUID(), 'Customer Relationship Management', 'Develop CRM platform for customer management', 'PLANNING', (SELECT id FROM users WHERE email = 'emma.martinez@example.com' LIMIT 1)),
(UUID(), 'Supply Chain Management', 'Create SCM system for logistics and inventory', 'IN_PROGRESS', (SELECT id FROM users WHERE email = 'sophia.jackson@example.com' LIMIT 1)),
(UUID(), 'Human Resources System', 'Build HR management system with payroll', 'COMPLETED', (SELECT id FROM users WHERE email = 'sophia.jackson@example.com' LIMIT 1)),
(UUID(), 'Financial Management Platform', 'Develop financial management and accounting system', 'PLANNING', (SELECT id FROM users WHERE email = 'sophia.jackson@example.com' LIMIT 1));

-- =========================
-- PROJECT_MEMBERS (3 members per project)
-- =========================
INSERT IGNORE INTO project_members (project_id, user_id, role) VALUES
-- Project 1: users emma.martinez, james.wilson, olivia.taylor
((SELECT id FROM projects WHERE name = 'Enterprise Resource Planning' LIMIT 1), (SELECT id FROM users WHERE email = 'emma.martinez@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Enterprise Resource Planning' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Enterprise Resource Planning' LIMIT 1), (SELECT id FROM users WHERE email = 'olivia.taylor@example.com' LIMIT 1), 'VIEWER'),
-- Project 2: users emma.martinez, olivia.taylor, william.moore
((SELECT id FROM projects WHERE name = 'Customer Relationship Management' LIMIT 1), (SELECT id FROM users WHERE email = 'emma.martinez@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Customer Relationship Management' LIMIT 1), (SELECT id FROM users WHERE email = 'olivia.taylor@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Customer Relationship Management' LIMIT 1), (SELECT id FROM users WHERE email = 'william.moore@example.com' LIMIT 1), 'VIEWER'),
-- Project 3: users sophia.jackson, james.wilson, olivia.taylor
((SELECT id FROM projects WHERE name = 'Supply Chain Management' LIMIT 1), (SELECT id FROM users WHERE email = 'sophia.jackson@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Supply Chain Management' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Supply Chain Management' LIMIT 1), (SELECT id FROM users WHERE email = 'olivia.taylor@example.com' LIMIT 1), 'VIEWER'),
-- Project 4: users sophia.jackson, william.moore, james.wilson
((SELECT id FROM projects WHERE name = 'Human Resources System' LIMIT 1), (SELECT id FROM users WHERE email = 'sophia.jackson@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Human Resources System' LIMIT 1), (SELECT id FROM users WHERE email = 'william.moore@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Human Resources System' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1), 'VIEWER'),
-- Project 5: users emma.martinez, james.wilson, olivia.taylor
((SELECT id FROM projects WHERE name = 'Financial Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'emma.martinez@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Financial Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Financial Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'olivia.taylor@example.com' LIMIT 1), 'VIEWER');

-- =========================
-- TASKS (5 tasks per project = 25 tasks)
-- Note: Each task assigned_to must be a project member, and one member per project has no tasks
-- =========================
INSERT IGNORE INTO tasks (uuid, title, description, status, priority, due_date, project_id, assigned_to) VALUES
-- Project 1 tasks (members: emma.martinez, james.wilson, olivia.taylor; emma.martinez has no tasks)
(UUID(), 'Design ERP Modules', 'Create design for all ERP modules and workflows', 'IN_PROGRESS', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 7 DAY)), (SELECT id FROM projects WHERE name = 'Enterprise Resource Planning' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1)),
(UUID(), 'Implement Inventory Management', 'Build inventory tracking and management system', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 14 DAY)), (SELECT id FROM projects WHERE name = 'Enterprise Resource Planning' LIMIT 1), (SELECT id FROM users WHERE email = 'olivia.taylor@example.com' LIMIT 1)),
(UUID(), 'Build Reporting Dashboard', 'Create comprehensive reporting and analytics dashboard', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 21 DAY)), (SELECT id FROM projects WHERE name = 'Enterprise Resource Planning' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1)),
(UUID(), 'Setup Database Schema', 'Design and implement database schema for ERP', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 28 DAY)), (SELECT id FROM projects WHERE name = 'Enterprise Resource Planning' LIMIT 1), (SELECT id FROM users WHERE email = 'olivia.taylor@example.com' LIMIT 1)),
(UUID(), 'User Access Control', 'Implement role-based access control system', 'DONE', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL -5 DAY)), (SELECT id FROM projects WHERE name = 'Enterprise Resource Planning' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1)),
-- Project 2 tasks (members: emma.martinez, olivia.taylor, william.moore; emma.martinez has no tasks)
(UUID(), 'Customer Database Design', 'Design customer database and data model', 'IN_PROGRESS', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 10 DAY)), (SELECT id FROM projects WHERE name = 'Customer Relationship Management' LIMIT 1), (SELECT id FROM users WHERE email = 'olivia.taylor@example.com' LIMIT 1)),
(UUID(), 'Contact Management System', 'Build contact management and tracking features', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 17 DAY)), (SELECT id FROM projects WHERE name = 'Customer Relationship Management' LIMIT 1), (SELECT id FROM users WHERE email = 'william.moore@example.com' LIMIT 1)),
(UUID(), 'Sales Pipeline Tracking', 'Implement sales pipeline visualization and tracking', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 24 DAY)), (SELECT id FROM projects WHERE name = 'Customer Relationship Management' LIMIT 1), (SELECT id FROM users WHERE email = 'olivia.taylor@example.com' LIMIT 1)),
(UUID(), 'Email Integration', 'Integrate email system for customer communication', 'TODO', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 31 DAY)), (SELECT id FROM projects WHERE name = 'Customer Relationship Management' LIMIT 1), (SELECT id FROM users WHERE email = 'william.moore@example.com' LIMIT 1)),
(UUID(), 'Customer Analytics', 'Build analytics for customer behavior and insights', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 38 DAY)), (SELECT id FROM projects WHERE name = 'Customer Relationship Management' LIMIT 1), (SELECT id FROM users WHERE email = 'olivia.taylor@example.com' LIMIT 1)),
-- Project 3 tasks (members: sophia.jackson, james.wilson, olivia.taylor; olivia.taylor has no tasks)
(UUID(), 'Warehouse Management', 'Create warehouse management and tracking system', 'IN_PROGRESS', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 8 DAY)), (SELECT id FROM projects WHERE name = 'Supply Chain Management' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1)),
(UUID(), 'Shipping Integration', 'Integrate with shipping carriers and APIs', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 15 DAY)), (SELECT id FROM projects WHERE name = 'Supply Chain Management' LIMIT 1), (SELECT id FROM users WHERE email = 'sophia.jackson@example.com' LIMIT 1)),
(UUID(), 'Inventory Forecasting', 'Implement inventory forecasting algorithms', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 22 DAY)), (SELECT id FROM projects WHERE name = 'Supply Chain Management' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1)),
(UUID(), 'Supplier Management', 'Build supplier relationship management system', 'TODO', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 29 DAY)), (SELECT id FROM projects WHERE name = 'Supply Chain Management' LIMIT 1), (SELECT id FROM users WHERE email = 'sophia.jackson@example.com' LIMIT 1)),
(UUID(), 'Route Optimization', 'Implement route optimization for deliveries', 'DONE', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL -3 DAY)), (SELECT id FROM projects WHERE name = 'Supply Chain Management' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1)),
-- Project 4 tasks (members: sophia.jackson, william.moore, james.wilson; james.wilson has no tasks)
(UUID(), 'Employee Database', 'Create comprehensive employee database system', 'DONE', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL -10 DAY)), (SELECT id FROM projects WHERE name = 'Human Resources System' LIMIT 1), (SELECT id FROM users WHERE email = 'william.moore@example.com' LIMIT 1)),
(UUID(), 'Payroll Processing', 'Implement automated payroll processing system', 'DONE', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL -7 DAY)), (SELECT id FROM projects WHERE name = 'Human Resources System' LIMIT 1), (SELECT id FROM users WHERE email = 'sophia.jackson@example.com' LIMIT 1)),
(UUID(), 'Attendance Tracking', 'Build attendance and time tracking system', 'DONE', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL -4 DAY)), (SELECT id FROM projects WHERE name = 'Human Resources System' LIMIT 1), (SELECT id FROM users WHERE email = 'william.moore@example.com' LIMIT 1)),
(UUID(), 'Performance Reviews', 'Create performance review and evaluation system', 'DONE', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL -1 DAY)), (SELECT id FROM projects WHERE name = 'Human Resources System' LIMIT 1), (SELECT id FROM users WHERE email = 'sophia.jackson@example.com' LIMIT 1)),
(UUID(), 'Benefits Management', 'Implement employee benefits management', 'DONE', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 2 DAY)), (SELECT id FROM projects WHERE name = 'Human Resources System' LIMIT 1), (SELECT id FROM users WHERE email = 'william.moore@example.com' LIMIT 1)),
-- Project 5 tasks (members: sophia.jackson, james.wilson, olivia.taylor; sophia.jackson has no tasks)
(UUID(), 'Accounting Module', 'Build core accounting and bookkeeping module', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 12 DAY)), (SELECT id FROM projects WHERE name = 'Financial Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1)),
(UUID(), 'Invoice Management', 'Create invoice generation and tracking system', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 19 DAY)), (SELECT id FROM projects WHERE name = 'Financial Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'olivia.taylor@example.com' LIMIT 1)),
(UUID(), 'Financial Reporting', 'Implement financial reports and statements', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 26 DAY)), (SELECT id FROM projects WHERE name = 'Financial Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1)),
(UUID(), 'Tax Calculation', 'Build automated tax calculation system', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 33 DAY)), (SELECT id FROM projects WHERE name = 'Financial Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'olivia.taylor@example.com' LIMIT 1)),
(UUID(), 'Budget Planning', 'Create budget planning and tracking tools', 'TODO', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 40 DAY)), (SELECT id FROM projects WHERE name = 'Financial Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1));

-- =========================
-- COMMENTS (2-5 comments per project, from project members)
-- =========================
INSERT IGNORE INTO comments (uuid, project_id, user_id, content) VALUES
-- Project 1 comments (5 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Enterprise Resource Planning' LIMIT 1), (SELECT id FROM users WHERE email = 'emma.martinez@example.com' LIMIT 1), 'ERP module design is comprehensive. We should prioritize core modules first.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Enterprise Resource Planning' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1), 'Inventory management needs real-time updates for accurate tracking.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Enterprise Resource Planning' LIMIT 1), (SELECT id FROM users WHERE email = 'olivia.taylor@example.com' LIMIT 1), 'Reporting dashboard should support custom report generation.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Enterprise Resource Planning' LIMIT 1), (SELECT id FROM users WHERE email = 'emma.martinez@example.com' LIMIT 1), 'Database schema design looks solid. Good normalization practices.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Enterprise Resource Planning' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1), 'Access control implementation is complete. Security is properly enforced.'),
-- Project 2 comments (4 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Customer Relationship Management' LIMIT 1), (SELECT id FROM users WHERE email = 'emma.martinez@example.com' LIMIT 1), 'Customer database design should support multiple contact methods.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Customer Relationship Management' LIMIT 1), (SELECT id FROM users WHERE email = 'olivia.taylor@example.com' LIMIT 1), 'Contact management system is user-friendly. Great UX design!'),
(UUID(), (SELECT id FROM projects WHERE name = 'Customer Relationship Management' LIMIT 1), (SELECT id FROM users WHERE email = 'william.moore@example.com' LIMIT 1), 'Sales pipeline visualization is clear and intuitive.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Customer Relationship Management' LIMIT 1), (SELECT id FROM users WHERE email = 'emma.martinez@example.com' LIMIT 1), 'Email integration will improve customer communication significantly.'),
-- Project 3 comments (3 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Supply Chain Management' LIMIT 1), (SELECT id FROM users WHERE email = 'emma.martinez@example.com' LIMIT 1), 'Warehouse management system is handling high volume efficiently.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Supply Chain Management' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1), 'Shipping integration with multiple carriers is working well.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Supply Chain Management' LIMIT 1), (SELECT id FROM users WHERE email = 'sophia.jackson@example.com' LIMIT 1), 'Inventory forecasting accuracy is improving with more data.'),
-- Project 4 comments (5 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Human Resources System' LIMIT 1), (SELECT id FROM users WHERE email = 'emma.martinez@example.com' LIMIT 1), 'Employee database is comprehensive and well-organized.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Human Resources System' LIMIT 1), (SELECT id FROM users WHERE email = 'william.moore@example.com' LIMIT 1), 'Payroll processing is accurate and automated. No manual errors.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Human Resources System' LIMIT 1), (SELECT id FROM users WHERE email = 'sophia.jackson@example.com' LIMIT 1), 'Attendance tracking is working perfectly. Real-time updates are great.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Human Resources System' LIMIT 1), (SELECT id FROM users WHERE email = 'william.moore@example.com' LIMIT 1), 'Performance review system streamlines the evaluation process.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Human Resources System' LIMIT 1), (SELECT id FROM users WHERE email = 'emma.martinez@example.com' LIMIT 1), 'Benefits management module is complete and tested. Ready for production.'),
-- Project 5 comments (2 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Financial Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'emma.martinez@example.com' LIMIT 1), 'Accounting module design should follow standard accounting principles.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Financial Management Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'james.wilson@example.com' LIMIT 1), 'Invoice management needs to support multiple currencies and tax rates.');

-- =========================
-- TASK_TAGS (1-5 tags per task - using new tag names)
-- =========================
INSERT IGNORE INTO task_tags (task_id, tag_id) VALUES
-- Project 1 tasks
((SELECT id FROM tasks WHERE title = 'Design ERP Modules' LIMIT 1), (SELECT id FROM tags WHERE name = 'service-mesh' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Design ERP Modules' LIMIT 1), (SELECT id FROM tags WHERE name = 'distributed' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Implement Inventory Management' LIMIT 1), (SELECT id FROM tags WHERE name = 'real-time' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Implement Inventory Management' LIMIT 1), (SELECT id FROM tags WHERE name = 'streaming' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Build Reporting Dashboard' LIMIT 1), (SELECT id FROM tags WHERE name = 'batch-processing' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Setup Database Schema' LIMIT 1), (SELECT id FROM tags WHERE name = 'storage' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Setup Database Schema' LIMIT 1), (SELECT id FROM tags WHERE name = 'backup' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'User Access Control' LIMIT 1), (SELECT id FROM tags WHERE name = 'authentication' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'User Access Control' LIMIT 1), (SELECT id FROM tags WHERE name = 'authorization' LIMIT 1)),
-- Project 2 tasks
((SELECT id FROM tasks WHERE title = 'Customer Database Design' LIMIT 1), (SELECT id FROM tags WHERE name = 'storage' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Contact Management System' LIMIT 1), (SELECT id FROM tags WHERE name = 'api-gateway' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Sales Pipeline Tracking' LIMIT 1), (SELECT id FROM tags WHERE name = 'real-time' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Email Integration' LIMIT 1), (SELECT id FROM tags WHERE name = 'api-gateway' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Customer Analytics' LIMIT 1), (SELECT id FROM tags WHERE name = 'batch-processing' LIMIT 1)),
-- Project 3 tasks
((SELECT id FROM tasks WHERE title = 'Warehouse Management' LIMIT 1), (SELECT id FROM tags WHERE name = 'real-time' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Shipping Integration' LIMIT 1), (SELECT id FROM tags WHERE name = 'api-gateway' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Inventory Forecasting' LIMIT 1), (SELECT id FROM tags WHERE name = 'streaming' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Supplier Management' LIMIT 1), (SELECT id FROM tags WHERE name = 'networking' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Route Optimization' LIMIT 1), (SELECT id FROM tags WHERE name = 'automation' LIMIT 1)),
-- Project 4 tasks
((SELECT id FROM tasks WHERE title = 'Employee Database' LIMIT 1), (SELECT id FROM tags WHERE name = 'storage' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Payroll Processing' LIMIT 1), (SELECT id FROM tags WHERE name = 'automation' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Attendance Tracking' LIMIT 1), (SELECT id FROM tags WHERE name = 'real-time' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Performance Reviews' LIMIT 1), (SELECT id FROM tags WHERE name = 'workflow' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Benefits Management' LIMIT 1), (SELECT id FROM tags WHERE name = 'compliance' LIMIT 1)),
-- Project 5 tasks
((SELECT id FROM tasks WHERE title = 'Accounting Module' LIMIT 1), (SELECT id FROM tags WHERE name = 'encryption' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Invoice Management' LIMIT 1), (SELECT id FROM tags WHERE name = 'automation' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Financial Reporting' LIMIT 1), (SELECT id FROM tags WHERE name = 'batch-processing' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Tax Calculation' LIMIT 1), (SELECT id FROM tags WHERE name = 'compliance' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Budget Planning' LIMIT 1), (SELECT id FROM tags WHERE name = 'cost-optimization' LIMIT 1));

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

