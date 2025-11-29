-- =========================
-- SAMPLE DATA FOR PROJECT TRACKER
-- =========================
-- Author: Thang Truong
-- Date: 2025-01-27
-- Note: Project owners must have 'Admin' or 'Project Manager' role
-- All projects in this file are owned by user with 'Project Manager' role
-- Each task assigned_to must be a project member, and one member per project has no tasks

-- =========================
-- 5 USERS
-- =========================
INSERT INTO users (id, uuid, first_name, last_name, email, password, role) VALUES
(1, UUID(), 'Thang', 'Truong', 'thangtruong1808@gmail.com', 'hashed-password-2', 'Admin'),
(2, UUID(), 'Alice', 'Nguyen', 'alice.nguyen@gmail.com', 'hashed-password-1', 'Project Manager'),
(3, UUID(), 'Charlie', 'Le', 'charlie.le@gmail.com', 'hashed-password-3', 'Backend Developer'),
(4, UUID(), 'Diana', 'Pham', 'diana.pham@gmail.com', 'hashed-password-4', 'Full-Stack Developer'),
(5, UUID(), 'Eve', 'Hoang', 'eve.hoang@gmail.com', 'hashed-password-5', 'DevOps Engineer');

-- =========================
-- 20 TAGS
-- =========================
INSERT INTO tags (id, name, description, title, type, category) VALUES
(1, 'frontend', 'Frontend development tasks', 'Frontend Development', 'TECH', 'UI'),
(2, 'backend', 'Backend development tasks', 'Backend Development', 'TECH', 'API'),
(3, 'database', 'Database related tasks', 'Database', 'TECH', 'DATA'),
(4, 'security', 'Security and authentication', 'Security', 'TECH', 'SECURITY'),
(5, 'testing', 'Testing and QA tasks', 'Testing', 'TECH', 'QA'),
(6, 'design', 'UI/UX design tasks', 'Design', 'DESIGN', 'UI'),
(7, 'mobile', 'Mobile app development', 'Mobile', 'TECH', 'MOBILE'),
(8, 'api', 'API integration tasks', 'API Integration', 'TECH', 'API'),
(9, 'documentation', 'Documentation tasks', 'Documentation', 'DOC', 'DOC'),
(10, 'urgent', 'High priority urgent tasks', 'Urgent', 'PRIORITY', 'HIGH'),
(11, 'feature', 'New feature development', 'Feature', 'FEATURE', 'NEW'),
(12, 'bugfix', 'Bug fixes and patches', 'Bug Fix', 'BUG', 'FIX'),
(13, 'performance', 'Performance optimization', 'Performance', 'TECH', 'OPTIMIZATION'),
(14, 'integration', 'Third-party integrations', 'Integration', 'TECH', 'INTEGRATION'),
(15, 'analytics', 'Analytics and reporting', 'Analytics', 'FEATURE', 'DATA'),
(16, 'payment', 'Payment processing', 'Payment', 'FEATURE', 'FINANCE'),
(17, 'notification', 'Notification systems', 'Notifications', 'FEATURE', 'COMM'),
(18, 'search', 'Search functionality', 'Search', 'FEATURE', 'SEARCH'),
(19, 'admin', 'Admin panel features', 'Admin', 'FEATURE', 'ADMIN'),
(20, 'user-experience', 'User experience improvements', 'UX', 'DESIGN', 'UX');

-- =========================
-- 5 PROJECTS
-- =========================
INSERT INTO projects (id, uuid, name, description, status, owner_id) VALUES
(1, UUID(), 'E-Commerce Platform', 'Build online shopping platform with payment integration', 'PLANNING', 1),
(2, UUID(), 'Mobile Banking App', 'Secure mobile banking application with biometric auth', 'IN_PROGRESS', 2),
(3, UUID(), 'Healthcare Portal', 'Patient management and appointment scheduling system', 'PLANNING', 1),
(4, UUID(), 'Learning Management System', 'Online education platform with video courses', 'IN_PROGRESS', 2),
(5, UUID(), 'Social Media Dashboard', 'Analytics dashboard for social media metrics', 'COMPLETED', 1);

