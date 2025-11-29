-- =========================
-- SAMPLE DATA FOR PROJECT TRACKER
-- =========================
-- Author: Thang Truong
-- Date: 2025-01-27
-- Note: This script uses INSERT IGNORE to skip duplicates if data already exists
-- Foreign keys use subqueries to find IDs based on unique fields
-- This data is completely different from 001, 002, and 003
-- Project owners must have 'Admin' or 'Project Manager' role
-- Each task assigned_to must be a project member, and one member per project has no tasks

USE project_tracker_mysql_db;

-- =========================
-- USERS (5 users - different from 001, 002, and 003)
-- =========================
INSERT IGNORE INTO users (uuid, first_name, last_name, email, password, role) VALUES
(UUID(), 'Robert', 'Davis', 'robert.davis@example.com', '$2b$10$example_hash_here', 'Admin'),
(UUID(), 'Maria', 'Garcia', 'maria.garcia@gmail.com', '$2b$10$example_hash_here', 'Project Manager'),
(UUID(), 'Daniel', 'Rodriguez', 'daniel.rodriguez@example.com', '$2b$10$example_hash_here', 'Frontend Developer'),
(UUID(), 'Jennifer', 'Lopez', 'jennifer.lopez@example.com', '$2b$10$example_hash_here', 'Database Administrator'),
(UUID(), 'Christopher', 'Lee', 'christopher.lee@example.com', '$2b$10$example_hash_here', 'Full-Stack Developer');

-- =========================
-- TAGS (20 tags - completely different from 001, 002, and 003)
-- =========================
INSERT IGNORE INTO tags (name, description, title, type, category) VALUES
('graphql', 'GraphQL API development', 'GraphQL', 'TECH', 'API'),
('rest', 'RESTful API design', 'REST', 'TECH', 'API'),
('websocket', 'WebSocket connections', 'WebSocket', 'TECH', 'NETWORK'),
('grpc', 'gRPC services', 'gRPC', 'TECH', 'API'),
('graph-database', 'Graph database systems', 'Graph Database', 'TECH', 'DATA'),
('nosql', 'NoSQL databases', 'NoSQL', 'TECH', 'DATA'),
('sql', 'SQL databases', 'SQL', 'TECH', 'DATA'),
('search-engine', 'Search engine implementation', 'Search Engine', 'TECH', 'SEARCH'),
('recommendation', 'Recommendation systems', 'Recommendation', 'TECH', 'AI'),
('personalization', 'Personalization engines', 'Personalization', 'TECH', 'AI'),
('ab-testing', 'A/B testing framework', 'A/B Testing', 'TECH', 'ANALYTICS'),
('metrics', 'Metrics and measurements', 'Metrics', 'TECH', 'ANALYTICS'),
('tracking', 'User tracking systems', 'Tracking', 'TECH', 'ANALYTICS'),
('push-notification', 'Push notification services', 'Push Notification', 'TECH', 'COMM'),
('email-service', 'Email service integration', 'Email Service', 'TECH', 'COMM'),
('sms-service', 'SMS service integration', 'SMS Service', 'TECH', 'COMM'),
('payment-processing', 'Payment processing', 'Payment Processing', 'TECH', 'FINANCE'),
('subscription', 'Subscription management', 'Subscription', 'TECH', 'FINANCE'),
('billing', 'Billing systems', 'Billing', 'TECH', 'FINANCE'),
('fraud-detection', 'Fraud detection systems', 'Fraud Detection', 'TECH', 'SECURITY');

-- =========================
-- PROJECTS (5 projects - different from 001, 002, and 003)
-- =========================
INSERT IGNORE INTO projects (uuid, name, description, status, owner_id) VALUES
(UUID(), 'Video Streaming Platform', 'Build video streaming service with live and on-demand content', 'IN_PROGRESS', (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1)),
(UUID(), 'Social Networking App', 'Develop social networking application with real-time features', 'PLANNING', (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1)),
(UUID(), 'E-Learning Platform', 'Create online learning platform with courses and assessments', 'IN_PROGRESS', (SELECT id FROM users WHERE email = 'robert.davis@example.com' LIMIT 1)),
(UUID(), 'Food Delivery Service', 'Build food delivery platform with order tracking', 'COMPLETED', (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1)),
(UUID(), 'Fitness Tracking App', 'Develop fitness tracking application with workout plans', 'PLANNING', (SELECT id FROM users WHERE email = 'robert.davis@example.com' LIMIT 1));

