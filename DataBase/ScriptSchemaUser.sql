CREATE DATABASE gpa;
CREATE USER 'gpa_system' IDENTIFIED BY 'contrasena';
GRANT ALL PRIVILEGES ON gpa.* TO 'gpa_system'@'%';
SHOW GRANTS FOR 'gpa_system';