-- =========================
-- 25 TASKS (5 tasks per project, assigned_to only from project members)
-- Note: Each task assigned_to must be a project member, and one member per project has no tasks
-- =========================
INSERT INTO tasks (id, uuid, title, description, status, priority, due_date, project_id, assigned_to) VALUES
-- Project 1 (5 tasks - members: 1, 2, 3; user 1 has no tasks)
(1, UUID(), 'Design user interface', 'Create wireframes and mockups for e-commerce platform', 'TODO', 'HIGH', '2025-12-15', 1, 2),
(2, UUID(), 'Setup payment gateway', 'Integrate Stripe payment processing', 'IN_PROGRESS', 'HIGH', '2025-12-20', 1, 3),
(3, UUID(), 'Implement shopping cart', 'Build cart functionality with add/remove items', 'TODO', 'MEDIUM', '2025-12-25', 1, 2),
(4, UUID(), 'User authentication', 'Implement login and registration system', 'DONE', 'HIGH', '2025-12-10', 1, 3),
(5, UUID(), 'Product catalog API', 'Create REST API for product management', 'IN_PROGRESS', 'MEDIUM', '2025-12-18', 1, 2),
-- Project 2 (5 tasks - members: 1, 3, 4; user 1 has no tasks)
(6, UUID(), 'Mobile app design', 'Design UI/UX for banking app', 'TODO', 'HIGH', '2025-12-16', 2, 3),
(7, UUID(), 'Biometric authentication', 'Implement fingerprint and face recognition', 'IN_PROGRESS', 'HIGH', '2025-12-22', 2, 4),
(8, UUID(), 'Transaction history', 'Display user transaction records', 'TODO', 'MEDIUM', '2025-12-28', 2, 3),
(9, UUID(), 'Security audit', 'Review security measures and vulnerabilities', 'DONE', 'HIGH', '2025-12-12', 2, 4),
(10, UUID(), 'Push notifications', 'Implement transaction alerts', 'IN_PROGRESS', 'LOW', '2025-12-19', 2, 3),
-- Project 3 (5 tasks - members: 1, 2, 5; user 1 has no tasks)
(11, UUID(), 'Patient registration form', 'Create patient onboarding workflow', 'TODO', 'HIGH', '2025-12-17', 3, 2),
(12, UUID(), 'Appointment scheduler', 'Build calendar-based appointment system', 'IN_PROGRESS', 'HIGH', '2025-12-23', 3, 5),
(13, UUID(), 'Medical records view', 'Display patient medical history', 'TODO', 'MEDIUM', '2025-12-29', 3, 2),
(14, UUID(), 'HIPAA compliance', 'Ensure data privacy compliance', 'DONE', 'HIGH', '2025-12-13', 3, 5),
(15, UUID(), 'Doctor dashboard', 'Create interface for healthcare providers', 'IN_PROGRESS', 'MEDIUM', '2025-12-20', 3, 2),
-- Project 4 (5 tasks - members: 1, 4, 5; user 1 has no tasks)
(16, UUID(), 'Course creation tool', 'Build interface for instructors to create courses', 'TODO', 'HIGH', '2025-12-18', 4, 4),
(17, UUID(), 'Video player component', 'Implement custom video player with controls', 'IN_PROGRESS', 'HIGH', '2025-12-24', 4, 5),
(18, UUID(), 'Progress tracking', 'Track student course completion', 'TODO', 'MEDIUM', '2025-12-30', 4, 4),
(19, UUID(), 'Quiz system', 'Create quiz builder and grading system', 'DONE', 'HIGH', '2025-12-14', 4, 5),
(20, UUID(), 'Certificate generation', 'Generate completion certificates', 'IN_PROGRESS', 'LOW', '2025-12-21', 4, 4),
-- Project 5 (5 tasks - members: 1, 2, 3; user 1 has no tasks)
(21, UUID(), 'Data visualization charts', 'Create interactive charts for analytics', 'DONE', 'HIGH', '2025-12-11', 5, 2),
(22, UUID(), 'Social media API integration', 'Connect to Twitter, Facebook APIs', 'DONE', 'MEDIUM', '2025-12-12', 5, 3),
(23, UUID(), 'Export reports', 'Generate PDF and Excel reports', 'DONE', 'MEDIUM', '2025-12-13', 5, 2),
(24, UUID(), 'Real-time updates', 'Implement WebSocket for live data', 'DONE', 'HIGH', '2025-12-14', 5, 3),
(25, UUID(), 'User dashboard', 'Create personalized dashboard view', 'DONE', 'MEDIUM', '2025-12-15', 5, 2);