-- =========================
-- PROJECT_MEMBERS (3 members per project)
-- =========================
INSERT IGNORE INTO project_members (project_id, user_id, role) VALUES
-- Project 1: users maria.garcia, robert.davis, daniel.rodriguez
((SELECT id FROM projects WHERE name = 'Video Streaming Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Video Streaming Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'robert.davis@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Video Streaming Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'daniel.rodriguez@example.com' LIMIT 1), 'VIEWER'),
-- Project 2: users maria.garcia, daniel.rodriguez, jennifer.lopez
((SELECT id FROM projects WHERE name = 'Social Networking App' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Social Networking App' LIMIT 1), (SELECT id FROM users WHERE email = 'daniel.rodriguez@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Social Networking App' LIMIT 1), (SELECT id FROM users WHERE email = 'jennifer.lopez@example.com' LIMIT 1), 'VIEWER'),
-- Project 3: users robert.davis, maria.garcia, christopher.lee
((SELECT id FROM projects WHERE name = 'E-Learning Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'robert.davis@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'E-Learning Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'E-Learning Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'christopher.lee@example.com' LIMIT 1), 'VIEWER'),
-- Project 4: users maria.garcia, jennifer.lopez, christopher.lee
((SELECT id FROM projects WHERE name = 'Food Delivery Service' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Food Delivery Service' LIMIT 1), (SELECT id FROM users WHERE email = 'jennifer.lopez@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Food Delivery Service' LIMIT 1), (SELECT id FROM users WHERE email = 'christopher.lee@example.com' LIMIT 1), 'VIEWER'),
-- Project 5: users robert.davis, maria.garcia, daniel.rodriguez
((SELECT id FROM projects WHERE name = 'Fitness Tracking App' LIMIT 1), (SELECT id FROM users WHERE email = 'robert.davis@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Fitness Tracking App' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Fitness Tracking App' LIMIT 1), (SELECT id FROM users WHERE email = 'daniel.rodriguez@example.com' LIMIT 1), 'VIEWER');

-- =========================
-- TASKS (5 tasks per project = 25 tasks)
-- Note: Each task assigned_to must be a project member, and one member per project has no tasks
-- =========================
INSERT IGNORE INTO tasks (uuid, title, description, status, priority, due_date, project_id, assigned_to) VALUES
-- Project 1 tasks (members: maria.garcia, robert.davis, daniel.rodriguez; robert.davis has no tasks)
(UUID(), 'Video Encoding Pipeline', 'Build video encoding and transcoding pipeline', 'IN_PROGRESS', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 7 DAY)), (SELECT id FROM projects WHERE name = 'Video Streaming Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1)),
(UUID(), 'CDN Integration', 'Integrate CDN for video content delivery', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 14 DAY)), (SELECT id FROM projects WHERE name = 'Video Streaming Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'daniel.rodriguez@example.com' LIMIT 1)),
(UUID(), 'Live Streaming Setup', 'Implement live streaming functionality', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 21 DAY)), (SELECT id FROM projects WHERE name = 'Video Streaming Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1)),
(UUID(), 'Video Player Component', 'Build custom video player with controls', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 28 DAY)), (SELECT id FROM projects WHERE name = 'Video Streaming Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'daniel.rodriguez@example.com' LIMIT 1)),
(UUID(), 'Recommendation Engine', 'Implement video recommendation system', 'DONE', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL -5 DAY)), (SELECT id FROM projects WHERE name = 'Video Streaming Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1)),
-- Project 2 tasks (members: maria.garcia, daniel.rodriguez, jennifer.lopez; maria.garcia has no tasks)
(UUID(), 'User Profile System', 'Create user profile and settings management', 'IN_PROGRESS', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 10 DAY)), (SELECT id FROM projects WHERE name = 'Social Networking App' LIMIT 1), (SELECT id FROM users WHERE email = 'daniel.rodriguez@example.com' LIMIT 1)),
(UUID(), 'News Feed Algorithm', 'Implement personalized news feed algorithm', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 17 DAY)), (SELECT id FROM projects WHERE name = 'Social Networking App' LIMIT 1), (SELECT id FROM users WHERE email = 'jennifer.lopez@example.com' LIMIT 1)),
(UUID(), 'Real-time Messaging', 'Build real-time messaging and chat system', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 24 DAY)), (SELECT id FROM projects WHERE name = 'Social Networking App' LIMIT 1), (SELECT id FROM users WHERE email = 'daniel.rodriguez@example.com' LIMIT 1)),
(UUID(), 'Content Moderation', 'Implement content moderation and filtering', 'TODO', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 31 DAY)), (SELECT id FROM projects WHERE name = 'Social Networking App' LIMIT 1), (SELECT id FROM users WHERE email = 'jennifer.lopez@example.com' LIMIT 1)),
(UUID(), 'Social Graph Database', 'Create social graph database for connections', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 38 DAY)), (SELECT id FROM projects WHERE name = 'Social Networking App' LIMIT 1), (SELECT id FROM users WHERE email = 'daniel.rodriguez@example.com' LIMIT 1)),
-- Project 3 tasks (members: robert.davis, maria.garcia, christopher.lee; robert.davis has no tasks)
(UUID(), 'Course Management System', 'Build course creation and management system', 'IN_PROGRESS', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 8 DAY)), (SELECT id FROM projects WHERE name = 'E-Learning Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1)),
(UUID(), 'Assessment Engine', 'Implement quiz and assessment system', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 15 DAY)), (SELECT id FROM projects WHERE name = 'E-Learning Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'christopher.lee@example.com' LIMIT 1)),
(UUID(), 'Progress Tracking', 'Create student progress tracking system', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 22 DAY)), (SELECT id FROM projects WHERE name = 'E-Learning Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1)),
(UUID(), 'Certificate Generation', 'Build certificate generation system', 'TODO', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 29 DAY)), (SELECT id FROM projects WHERE name = 'E-Learning Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'christopher.lee@example.com' LIMIT 1)),
(UUID(), 'Discussion Forum', 'Implement discussion forum for courses', 'DONE', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL -3 DAY)), (SELECT id FROM projects WHERE name = 'E-Learning Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1)),
-- Project 4 tasks (members: maria.garcia, jennifer.lopez, christopher.lee; maria.garcia has no tasks)
(UUID(), 'Restaurant Management', 'Build restaurant registration and management', 'DONE', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL -10 DAY)), (SELECT id FROM projects WHERE name = 'Food Delivery Service' LIMIT 1), (SELECT id FROM users WHERE email = 'jennifer.lopez@example.com' LIMIT 1)),
(UUID(), 'Order Processing System', 'Implement order processing and tracking', 'DONE', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL -7 DAY)), (SELECT id FROM projects WHERE name = 'Food Delivery Service' LIMIT 1), (SELECT id FROM users WHERE email = 'christopher.lee@example.com' LIMIT 1)),
(UUID(), 'Delivery Tracking', 'Create real-time delivery tracking system', 'DONE', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL -4 DAY)), (SELECT id FROM projects WHERE name = 'Food Delivery Service' LIMIT 1), (SELECT id FROM users WHERE email = 'jennifer.lopez@example.com' LIMIT 1)),
(UUID(), 'Payment Integration', 'Integrate payment gateway for orders', 'DONE', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL -1 DAY)), (SELECT id FROM projects WHERE name = 'Food Delivery Service' LIMIT 1), (SELECT id FROM users WHERE email = 'christopher.lee@example.com' LIMIT 1)),
(UUID(), 'Rating System', 'Implement restaurant and delivery rating system', 'DONE', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 2 DAY)), (SELECT id FROM projects WHERE name = 'Food Delivery Service' LIMIT 1), (SELECT id FROM users WHERE email = 'jennifer.lopez@example.com' LIMIT 1)),
-- Project 5 tasks (members: robert.davis, maria.garcia, daniel.rodriguez; robert.davis has no tasks)
(UUID(), 'Workout Plan Builder', 'Create workout plan creation and customization', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 12 DAY)), (SELECT id FROM projects WHERE name = 'Fitness Tracking App' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1)),
(UUID(), 'Activity Tracking', 'Implement activity and exercise tracking', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 19 DAY)), (SELECT id FROM projects WHERE name = 'Fitness Tracking App' LIMIT 1), (SELECT id FROM users WHERE email = 'daniel.rodriguez@example.com' LIMIT 1)),
(UUID(), 'Nutrition Logging', 'Build nutrition and calorie tracking system', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 26 DAY)), (SELECT id FROM projects WHERE name = 'Fitness Tracking App' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1)),
(UUID(), 'Progress Visualization', 'Create charts and graphs for progress', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 33 DAY)), (SELECT id FROM projects WHERE name = 'Fitness Tracking App' LIMIT 1), (SELECT id FROM users WHERE email = 'daniel.rodriguez@example.com' LIMIT 1)),
(UUID(), 'Social Features', 'Implement social sharing and challenges', 'TODO', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 40 DAY)), (SELECT id FROM projects WHERE name = 'Fitness Tracking App' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1));

