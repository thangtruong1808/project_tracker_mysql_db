-- =========================
-- SAMPLE DATA FOR PROJECT TRACKER
-- =========================
-- Author: Thang Truong
-- Date: 2025-01-27
-- Note: This script uses INSERT IGNORE to skip duplicates if data already exists
-- Foreign keys use subqueries to find IDs based on unique fields
-- This data is completely different from 001-Sample_data.sql
-- Project owners must have 'Admin' or 'Project Manager' role
-- Each task assigned_to must be a project member, and one member per project has no tasks

USE project_tracker_mysql_db;

-- =========================
-- USERS (5 users - different from 001)
-- =========================
INSERT IGNORE INTO users (uuid, first_name, last_name, email, password, role) VALUES
(UUID(), 'Michael', 'Chen', 'michael.chen@example.com', '$2b$10$example_hash_here', 'Admin'),
(UUID(), 'Sarah', 'Kim', 'sarah.kim@example.com', '$2b$10$example_hash_here', 'Project Manager'),
(UUID(), 'David', 'Park', 'david.park@example.com', '$2b$10$example_hash_here', 'DevOps Engineer'),
(UUID(), 'Lisa', 'Wong', 'lisa.wong@example.com', '$2b$10$example_hash_here', 'Database Administrator'),
(UUID(), 'Tom', 'Anderson', 'tom.anderson@example.com', '$2b$10$example_hash_here', 'Full-Stack Developer');

-- =========================
-- TAGS (20 tags - completely different from 001)
-- =========================
INSERT IGNORE INTO tags (name, description, title, type, category) VALUES
('cloud', 'Cloud computing and infrastructure', 'Cloud', 'TECH', 'INFRASTRUCTURE'),
('microservices', 'Microservices architecture', 'Microservices', 'TECH', 'ARCHITECTURE'),
('blockchain', 'Blockchain technology', 'Blockchain', 'TECH', 'BLOCKCHAIN'),
('ai', 'Artificial intelligence', 'AI', 'TECH', 'AI'),
('machine-learning', 'Machine learning algorithms', 'Machine Learning', 'TECH', 'AI'),
('data-science', 'Data science and analytics', 'Data Science', 'TECH', 'DATA'),
('iot', 'Internet of Things', 'IoT', 'TECH', 'IOT'),
('automation', 'Process automation', 'Automation', 'TECH', 'AUTOMATION'),
('scalability', 'System scalability', 'Scalability', 'TECH', 'PERFORMANCE'),
('reliability', 'System reliability', 'Reliability', 'TECH', 'QUALITY'),
('monitoring', 'System monitoring', 'Monitoring', 'TECH', 'OPS'),
('logging', 'Application logging', 'Logging', 'TECH', 'OPS'),
('caching', 'Data caching strategies', 'Caching', 'TECH', 'PERFORMANCE'),
('queue', 'Message queue systems', 'Queue', 'TECH', 'MESSAGING'),
('messaging', 'Messaging systems', 'Messaging', 'TECH', 'MESSAGING'),
('workflow', 'Workflow automation', 'Workflow', 'TECH', 'AUTOMATION'),
('compliance', 'Regulatory compliance', 'Compliance', 'LEGAL', 'COMPLIANCE'),
('audit', 'Audit and tracking', 'Audit', 'LEGAL', 'COMPLIANCE'),
('migration', 'Data migration', 'Migration', 'TECH', 'DATA'),
('deployment', 'Deployment processes', 'Deployment', 'TECH', 'OPS');

-- =========================
-- PROJECTS (5 projects - different from 001)
-- =========================
INSERT IGNORE INTO projects (uuid, name, description, status, owner_id) VALUES
(UUID(), 'Cloud Infrastructure', 'Build scalable cloud infrastructure with auto-scaling and load balancing', 'IN_PROGRESS', (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1)),
(UUID(), 'Blockchain Platform', 'Develop a blockchain platform for secure transactions', 'PLANNING', (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1)),
(UUID(), 'AI Research Lab', 'Create AI research platform with machine learning capabilities', 'IN_PROGRESS', (SELECT id FROM users WHERE email = 'michael.chen@example.com' LIMIT 1)),
(UUID(), 'IoT Device Management', 'Build system for managing IoT devices and sensors', 'COMPLETED', (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1)),
(UUID(), 'Data Analytics Platform', 'Develop platform for big data analytics and visualization', 'PLANNING', (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1));