-- =========================
-- 15 PROJECT MEMBERS (3 per project)
-- =========================
INSERT INTO project_members (project_id, user_id, role) VALUES
-- Project 1
(1, 1, 'OWNER'), (1, 2, 'EDITOR'), (1, 3, 'EDITOR'),
-- Project 2
(2, 1, 'OWNER'), (2, 3, 'EDITOR'), (2, 4, 'VIEWER'),
-- Project 3
(3, 1, 'OWNER'), (3, 2, 'EDITOR'), (3, 5, 'VIEWER'),
-- Project 4
(4, 1, 'OWNER'), (4, 4, 'EDITOR'), (4, 5, 'VIEWER'),
-- Project 5
(5, 1, 'OWNER'), (5, 2, 'EDITOR'), (5, 3, 'VIEWER');

-- =========================
-- COMMENTS (2-5 per project, user_id from project_members of same project)
-- =========================
INSERT INTO comments (id, uuid, project_id, user_id, content) VALUES
-- Project 1 (5 comments from users 1, 2, 3)
(1, UUID(), 1, 1, 'Great progress on the UI design! Looking forward to seeing the final mockups.'),
(2, UUID(), 1, 2, 'Payment gateway integration is going smoothly. Should be ready for testing soon.'),
(3, UUID(), 1, 3, 'The shopping cart functionality looks good. Any plans for wishlist feature?'),
(4, UUID(), 1, 1, 'Excellent work team! Keep up the momentum.'),
(5, UUID(), 1, 2, 'Product catalog API needs some optimization for large datasets.'),
-- Project 2 (4 comments from users 1, 3, 4)
(6, UUID(), 2, 1, 'Mobile app design is coming along nicely. The UI is very intuitive.'),
(7, UUID(), 2, 3, 'Biometric authentication is working well on test devices.'),
(8, UUID(), 2, 4, 'Transaction history feature is comprehensive. Good job!'),
(9, UUID(), 2, 1, 'Security audit passed with flying colors. Well done!'),
-- Project 3 (3 comments from users 1, 2, 5)
(10, UUID(), 3, 1, 'Patient registration form is user-friendly. Great UX!'),
(11, UUID(), 3, 2, 'Appointment scheduler is very intuitive. Easy to use.'),
(12, UUID(), 3, 5, 'Medical records view needs better organization.'),
-- Project 4 (4 comments from users 1, 4, 5)
(13, UUID(), 4, 1, 'Course creation tool is powerful. Instructors will love it.'),
(14, UUID(), 4, 4, 'Video player works smoothly. No buffering issues.'),
(15, UUID(), 4, 5, 'Progress tracking is detailed. Students can see their improvement.'),
(16, UUID(), 4, 1, 'Quiz system is comprehensive. Good variety of question types.'),
-- Project 5 (3 comments from users 1, 2, 3)
(17, UUID(), 5, 1, 'Data visualization is impressive. Charts are interactive and informative.'),
(18, UUID(), 5, 2, 'Social media API integration is working well.'),
(19, UUID(), 5, 3, 'Export reports feature is very useful. Multiple format options.');