-- =========================
-- COMMENTS (2-5 comments per project, from project members)
-- =========================
INSERT IGNORE INTO comments (uuid, project_id, user_id, content) VALUES
-- Project 1 comments (5 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Video Streaming Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'robert.davis@example.com' LIMIT 1), 'Video encoding pipeline is processing videos efficiently. Quality is excellent.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Video Streaming Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1), 'CDN integration improved video loading times significantly.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Video Streaming Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'daniel.rodriguez@example.com' LIMIT 1), 'Live streaming setup is working well. Low latency achieved.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Video Streaming Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'robert.davis@example.com' LIMIT 1), 'Video player component has great UX. Users love the controls.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Video Streaming Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1), 'Recommendation engine is suggesting relevant content. Engagement increased.'),
-- Project 2 comments (4 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Social Networking App' LIMIT 1), (SELECT id FROM users WHERE email = 'robert.davis@example.com' LIMIT 1), 'User profile system is comprehensive. All features working correctly.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Social Networking App' LIMIT 1), (SELECT id FROM users WHERE email = 'daniel.rodriguez@example.com' LIMIT 1), 'News feed algorithm is showing relevant content. User engagement is high.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Social Networking App' LIMIT 1), (SELECT id FROM users WHERE email = 'jennifer.lopez@example.com' LIMIT 1), 'Real-time messaging is fast and reliable. No delays noticed.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Social Networking App' LIMIT 1), (SELECT id FROM users WHERE email = 'robert.davis@example.com' LIMIT 1), 'Content moderation is catching inappropriate content effectively.'),
-- Project 3 comments (3 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'E-Learning Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'robert.davis@example.com' LIMIT 1), 'Course management system is intuitive. Instructors find it easy to use.'),
(UUID(), (SELECT id FROM projects WHERE name = 'E-Learning Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1), 'Assessment engine supports various question types. Very flexible.'),
(UUID(), (SELECT id FROM projects WHERE name = 'E-Learning Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'christopher.lee@example.com' LIMIT 1), 'Progress tracking helps students stay motivated. Great feature!'),
-- Project 4 comments (5 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Food Delivery Service' LIMIT 1), (SELECT id FROM users WHERE email = 'robert.davis@example.com' LIMIT 1), 'Restaurant management system is complete. All restaurants are onboarded.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Food Delivery Service' LIMIT 1), (SELECT id FROM users WHERE email = 'jennifer.lopez@example.com' LIMIT 1), 'Order processing is fast and accurate. No errors reported.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Food Delivery Service' LIMIT 1), (SELECT id FROM users WHERE email = 'christopher.lee@example.com' LIMIT 1), 'Delivery tracking is real-time and accurate. Customers love it.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Food Delivery Service' LIMIT 1), (SELECT id FROM users WHERE email = 'jennifer.lopez@example.com' LIMIT 1), 'Payment integration supports multiple payment methods. Very convenient.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Food Delivery Service' LIMIT 1), (SELECT id FROM users WHERE email = 'robert.davis@example.com' LIMIT 1), 'Rating system helps maintain quality. Both restaurants and delivery drivers benefit.'),
-- Project 5 comments (2 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Fitness Tracking App' LIMIT 1), (SELECT id FROM users WHERE email = 'robert.davis@example.com' LIMIT 1), 'Workout plan builder should support custom exercises and routines.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Fitness Tracking App' LIMIT 1), (SELECT id FROM users WHERE email = 'maria.garcia@gmail.com' LIMIT 1), 'Activity tracking needs to integrate with wearable devices for accuracy.');

-- =========================
-- TASK_TAGS (1-5 tags per task - using new tag names)
-- =========================
INSERT IGNORE INTO task_tags (task_id, tag_id) VALUES
-- Project 1 tasks
((SELECT id FROM tasks WHERE title = 'Video Encoding Pipeline' LIMIT 1), (SELECT id FROM tags WHERE name = 'rest' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'CDN Integration' LIMIT 1), (SELECT id FROM tags WHERE name = 'networking' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Live Streaming Setup' LIMIT 1), (SELECT id FROM tags WHERE name = 'websocket' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Video Player Component' LIMIT 1), (SELECT id FROM tags WHERE name = 'graphql' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Recommendation Engine' LIMIT 1), (SELECT id FROM tags WHERE name = 'recommendation' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Recommendation Engine' LIMIT 1), (SELECT id FROM tags WHERE name = 'personalization' LIMIT 1)),
-- Project 2 tasks
((SELECT id FROM tasks WHERE title = 'User Profile System' LIMIT 1), (SELECT id FROM tags WHERE name = 'graphql' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'News Feed Algorithm' LIMIT 1), (SELECT id FROM tags WHERE name = 'recommendation' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Real-time Messaging' LIMIT 1), (SELECT id FROM tags WHERE name = 'websocket' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Content Moderation' LIMIT 1), (SELECT id FROM tags WHERE name = 'fraud-detection' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Social Graph Database' LIMIT 1), (SELECT id FROM tags WHERE name = 'graph-database' LIMIT 1)),
-- Project 3 tasks
((SELECT id FROM tasks WHERE title = 'Course Management System' LIMIT 1), (SELECT id FROM tags WHERE name = 'rest' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Assessment Engine' LIMIT 1), (SELECT id FROM tags WHERE name = 'nosql' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Progress Tracking' LIMIT 1), (SELECT id FROM tags WHERE name = 'metrics' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Certificate Generation' LIMIT 1), (SELECT id FROM tags WHERE name = 'automation' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Discussion Forum' LIMIT 1), (SELECT id FROM tags WHERE name = 'websocket' LIMIT 1)),
-- Project 4 tasks
((SELECT id FROM tasks WHERE title = 'Restaurant Management' LIMIT 1), (SELECT id FROM tags WHERE name = 'sql' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Order Processing System' LIMIT 1), (SELECT id FROM tags WHERE name = 'rest' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Delivery Tracking' LIMIT 1), (SELECT id FROM tags WHERE name = 'websocket' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Payment Integration' LIMIT 1), (SELECT id FROM tags WHERE name = 'payment-processing' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Rating System' LIMIT 1), (SELECT id FROM tags WHERE name = 'metrics' LIMIT 1)),
-- Project 5 tasks
((SELECT id FROM tasks WHERE title = 'Workout Plan Builder' LIMIT 1), (SELECT id FROM tags WHERE name = 'graphql' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Activity Tracking' LIMIT 1), (SELECT id FROM tags WHERE name = 'tracking' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Nutrition Logging' LIMIT 1), (SELECT id FROM tags WHERE name = 'nosql' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Progress Visualization' LIMIT 1), (SELECT id FROM tags WHERE name = 'metrics' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Social Features' LIMIT 1), (SELECT id FROM tags WHERE name = 'push-notification' LIMIT 1));

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