-- =========================
-- PROJECT_MEMBERS (3 members per project)
-- =========================
INSERT IGNORE INTO project_members (project_id, user_id, role) VALUES
-- Project 1: users sarah.kim, michael.chen, david.park
((SELECT id FROM projects WHERE name = 'Cloud Infrastructure' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Cloud Infrastructure' LIMIT 1), (SELECT id FROM users WHERE email = 'michael.chen@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Cloud Infrastructure' LIMIT 1), (SELECT id FROM users WHERE email = 'david.park@example.com' LIMIT 1), 'VIEWER'),
-- Project 2: users michael.chen, david.park, lisa.wong
((SELECT id FROM projects WHERE name = 'Blockchain Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'michael.chen@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Blockchain Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'david.park@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Blockchain Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'lisa.wong@example.com' LIMIT 1), 'VIEWER'),
-- Project 3: users michael.chen, sarah.kim, tom.anderson
((SELECT id FROM projects WHERE name = 'AI Research Lab' LIMIT 1), (SELECT id FROM users WHERE email = 'michael.chen@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'AI Research Lab' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'AI Research Lab' LIMIT 1), (SELECT id FROM users WHERE email = 'tom.anderson@example.com' LIMIT 1), 'VIEWER'),
-- Project 4: users sarah.kim, lisa.wong, tom.anderson
((SELECT id FROM projects WHERE name = 'IoT Device Management' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'IoT Device Management' LIMIT 1), (SELECT id FROM users WHERE email = 'lisa.wong@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'IoT Device Management' LIMIT 1), (SELECT id FROM users WHERE email = 'tom.anderson@example.com' LIMIT 1), 'VIEWER'),
-- Project 5: users sarah.kim, michael.chen, david.park
((SELECT id FROM projects WHERE name = 'Data Analytics Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1), 'OWNER'),
((SELECT id FROM projects WHERE name = 'Data Analytics Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'michael.chen@example.com' LIMIT 1), 'EDITOR'),
((SELECT id FROM projects WHERE name = 'Data Analytics Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'david.park@example.com' LIMIT 1), 'VIEWER');

-- =========================
-- TASKS (5 tasks per project = 25 tasks)
-- Note: Each task assigned_to must be a project member, and one member per project has no tasks
-- =========================
INSERT IGNORE INTO tasks (uuid, title, description, status, priority, due_date, project_id, assigned_to) VALUES
-- Project 1 tasks (members: sarah.kim, michael.chen, david.park; michael.chen has no tasks)
(UUID(), 'Setup Kubernetes Cluster', 'Configure Kubernetes cluster for container orchestration', 'IN_PROGRESS', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 7 DAY)), (SELECT id FROM projects WHERE name = 'Cloud Infrastructure' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1)),
(UUID(), 'Implement Auto-scaling', 'Build auto-scaling functionality based on load metrics', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 14 DAY)), (SELECT id FROM projects WHERE name = 'Cloud Infrastructure' LIMIT 1), (SELECT id FROM users WHERE email = 'david.park@example.com' LIMIT 1)),
(UUID(), 'Configure Load Balancer', 'Setup load balancer for traffic distribution', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 21 DAY)), (SELECT id FROM projects WHERE name = 'Cloud Infrastructure' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1)),
(UUID(), 'Setup Monitoring System', 'Implement comprehensive monitoring and alerting', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 28 DAY)), (SELECT id FROM projects WHERE name = 'Cloud Infrastructure' LIMIT 1), (SELECT id FROM users WHERE email = 'david.park@example.com' LIMIT 1)),
(UUID(), 'Implement Caching Layer', 'Add Redis caching for improved performance', 'DONE', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL -5 DAY)), (SELECT id FROM projects WHERE name = 'Cloud Infrastructure' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1)),
-- Project 2 tasks (members: michael.chen, david.park, lisa.wong; michael.chen has no tasks)
(UUID(), 'Design Blockchain Architecture', 'Create architecture for blockchain network', 'IN_PROGRESS', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 10 DAY)), (SELECT id FROM projects WHERE name = 'Blockchain Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'david.park@example.com' LIMIT 1)),
(UUID(), 'Implement Smart Contracts', 'Develop smart contract functionality', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 17 DAY)), (SELECT id FROM projects WHERE name = 'Blockchain Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'lisa.wong@example.com' LIMIT 1)),
(UUID(), 'Build Consensus Algorithm', 'Implement consensus mechanism for network', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 24 DAY)), (SELECT id FROM projects WHERE name = 'Blockchain Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'david.park@example.com' LIMIT 1)),
(UUID(), 'Create Wallet System', 'Build secure wallet for transactions', 'TODO', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 31 DAY)), (SELECT id FROM projects WHERE name = 'Blockchain Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'lisa.wong@example.com' LIMIT 1)),
(UUID(), 'Security Audit', 'Conduct security audit of blockchain system', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 38 DAY)), (SELECT id FROM projects WHERE name = 'Blockchain Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'david.park@example.com' LIMIT 1)),
-- Project 3 tasks (members: michael.chen, sarah.kim, tom.anderson; michael.chen has no tasks)
(UUID(), 'Setup ML Pipeline', 'Create machine learning data pipeline', 'IN_PROGRESS', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 8 DAY)), (SELECT id FROM projects WHERE name = 'AI Research Lab' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1)),
(UUID(), 'Train Neural Networks', 'Implement neural network training system', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 15 DAY)), (SELECT id FROM projects WHERE name = 'AI Research Lab' LIMIT 1), (SELECT id FROM users WHERE email = 'tom.anderson@example.com' LIMIT 1)),
(UUID(), 'Build Model API', 'Create API for model inference', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 22 DAY)), (SELECT id FROM projects WHERE name = 'AI Research Lab' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1)),
(UUID(), 'Data Preprocessing', 'Implement data cleaning and preprocessing', 'TODO', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 29 DAY)), (SELECT id FROM projects WHERE name = 'AI Research Lab' LIMIT 1), (SELECT id FROM users WHERE email = 'tom.anderson@example.com' LIMIT 1)),
(UUID(), 'Model Evaluation', 'Build system for model performance evaluation', 'DONE', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL -3 DAY)), (SELECT id FROM projects WHERE name = 'AI Research Lab' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1)),
-- Project 4 tasks (members: sarah.kim, lisa.wong, tom.anderson; sarah.kim has no tasks)
(UUID(), 'Device Registration System', 'Build system for IoT device registration', 'DONE', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL -10 DAY)), (SELECT id FROM projects WHERE name = 'IoT Device Management' LIMIT 1), (SELECT id FROM users WHERE email = 'lisa.wong@example.com' LIMIT 1)),
(UUID(), 'Real-time Data Streaming', 'Implement real-time data streaming from devices', 'DONE', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL -7 DAY)), (SELECT id FROM projects WHERE name = 'IoT Device Management' LIMIT 1), (SELECT id FROM users WHERE email = 'tom.anderson@example.com' LIMIT 1)),
(UUID(), 'Device Control Interface', 'Create interface for device control', 'DONE', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL -4 DAY)), (SELECT id FROM projects WHERE name = 'IoT Device Management' LIMIT 1), (SELECT id FROM users WHERE email = 'lisa.wong@example.com' LIMIT 1)),
(UUID(), 'Alert System', 'Build alerting system for device anomalies', 'DONE', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL -1 DAY)), (SELECT id FROM projects WHERE name = 'IoT Device Management' LIMIT 1), (SELECT id FROM users WHERE email = 'tom.anderson@example.com' LIMIT 1)),
(UUID(), 'Dashboard Visualization', 'Create dashboard for device monitoring', 'DONE', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 2 DAY)), (SELECT id FROM projects WHERE name = 'IoT Device Management' LIMIT 1), (SELECT id FROM users WHERE email = 'lisa.wong@example.com' LIMIT 1)),
-- Project 5 tasks (members: sarah.kim, michael.chen, david.park; michael.chen has no tasks)
(UUID(), 'Data Warehouse Setup', 'Configure data warehouse for analytics', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 12 DAY)), (SELECT id FROM projects WHERE name = 'Data Analytics Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1)),
(UUID(), 'ETL Pipeline Development', 'Build ETL pipeline for data processing', 'TODO', 'HIGH', DATE(DATE_ADD(NOW(), INTERVAL 19 DAY)), (SELECT id FROM projects WHERE name = 'Data Analytics Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'david.park@example.com' LIMIT 1)),
(UUID(), 'Analytics Dashboard', 'Create interactive analytics dashboard', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 26 DAY)), (SELECT id FROM projects WHERE name = 'Data Analytics Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1)),
(UUID(), 'Report Generation', 'Implement automated report generation', 'TODO', 'MEDIUM', DATE(DATE_ADD(NOW(), INTERVAL 33 DAY)), (SELECT id FROM projects WHERE name = 'Data Analytics Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'david.park@example.com' LIMIT 1)),
(UUID(), 'Data Export Tools', 'Build tools for data export and sharing', 'TODO', 'LOW', DATE(DATE_ADD(NOW(), INTERVAL 40 DAY)), (SELECT id FROM projects WHERE name = 'Data Analytics Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1));

-- =========================
-- COMMENTS (2-5 comments per project, from project members)
-- =========================
INSERT IGNORE INTO comments (uuid, project_id, user_id, content) VALUES
-- Project 1 comments (5 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Cloud Infrastructure' LIMIT 1), (SELECT id FROM users WHERE email = 'michael.chen@example.com' LIMIT 1), 'Kubernetes cluster setup is progressing well. We should consider using managed services.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Cloud Infrastructure' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1), 'Auto-scaling configuration needs careful tuning to avoid unnecessary costs.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Cloud Infrastructure' LIMIT 1), (SELECT id FROM users WHERE email = 'david.park@example.com' LIMIT 1), 'Load balancer health checks are working correctly. Good job!'),
(UUID(), (SELECT id FROM projects WHERE name = 'Cloud Infrastructure' LIMIT 1), (SELECT id FROM users WHERE email = 'michael.chen@example.com' LIMIT 1), 'Monitoring system should include custom metrics for our specific use cases.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Cloud Infrastructure' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1), 'Caching layer implementation is complete and tested. Performance improved significantly.'),
-- Project 2 comments (4 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Blockchain Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'michael.chen@example.com' LIMIT 1), 'Blockchain architecture design looks solid. We need to finalize the consensus mechanism.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Blockchain Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'david.park@example.com' LIMIT 1), 'Smart contracts development is in progress. Testing framework is ready.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Blockchain Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'lisa.wong@example.com' LIMIT 1), 'Consensus algorithm implementation is complex but necessary for network security.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Blockchain Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'michael.chen@example.com' LIMIT 1), 'Wallet system security is critical. We should implement multi-signature support.'),
-- Project 3 comments (3 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'AI Research Lab' LIMIT 1), (SELECT id FROM users WHERE email = 'michael.chen@example.com' LIMIT 1), 'ML pipeline is processing data efficiently. We can now focus on model training.'),
(UUID(), (SELECT id FROM projects WHERE name = 'AI Research Lab' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1), 'Neural network training requires significant computational resources. GPU cluster is ready.'),
(UUID(), (SELECT id FROM projects WHERE name = 'AI Research Lab' LIMIT 1), (SELECT id FROM users WHERE email = 'tom.anderson@example.com' LIMIT 1), 'Model API needs to handle high concurrency. We should implement request queuing.'),
-- Project 4 comments (5 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'IoT Device Management' LIMIT 1), (SELECT id FROM users WHERE email = 'michael.chen@example.com' LIMIT 1), 'Device registration system is working perfectly. All devices are being tracked correctly.'),
(UUID(), (SELECT id FROM projects WHERE name = 'IoT Device Management' LIMIT 1), (SELECT id FROM users WHERE email = 'lisa.wong@example.com' LIMIT 1), 'Real-time streaming is handling thousands of devices without issues. Great performance!'),
(UUID(), (SELECT id FROM projects WHERE name = 'IoT Device Management' LIMIT 1), (SELECT id FROM users WHERE email = 'tom.anderson@example.com' LIMIT 1), 'Device control interface is intuitive. Users can easily manage their devices.'),
(UUID(), (SELECT id FROM projects WHERE name = 'IoT Device Management' LIMIT 1), (SELECT id FROM users WHERE email = 'lisa.wong@example.com' LIMIT 1), 'Alert system is detecting anomalies accurately. False positive rate is very low.'),
(UUID(), (SELECT id FROM projects WHERE name = 'IoT Device Management' LIMIT 1), (SELECT id FROM users WHERE email = 'michael.chen@example.com' LIMIT 1), 'Dashboard visualization provides excellent insights. Very user-friendly.'),
-- Project 5 comments (2 comments)
(UUID(), (SELECT id FROM projects WHERE name = 'Data Analytics Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'michael.chen@example.com' LIMIT 1), 'Data warehouse setup requires careful planning for scalability. We should use columnar storage.'),
(UUID(), (SELECT id FROM projects WHERE name = 'Data Analytics Platform' LIMIT 1), (SELECT id FROM users WHERE email = 'sarah.kim@example.com' LIMIT 1), 'ETL pipeline design should support incremental data loading for efficiency.');

-- =========================
-- TASK_TAGS (1-5 tags per task - using new tag names)
-- =========================
INSERT IGNORE INTO task_tags (task_id, tag_id) VALUES
-- Project 1 tasks
((SELECT id FROM tasks WHERE title = 'Setup Kubernetes Cluster' LIMIT 1), (SELECT id FROM tags WHERE name = 'cloud' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Setup Kubernetes Cluster' LIMIT 1), (SELECT id FROM tags WHERE name = 'microservices' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Setup Kubernetes Cluster' LIMIT 1), (SELECT id FROM tags WHERE name = 'deployment' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Implement Auto-scaling' LIMIT 1), (SELECT id FROM tags WHERE name = 'cloud' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Implement Auto-scaling' LIMIT 1), (SELECT id FROM tags WHERE name = 'scalability' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Implement Auto-scaling' LIMIT 1), (SELECT id FROM tags WHERE name = 'automation' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Configure Load Balancer' LIMIT 1), (SELECT id FROM tags WHERE name = 'cloud' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Configure Load Balancer' LIMIT 1), (SELECT id FROM tags WHERE name = 'reliability' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Setup Monitoring System' LIMIT 1), (SELECT id FROM tags WHERE name = 'monitoring' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Setup Monitoring System' LIMIT 1), (SELECT id FROM tags WHERE name = 'logging' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Implement Caching Layer' LIMIT 1), (SELECT id FROM tags WHERE name = 'caching' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Implement Caching Layer' LIMIT 1), (SELECT id FROM tags WHERE name = 'performance' LIMIT 1)),
-- Project 2 tasks
((SELECT id FROM tasks WHERE title = 'Design Blockchain Architecture' LIMIT 1), (SELECT id FROM tags WHERE name = 'blockchain' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Design Blockchain Architecture' LIMIT 1), (SELECT id FROM tags WHERE name = 'microservices' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Implement Smart Contracts' LIMIT 1), (SELECT id FROM tags WHERE name = 'blockchain' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Implement Smart Contracts' LIMIT 1), (SELECT id FROM tags WHERE name = 'compliance' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Build Consensus Algorithm' LIMIT 1), (SELECT id FROM tags WHERE name = 'blockchain' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Build Consensus Algorithm' LIMIT 1), (SELECT id FROM tags WHERE name = 'reliability' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Create Wallet System' LIMIT 1), (SELECT id FROM tags WHERE name = 'blockchain' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Create Wallet System' LIMIT 1), (SELECT id FROM tags WHERE name = 'security' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Security Audit' LIMIT 1), (SELECT id FROM tags WHERE name = 'audit' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Security Audit' LIMIT 1), (SELECT id FROM tags WHERE name = 'compliance' LIMIT 1)),
-- Project 3 tasks
((SELECT id FROM tasks WHERE title = 'Setup ML Pipeline' LIMIT 1), (SELECT id FROM tags WHERE name = 'ai' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Setup ML Pipeline' LIMIT 1), (SELECT id FROM tags WHERE name = 'machine-learning' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Setup ML Pipeline' LIMIT 1), (SELECT id FROM tags WHERE name = 'data-science' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Train Neural Networks' LIMIT 1), (SELECT id FROM tags WHERE name = 'ai' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Train Neural Networks' LIMIT 1), (SELECT id FROM tags WHERE name = 'machine-learning' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Build Model API' LIMIT 1), (SELECT id FROM tags WHERE name = 'ai' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Build Model API' LIMIT 1), (SELECT id FROM tags WHERE name = 'microservices' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Data Preprocessing' LIMIT 1), (SELECT id FROM tags WHERE name = 'data-science' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Data Preprocessing' LIMIT 1), (SELECT id FROM tags WHERE name = 'automation' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Model Evaluation' LIMIT 1), (SELECT id FROM tags WHERE name = 'ai' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Model Evaluation' LIMIT 1), (SELECT id FROM tags WHERE name = 'data-science' LIMIT 1)),
-- Project 4 tasks
((SELECT id FROM tasks WHERE title = 'Device Registration System' LIMIT 1), (SELECT id FROM tags WHERE name = 'iot' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Device Registration System' LIMIT 1), (SELECT id FROM tags WHERE name = 'automation' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Real-time Data Streaming' LIMIT 1), (SELECT id FROM tags WHERE name = 'iot' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Real-time Data Streaming' LIMIT 1), (SELECT id FROM tags WHERE name = 'messaging' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Real-time Data Streaming' LIMIT 1), (SELECT id FROM tags WHERE name = 'queue' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Device Control Interface' LIMIT 1), (SELECT id FROM tags WHERE name = 'iot' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Device Control Interface' LIMIT 1), (SELECT id FROM tags WHERE name = 'workflow' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Alert System' LIMIT 1), (SELECT id FROM tags WHERE name = 'iot' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Alert System' LIMIT 1), (SELECT id FROM tags WHERE name = 'monitoring' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Dashboard Visualization' LIMIT 1), (SELECT id FROM tags WHERE name = 'iot' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Dashboard Visualization' LIMIT 1), (SELECT id FROM tags WHERE name = 'data-science' LIMIT 1)),
-- Project 5 tasks
((SELECT id FROM tasks WHERE title = 'Data Warehouse Setup' LIMIT 1), (SELECT id FROM tags WHERE name = 'data-science' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Data Warehouse Setup' LIMIT 1), (SELECT id FROM tags WHERE name = 'migration' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'ETL Pipeline Development' LIMIT 1), (SELECT id FROM tags WHERE name = 'data-science' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'ETL Pipeline Development' LIMIT 1), (SELECT id FROM tags WHERE name = 'automation' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'ETL Pipeline Development' LIMIT 1), (SELECT id FROM tags WHERE name = 'workflow' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Analytics Dashboard' LIMIT 1), (SELECT id FROM tags WHERE name = 'data-science' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Report Generation' LIMIT 1), (SELECT id FROM tags WHERE name = 'data-science' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Report Generation' LIMIT 1), (SELECT id FROM tags WHERE name = 'automation' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Data Export Tools' LIMIT 1), (SELECT id FROM tags WHERE name = 'data-science' LIMIT 1)),
((SELECT id FROM tasks WHERE title = 'Data Export Tools' LIMIT 1), (SELECT id FROM tags WHERE name = 'migration' LIMIT 1));

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