-- =========================
-- TASK_TAGS (1-5 tags per task)
-- =========================
INSERT INTO task_tags (task_id, tag_id) VALUES
-- Task 1 (3 tags)
(1, 1), (1, 6), (1, 10),
-- Task 2 (4 tags)
(2, 2), (2, 8), (2, 16), (2, 4),
-- Task 3 (2 tags)
(3, 1), (3, 11),
-- Task 4 (3 tags)
(4, 2), (4, 4), (4, 11),
-- Task 5 (2 tags)
(5, 2), (5, 8),
-- Task 6 (4 tags)
(6, 1), (6, 6), (6, 7), (6, 10),
-- Task 7 (5 tags)
(7, 2), (7, 4), (7, 7), (7, 8), (7, 10),
-- Task 8 (2 tags)
(8, 1), (8, 11),
-- Task 9 (3 tags)
(9, 4), (9, 5), (9, 12),
-- Task 10 (2 tags)
(10, 2), (10, 17),
-- Task 11 (3 tags)
(11, 1), (11, 11), (11, 20),
-- Task 12 (4 tags)
(12, 2), (12, 11), (12, 8), (12, 17),
-- Task 13 (2 tags)
(13, 1), (13, 11),
-- Task 14 (3 tags)
(14, 4), (14, 5), (14, 12),
-- Task 15 (2 tags)
(15, 1), (15, 19),
-- Task 16 (4 tags)
(16, 1), (16, 11), (16, 6), (16, 20),
-- Task 17 (5 tags)
(17, 1), (17, 11), (17, 13), (17, 8), (17, 14),
-- Task 18 (2 tags)
(18, 2), (18, 11),
-- Task 19 (3 tags)
(19, 2), (19, 11), (19, 15),
-- Task 20 (2 tags)
(20, 2), (20, 11),
-- Task 21 (4 tags)
(21, 1), (21, 15), (21, 13), (21, 11),
-- Task 22 (3 tags)
(22, 2), (22, 8), (22, 14),
-- Task 23 (2 tags)
(23, 2), (23, 15),
-- Task 24 (4 tags)
(24, 2), (24, 8), (24, 13), (24, 17),
-- Task 25 (3 tags)
(25, 1), (25, 19), (25, 20);

-- =========================
-- TASK_LIKES (2-5 likes per task, user_id from project_members of same project) - CORRECTED
-- =========================
INSERT INTO task_likes (id, user_id, task_id) VALUES
-- Task 1 (Project 1, users 1, 2, 3)
(1, 1, 1), (2, 2, 1), (3, 3, 1),
-- Task 2 (Project 1, users 1, 2, 3)
(4, 1, 2), (5, 2, 2), (6, 3, 2),
-- Task 3 (Project 1, users 1, 2, 3)
(7, 2, 3), (8, 3, 3),
-- Task 4 (Project 1, users 1, 2, 3)
(9, 1, 4), (10, 2, 4), (11, 3, 4),
-- Task 5 (Project 1, users 1, 2, 3)
(12, 1, 5), (13, 3, 5),
-- Task 6 (Project 2, users 1, 3, 4)
(14, 1, 6), (15, 3, 6), (16, 4, 6),
-- Task 7 (Project 2, users 1, 3, 4)
(17, 1, 7), (18, 3, 7), (19, 4, 7),
-- Task 8 (Project 2, users 1, 3, 4)
(20, 3, 8), (21, 4, 8),
-- Task 9 (Project 2, users 1, 3, 4)
(22, 1, 9), (23, 3, 9), (24, 4, 9),
-- Task 10 (Project 2, users 1, 3, 4)
(25, 1, 10), (26, 4, 10),
-- Task 11 (Project 3, users 1, 2, 5)
(27, 1, 11), (28, 2, 11), (29, 5, 11),
-- Task 12 (Project 3, users 1, 2, 5)
(30, 1, 12), (31, 2, 12), (32, 5, 12),
-- Task 13 (Project 3, users 1, 2, 5)
(33, 2, 13), (34, 5, 13),
-- Task 14 (Project 3, users 1, 2, 5)
(35, 1, 14), (36, 2, 14), (37, 5, 14),
-- Task 15 (Project 3, users 1, 2, 5)
(38, 1, 15), (39, 5, 15),
-- Task 16 (Project 4, users 1, 4, 5)
(40, 1, 16), (41, 4, 16), (42, 5, 16),
-- Task 17 (Project 4, users 1, 4, 5)
(43, 1, 17), (44, 4, 17), (45, 5, 17),
-- Task 18 (Project 4, users 1, 4, 5)
(46, 4, 18), (47, 5, 18),
-- Task 19 (Project 4, users 1, 4, 5)
(48, 1, 19), (49, 4, 19), (50, 5, 19),
-- Task 20 (Project 4, users 1, 4, 5)
(51, 1, 20), (52, 5, 20),
-- Task 21 (Project 5, users 1, 2, 3)
(53, 1, 21), (54, 2, 21), (55, 3, 21),
-- Task 22 (Project 5, users 1, 2, 3)
(56, 1, 22), (57, 2, 22), (58, 3, 22),
-- Task 23 (Project 5, users 1, 2, 3)
(59, 2, 23), (60, 3, 23),
-- Task 24 (Project 5, users 1, 2, 3)
(61, 1, 24), (62, 2, 24), (63, 3, 24),
-- Task 25 (Project 5, users 1, 2, 3)
(64, 1, 25), (65, 3, 25);

