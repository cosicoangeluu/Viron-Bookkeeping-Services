-- MySQL schema for bookkeeping app

-- Users table for authentication
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- In production, hash this
  role ENUM('client', 'bookkeeper') NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Personal info table (extends clients)
CREATE TABLE personal_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  full_name VARCHAR(255),
  tin VARCHAR(255),
  birth_date DATE,
  birth_place VARCHAR(255),
  citizenship VARCHAR(255),
  civil_status VARCHAR(255),
  gender VARCHAR(255),
  address TEXT,
  phone VARCHAR(255),
  spouse_name VARCHAR(255),
  spouse_tin VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Dependents table
CREATE TABLE dependents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  personal_info_id INT NOT NULL,
  dep_name VARCHAR(255) NOT NULL,
  dep_birth_date DATE,
  dep_relationship VARCHAR(255),
  FOREIGN KEY (personal_info_id) REFERENCES personal_info(id) ON DELETE CASCADE
);

-- Gross records table
CREATE TABLE gross_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  form_name VARCHAR(255) NOT NULL,
  month VARCHAR(255) NOT NULL,
  gross_income DECIMAL(10,2) NOT NULL,
  computed_tax DECIMAL(10,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages table for requests/chat
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Home stats table (for bookkeeper dashboard)
CREATE TABLE home_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stat_name VARCHAR(255) UNIQUE NOT NULL,
  stat_value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Documents table for file uploads
CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  form_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  quarter VARCHAR(10) NOT NULL,
  year INT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (form_id) REFERENCES bir_forms(id) ON DELETE CASCADE
);