-- =========================
-- COMMENT_LIKES (2-5 likes per comment, user_id from project_members of same project) - CORRECTED
-- =========================
INSERT INTO comment_likes (id, user_id, comment_id) VALUES
-- Comment 1 (Project 1, users 1, 2, 3)
(1, 1, 1), (2, 2, 1), (3, 3, 1),
-- Comment 2 (Project 1, users 1, 2, 3)
(4, 1, 2), (5, 2, 2), (6, 3, 2),
-- Comment 3 (Project 1, users 1, 2, 3)
(7, 2, 3), (8, 3, 3),
-- Comment 4 (Project 1, users 1, 2, 3)
(9, 1, 4), (10, 2, 4), (11, 3, 4),
-- Comment 5 (Project 1, users 1, 2, 3)
(12, 1, 5), (13, 3, 5),
-- Comment 6 (Project 2, users 1, 3, 4)
(14, 1, 6), (15, 3, 6), (16, 4, 6),
-- Comment 7 (Project 2, users 1, 3, 4)
(17, 1, 7), (18, 3, 7), (19, 4, 7),
-- Comment 8 (Project 2, users 1, 3, 4)
(20, 3, 8), (21, 4, 8),
-- Comment 9 (Project 2, users 1, 3, 4)
(22, 1, 9), (23, 3, 9), (24, 4, 9),
-- Comment 10 (Project 3, users 1, 2, 5)
(25, 1, 10), (26, 2, 10), (27, 5, 10),
-- Comment 11 (Project 3, users 1, 2, 5)
(28, 1, 11), (29, 2, 11), (30, 5, 11),
-- Comment 12 (Project 3, users 1, 2, 5)
(31, 2, 12), (32, 5, 12),
-- Comment 13 (Project 4, users 1, 4, 5)
(33, 1, 13), (34, 4, 13), (35, 5, 13),
-- Comment 14 (Project 4, users 1, 4, 5)
(36, 1, 14), (37, 4, 14), (38, 5, 14),
-- Comment 15 (Project 4, users 1, 4, 5)
(39, 4, 15), (40, 5, 15),
-- Comment 16 (Project 4, users 1, 4, 5)
(41, 1, 16), (42, 4, 16), (43, 5, 16),
-- Comment 17 (Project 5, users 1, 2, 3)
(44, 1, 17), (45, 2, 17), (46, 3, 17),
-- Comment 18 (Project 5, users 1, 2, 3)
(47, 1, 18), (48, 2, 18), (49, 3, 18),
-- Comment 19 (Project 5, users 1, 2, 3)
(50, 2, 19), (51, 3, 19);

-- =========================
-- PROJECT_LIKES (3-5 likes per project, user_id from users 1-5)
-- =========================
INSERT INTO project_likes (id, user_id, project_id) VALUES
-- Project 1
(1, 1, 1), (2, 2, 1), (3, 3, 1), (4, 4, 1), (5, 5, 1),
-- Project 2
(6, 1, 2), (7, 2, 2), (8, 3, 2), (9, 4, 2),
-- Project 3
(10, 1, 3), (11, 2, 3), (12, 3, 3), (13, 4, 3), (14, 5, 3),
-- Project 4
(15, 1, 4), (16, 2, 4), (17, 3, 4), (18, 4, 4),
-- Project 5
(19, 1, 5), (20, 2, 5), (21, 3, 5), (22, 4, 5), (23, 5, 5);