require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // For password hashing

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Initialize MySQL Database Pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'viron_bookkeeping_db',
  connectionLimit: 10, // Maximum number of connections in the pool
  acquireTimeoutMillis: 60000, // Timeout for acquiring a connection
  connectTimeout: 60000 // Connection timeout
});

// Test the connection pool
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    console.log('Please make sure MySQL is running and the database exists.');
    process.exit(1);
  } else {
    console.log('Connected to MySQL database viron_bookkeeping_db');
    connection.release(); // Release the test connection back to the pool
    initializeDatabase();
  }
});

// Database Schema
function initializeDatabase() {
  // Users table
  db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      plain_password VARCHAR(255),
      role ENUM('client', 'bookkeeper') NOT NULL,
      name VARCHAR(255) NOT NULL,
      reset_token VARCHAR(255),
      reset_expires DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err);
  });

  // Add plain_password column if it doesn't exist
  db.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS plain_password VARCHAR(255)
  `, (err) => {
    if (err) console.error('Error adding plain_password column:', err);
  });

  // Add reset_token and reset_expires columns if they don't exist (for existing tables)
  db.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reset_expires DATETIME
  `, (err) => {
    if (err) console.error('Error adding reset columns to users table:', err);
  });

  // Personal info table
  db.query(`
    CREATE TABLE IF NOT EXISTS personal_info (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      full_name VARCHAR(255),
      tin VARCHAR(50),
      birth_date DATE,
      birth_place VARCHAR(255),
      citizenship VARCHAR(100),
      civil_status VARCHAR(50),
      gender VARCHAR(20),
      address TEXT,
      phone VARCHAR(20),
      spouse_name VARCHAR(255),
      spouse_tin VARCHAR(50),
      employment_status ENUM('employed', 'self-employed') DEFAULT 'employed',
      philhealth_number VARCHAR(20),
      sss_number VARCHAR(20),
      pagibig_number VARCHAR(20),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating personal_info table:', err);
  });

  // Add new columns if they don't exist
  db.query(`
    ALTER TABLE personal_info
    ADD COLUMN IF NOT EXISTS employment_status ENUM('employed', 'self-employed') DEFAULT 'employed',
    ADD COLUMN IF NOT EXISTS philhealth_number VARCHAR(20),
    ADD COLUMN IF NOT EXISTS sss_number VARCHAR(20),
    ADD COLUMN IF NOT EXISTS pagibig_number VARCHAR(20)
  `, (err) => {
    if (err) console.error('Error adding new columns to personal_info table:', err);
  });

  // Dependents table
  db.query(`
    CREATE TABLE IF NOT EXISTS dependents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      personal_info_id INT NOT NULL,
      dep_name VARCHAR(255) NOT NULL,
      dep_birth_date DATE,
      dep_relationship VARCHAR(100),
      FOREIGN KEY (personal_info_id) REFERENCES personal_info(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating dependents table:', err);
  });

  // Gross records table
  db.query(`
    CREATE TABLE IF NOT EXISTS gross_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      form_name VARCHAR(255) NOT NULL,
      month VARCHAR(10) NOT NULL,
      gross_income DECIMAL(15,2) NOT NULL,
      computed_tax DECIMAL(15,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating gross_records table:', err);
  });

  // Messages table
  db.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sender_id INT NOT NULL,
      receiver_id INT NOT NULL,
      message TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating messages table:', err);
  });

  // Home stats table
  db.query(`
    CREATE TABLE IF NOT EXISTS home_stats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      stat_name VARCHAR(100) UNIQUE NOT NULL,
      stat_value VARCHAR(255) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating home_stats table:', err);
  });

  // Reminders table
  db.query(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating reminders table:', err);
  });

  // User activities table
  db.query(`
    CREATE TABLE IF NOT EXISTS user_activities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      activity_type VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating user_activities table:', err);
  });

  // Legacy clients table (for backward compatibility)
  db.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating clients table:', err);
  });

  // BIR Forms table
  db.query(`
    CREATE TABLE IF NOT EXISTS bir_forms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      form_name VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating bir_forms table:', err);
  });

  // Documents table
  db.query(`
    CREATE TABLE IF NOT EXISTS documents (
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
    )
  `, (err) => {
    if (err) console.error('Error creating documents table:', err);
  });

  // Insert default BIR forms if they don't exist
  const defaultForms = [
    'BIR Form 1706',
    'BIR Form 1707',
    'BIR Form 2550M',
    'BIR Form 2550Q',
    'BIR Form 2551M',
    'BIR Form 2551Q',
    'BIR Form 2552',
    'BIR Form 2553'
  ];

  defaultForms.forEach(formName => {
    db.query(
      'INSERT IGNORE INTO bir_forms (form_name) VALUES (?)',
      [formName],
      (err) => {
        if (err) console.error(`Error inserting BIR form ${formName}:`, err);
      }
    );
  });

  // Insert default reminders if they don't exist
  const defaultReminders = [
    { date: 'Oct 20, 2025', description: 'Quarterly VAT Return' },
    { date: 'Nov 10, 2025', description: 'Monthly Percentage Tax' },
    { date: 'Dec 31, 2025', description: 'Annual Income Tax Return' }
  ];

  defaultReminders.forEach(reminder => {
    db.query(
      'INSERT IGNORE INTO reminders (date, description) VALUES (?, ?)',
      [reminder.date, reminder.description],
      (err) => {
        if (err) console.error(`Error inserting reminder ${reminder.description}:`, err);
      }
    );
  });


}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ==================== API ENDPOINTS ====================

// Auth endpoints
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = results[0];
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  });
});

app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Generate a unique reset token
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  db.query(
    'UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?',
    [resetToken, resetExpires, email],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Email not found' });
      }
      // In a real app, send email with token. For now, return the token for demo.
      res.json({ message: 'Reset token generated', resetToken });
    }
  );
});

app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;
  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'Token, new password, and confirm password are required' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  db.query(
    'SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()',
    [token],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      const user = results[0];
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      db.query(
        'UPDATE users SET password = ?, plain_password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
        [hashedPassword, newPassword, user.id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: 'Password reset successfully' });
        }
      );
    }
  );
});

app.post('/api/signup', async (req, res) => {
  const { email, password, role, name } = req.body;
  if (!email || !password || !role || !name) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (email, password, plain_password, role, name) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, password, role, name],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: result.insertId, name, email, role });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Personal info endpoints
app.get('/api/personal-info/:userId', (req, res) => {
  const { userId } = req.params;
  db.query('SELECT * FROM personal_info WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.json({}); // Return empty if no info
    }
    const row = results[0];
    // Get dependents
    db.query('SELECT * FROM dependents WHERE personal_info_id = ?', [row.id], (err, deps) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      row.dependents = deps;
      res.json(row);
    });
  });
});

app.post('/api/personal-info/:userId', (req, res) => {
  const { userId } = req.params;
  const info = req.body;
  const { dependents, ...personalData } = info;

  console.log('Received data for userId:', userId);
  console.log('Personal data:', personalData);
  console.log('Dependents:', dependents);

  // Use INSERT ... ON DUPLICATE KEY UPDATE to handle both insert and update
  // Convert empty strings to null for database consistency
  const cleanData = {
    full_name: personalData.full_name || null,
    tin: personalData.tin || null,
    birth_date: personalData.birth_date || null,
    birth_place: personalData.birth_place || null,
    citizenship: personalData.citizenship || null,
    civil_status: personalData.civil_status || null,
    gender: personalData.gender || null,
    address: personalData.address || null,
    phone: personalData.phone || null,
    spouse_name: personalData.spouse_name || null,
    spouse_tin: personalData.spouse_tin || null,
    employment_status: personalData.employment_status || 'employed',
    philhealth_number: personalData.philhealth_number || null,
    sss_number: personalData.sss_number || null,
    pagibig_number: personalData.pagibig_number || null
  };

  const query = `
    INSERT INTO personal_info
      (user_id, full_name, tin, birth_date, birth_place, citizenship, civil_status, gender, address, phone, spouse_name, spouse_tin, employment_status, philhealth_number, sss_number, pagibig_number, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
      full_name = VALUES(full_name),
      tin = VALUES(tin),
      birth_date = VALUES(birth_date),
      birth_place = VALUES(birth_place),
      citizenship = VALUES(citizenship),
      civil_status = VALUES(civil_status),
      gender = VALUES(gender),
      address = VALUES(address),
      phone = VALUES(phone),
      spouse_name = VALUES(spouse_name),
      spouse_tin = VALUES(spouse_tin),
      employment_status = VALUES(employment_status),
      philhealth_number = VALUES(philhealth_number),
      sss_number = VALUES(sss_number),
      pagibig_number = VALUES(pagibig_number),
      updated_at = CURRENT_TIMESTAMP
  `;

  const params = [
    userId,
    cleanData.full_name,
    cleanData.tin,
    cleanData.birth_date,
    cleanData.birth_place,
    cleanData.citizenship,
    cleanData.civil_status,
    cleanData.gender,
    cleanData.address,
    cleanData.phone,
    cleanData.spouse_name,
    cleanData.spouse_tin,
    cleanData.employment_status,
    cleanData.philhealth_number,
    cleanData.sss_number,
    cleanData.pagibig_number
  ];

  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error saving personal info:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Personal info save result:', result);

    // Get the actual personal_info_id
    db.query('SELECT id FROM personal_info WHERE user_id = ?', [userId], (err, rows) => {
      if (err) {
        console.error('Error getting personal_info_id:', err);
        return res.status(500).json({ error: err.message });
      }
      if (rows.length === 0) {
        console.error('No personal_info found for userId:', userId);
        return res.status(500).json({ error: 'Personal info not found' });
      }
      const actualPersonalInfoId = rows[0].id;
      console.log('Actual personal_info_id:', actualPersonalInfoId);

      // Handle dependents - Update existing, insert new, delete removed
      console.log('Processing dependents. Count:', dependents ? dependents.length : 0);

      // Get existing dependent IDs
      db.query('SELECT id FROM dependents WHERE personal_info_id = ?', [actualPersonalInfoId], async (err, existingDeps) => {
        if (err) {
          console.error('Error fetching existing dependents:', err);
          return res.status(500).json({ error: 'Failed to save dependents' });
        }

        const existingIds = existingDeps.map(d => d.id);
        const submittedIds = (dependents || []).filter(d => d.id).map(d => d.id);

        // Find dependents to delete (exist in DB but not in submitted array)
        const idsToDelete = existingIds.filter(id => !submittedIds.includes(id));

        console.log('Existing dependent IDs:', existingIds);
        console.log('Submitted dependent IDs:', submittedIds);
        console.log('IDs to delete:', idsToDelete);

        // Delete removed dependents
        if (idsToDelete.length > 0) {
          const placeholders = idsToDelete.map(() => '?').join(',');
          db.query(
            `DELETE FROM dependents WHERE id IN (${placeholders})`,
            idsToDelete,
            (err) => {
              if (err) console.error('Error deleting dependents:', err);
              else console.log('Deleted dependents:', idsToDelete);
            }
          );
        }

        // Process each dependent (update or insert)
        if (!dependents || dependents.length === 0) {
          console.log('No dependents to save, sending response');
          return res.json({ message: 'Personal info saved' });
        }

        let processedCount = 0;
        dependents.forEach((dep, index) => {
          if (dep.id) {
            // Update existing dependent
            console.log(`Updating dependent ID ${dep.id}:`, dep);
            db.query(
              'UPDATE dependents SET dep_name = ?, dep_birth_date = ?, dep_relationship = ? WHERE id = ? AND personal_info_id = ?',
              [dep.dep_name || null, dep.dep_birth_date || null, dep.dep_relationship || null, dep.id, actualPersonalInfoId],
              (err) => {
                if (err) {
                  console.error('Error updating dependent:', err);
                } else {
                  console.log('Dependent updated successfully');
                }
                processedCount++;
                if (processedCount === dependents.length) {
                  console.log('All dependents processed, sending response');
                  res.json({ message: 'Personal info saved' });
                }
              }
            );
          } else {
            // Insert new dependent
            console.log(`Inserting new dependent ${index}:`, dep);
            db.query(
              'INSERT INTO dependents (personal_info_id, dep_name, dep_birth_date, dep_relationship) VALUES (?, ?, ?, ?)',
              [actualPersonalInfoId, dep.dep_name || null, dep.dep_birth_date || null, dep.dep_relationship || null],
              (err) => {
                if (err) {
                  console.error('Error inserting dependent:', err);
                } else {
                  console.log('Dependent inserted successfully');
                }
                processedCount++;
                if (processedCount === dependents.length) {
                  console.log('All dependents processed, sending response');
                  res.json({ message: 'Personal info saved' });
                }
              }
            );
          }
        });
      });
    });
  });
});

// Gross records endpoints
app.get('/api/gross-records/:userId', (req, res) => {
  const { userId } = req.params;
  db.query('SELECT * FROM gross_records WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/gross-records/:userId', (req, res) => {
  const { userId } = req.params;
  const { form_name, month, gross_income, computed_tax } = req.body;

  db.query(
    'INSERT INTO gross_records (user_id, form_name, month, gross_income, computed_tax) VALUES (?, ?, ?, ?, ?)',
    [userId, form_name, month, gross_income, computed_tax],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Log activity
      db.query(
        'INSERT INTO user_activities (user_id, activity_type, description) VALUES (?, ?, ?)',
        [userId, 'gross_record', `Added gross record for ${form_name} - ${month}`],
        (err) => {
          if (err) console.error('Error logging activity:', err);
        }
      );

      res.json({ id: result.insertId });
    }
  );
});

// Messages endpoints
app.get('/api/messages/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT m.*, u.name as sender_name, u.role as sender_role
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.sender_id = ? OR m.receiver_id = ?
    ORDER BY m.timestamp ASC
  `;
  db.query(query, [userId, userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/messages', (req, res) => {
  const { sender_id, receiver_id, message } = req.body;
  db.query(
    'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
    [sender_id, receiver_id, message],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Log activity for sender
      db.query(
        'INSERT INTO user_activities (user_id, activity_type, description) VALUES (?, ?, ?)',
        [sender_id, 'message_sent', `Sent a message`],
        (err) => {
          if (err) console.error('Error logging activity:', err);
        }
      );

      res.json({ id: result.insertId });
    }
  );
});

// Home stats for bookkeeper
app.get('/api/home-stats', (req, res) => {
  db.query('SELECT * FROM home_stats', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const stats = {};
    rows.forEach(row => {
      stats[row.stat_name] = row.stat_value;
    });
    res.json(stats);
  });
});

// Reminders endpoint
app.get('/api/reminders', (req, res) => {
  db.query('SELECT * FROM reminders ORDER BY date ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// User activities endpoint
app.get('/api/user-activities/:userId', (req, res) => {
  const { userId } = req.params;
  db.query('SELECT * FROM user_activities WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10', [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get all clients (for bookkeeper)
app.get('/api/clients', (req, res) => {
  db.query("SELECT id, name, email FROM users WHERE role = 'client' ORDER BY name", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get all users (for admin/bookkeeper views)
app.get('/api/users', (req, res) => {
  db.query('SELECT id, name, email, role FROM users ORDER BY name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get client accounts with passwords (for bookkeeper management)
app.get('/api/client-accounts', (req, res) => {
  db.query('SELECT id, name, email, plain_password FROM users WHERE role = ? ORDER BY name', ['client'], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get all BIR forms
app.get('/api/bir-forms', (req, res) => {
  db.query('SELECT * FROM bir_forms ORDER BY form_name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Add new BIR form
app.post('/api/bir-forms', (req, res) => {
  const { form_name } = req.body;

  if (!form_name) {
    return res.status(400).json({ error: 'Form name is required' });
  }

  db.query(
    'INSERT INTO bir_forms (form_name) VALUES (?)',
    [form_name],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Form already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: result.insertId, form_name });
    }
  );
});

// Upload documents
app.post('/api/upload', upload.array('files'), (req, res) => {
  const { client_id, form_name, quarter, year } = req.body;

  if (!client_id || !form_name || !quarter || !year) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Get form_id first
  db.query(
    'SELECT id FROM bir_forms WHERE form_name = ?',
    [form_name],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(400).json({ error: 'Invalid form name' });
      }

      const form_id = results[0].id;
      const uploadedFiles = [];

      // Insert each file into database
      let processed = 0;
      req.files.forEach((file) => {
        db.query(
          `INSERT INTO documents (user_id, form_id, file_name, file_path, quarter, year)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [client_id, form_id, file.originalname, file.filename, quarter, year],
          (err, result) => {
            if (err) {
              console.error('Error inserting document:', err);
            } else {
              uploadedFiles.push({
                id: result.insertId,
                fileName: file.originalname,
                fileURL: `/uploads/${file.filename}`,
                quarter,
                year
              });

              // Log activity
              db.query(
                'INSERT INTO user_activities (user_id, activity_type, description) VALUES (?, ?, ?)',
                [client_id, 'document_upload', `Uploaded ${file.originalname} for ${form_name}`],
                (err) => {
                  if (err) console.error('Error logging activity:', err);
                }
              );
            }

            processed++;
            if (processed === req.files.length) {
              res.json({ files: uploadedFiles });
            }
          }
        );
      });
    }
  );
});

// Get documents for a specific client and form
app.get('/api/documents/:clientId/:formName', (req, res) => {
  const { clientId, formName } = req.params;

  const query = `
    SELECT d.id, d.file_name, d.file_path, d.quarter, d.year, d.uploaded_at
    FROM documents d
    JOIN bir_forms f ON d.form_id = f.id
    WHERE d.user_id = ? AND f.form_name = ?
    ORDER BY d.year DESC, d.quarter DESC
  `;

  db.query(query, [clientId, formName], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const documents = rows.map(row => ({
      id: row.id,
      fileName: row.file_name,
      fileURL: `/uploads/${row.file_path}`,
      quarter: row.quarter,
      year: row.year,
      uploadedAt: row.uploaded_at
    }));

    res.json(documents);
  });
});

// Get all documents (for bookkeeper/admin view)
app.get('/api/documents', (req, res) => {
  const query = `
    SELECT d.id, d.file_name, d.file_path, d.quarter, d.year, d.uploaded_at, f.form_name, u.name as client_name
    FROM documents d
    JOIN bir_forms f ON d.form_id = f.id
    JOIN users u ON d.user_id = u.id
    ORDER BY u.name, f.form_name, d.year DESC, d.quarter DESC
  `;

  db.query(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Organize by client and form
    const documentsByClient = {};
    rows.forEach(row => {
      const clientKey = row.client_name;
      if (!documentsByClient[clientKey]) {
        documentsByClient[clientKey] = {};
      }
      if (!documentsByClient[clientKey][row.form_name]) {
        documentsByClient[clientKey][row.form_name] = [];
      }
      documentsByClient[clientKey][row.form_name].push({
        id: row.id,
        fileName: row.file_name,
        fileURL: `/uploads/${row.file_path}`,
        quarter: row.quarter,
        year: row.year,
        uploadedAt: row.uploaded_at
      });
    });

    res.json(documentsByClient);
  });
});

// Get all documents for a client (organized by form)
app.get('/api/documents/:clientId', (req, res) => {
  const { clientId } = req.params;

  const query = `
    SELECT d.id, d.file_name, d.file_path, d.quarter, d.year, d.uploaded_at, f.form_name
    FROM documents d
    JOIN bir_forms f ON d.form_id = f.id
    WHERE d.user_id = ?
    ORDER BY f.form_name, d.year DESC, d.quarter DESC
  `;

  db.query(query, [clientId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Organize by form name
    const documentsByForm = {};
    rows.forEach(row => {
      if (!documentsByForm[row.form_name]) {
        documentsByForm[row.form_name] = [];
      }
      documentsByForm[row.form_name].push({
        id: row.id,
        fileName: row.file_name,
        fileURL: `/uploads/${row.file_path}`,
        quarter: row.quarter,
        year: row.year,
        uploadedAt: row.uploaded_at
      });
    });

    res.json(documentsByForm);
  });
});



// Calculate due dates for government contributions
app.get('/api/due-dates/:userId', (req, res) => {
  const { userId } = req.params;

  // Get user's personal info including employment status and membership numbers
  db.query('SELECT employment_status, philhealth_number, sss_number, pagibig_number FROM personal_info WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.json({ dueDates: [] });
    }

    const userInfo = results[0];
    const dueDates = [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = now.getFullYear();

    // Helper function to get last day of month
    const getLastDayOfMonth = (year, month) => {
      return new Date(year, month, 0).getDate();
    };

    // Helper function to get first day of next quarter
    const getFirstDayOfNextQuarter = (year, month) => {
      const quarter = Math.ceil(month / 3);
      const nextQuarter = quarter === 4 ? 1 : quarter + 1;
      const nextYear = quarter === 4 ? year + 1 : year;
      const firstMonthOfQuarter = (nextQuarter - 1) * 3 + 1;
      return { year: nextYear, month: firstMonthOfQuarter, day: 1 };
    };

    // PhilHealth due dates
    if (userInfo.philhealth_number) {
      if (userInfo.employment_status === 'employed') {
        // For employed: 15th or 20th of next month based on last digit of PhilHealth number
        const lastDigit = parseInt(userInfo.philhealth_number.slice(-1));
        const dueDay = lastDigit >= 1 && lastDigit <= 5 ? 15 : 20;
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const dueYear = currentMonth === 12 ? currentYear + 1 : currentYear;

        dueDates.push({
          agency: 'PhilHealth',
          description: `PhilHealth contribution payment (Employed) - Form PMRF, ER2`,
          dueDate: `${dueYear}-${String(nextMonth).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`,
          membershipNumber: userInfo.philhealth_number
        });
      } else if (userInfo.employment_status === 'self-employed') {
        // For self-employed: last day of current month or quarter
        const lastDay = getLastDayOfMonth(currentYear, currentMonth);
        dueDates.push({
          agency: 'PhilHealth',
          description: `PhilHealth contribution payment (Self-employed) - Form PMRF, PPP5`,
          dueDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
          membershipNumber: userInfo.philhealth_number
        });
      }
    }

    // SSS due dates
    if (userInfo.sss_number) {
      // Both employed and self-employed: last day of next month
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const dueYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      const lastDay = getLastDayOfMonth(dueYear, nextMonth);

      const forms = userInfo.employment_status === 'employed'
        ? 'Form R-1, R-1A, R-3'
        : 'Form RS-1, RS-5';

      dueDates.push({
        agency: 'SSS',
        description: `SSS contribution payment (${userInfo.employment_status === 'employed' ? 'Employed' : 'Self-employed'}) - ${forms}`,
        dueDate: `${dueYear}-${String(nextMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
        membershipNumber: userInfo.sss_number
      });
    }

    // Pag-IBIG due dates
    if (userInfo.pagibig_number) {
      if (userInfo.employment_status === 'employed' || userInfo.employment_status === 'self-employed') {
        // For both: 10th of next month, or optionally first month of next quarter for self-employed
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const dueYear = currentMonth === 12 ? currentYear + 1 : currentYear;

        const forms = userInfo.employment_status === 'employed'
          ? 'Form ER1, MDF, MRS'
          : 'Form MDF, POF';

        dueDates.push({
          agency: 'Pag-IBIG',
          description: `Pag-IBIG contribution payment (${userInfo.employment_status === 'employed' ? 'Employed' : 'Self-employed'}) - ${forms}`,
          dueDate: `${dueYear}-${String(nextMonth).padStart(2, '0')}-10`,
          membershipNumber: userInfo.pagibig_number
        });

        // Optional quarterly payment for self-employed
        if (userInfo.employment_status === 'self-employed') {
          const nextQuarter = getFirstDayOfNextQuarter(currentYear, currentMonth);
          dueDates.push({
            agency: 'Pag-IBIG',
            description: `Pag-IBIG contribution payment (Quarterly Option) - Form MDF, POF`,
            dueDate: `${nextQuarter.year}-${String(nextQuarter.month).padStart(2, '0')}-${String(nextQuarter.day).padStart(2, '0')}`,
            membershipNumber: userInfo.pagibig_number
          });
        }
      }
    }

    // Filter for current month and future due dates only
    const currentMonthDueDates = dueDates.filter(dueDate => {
      const dueDateObj = new Date(dueDate.dueDate);
      return dueDateObj >= now;
    });

    res.json({ dueDates: currentMonthDueDates });
  });
});

// Download document
app.get('/api/download/:documentId', (req, res) => {
  const { documentId } = req.params;

  db.query(
    'SELECT file_path, file_name FROM documents WHERE id = ?',
    [documentId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const row = results[0];
      const filePath = path.join(__dirname, 'uploads', row.file_path);

      res.download(filePath, row.file_name, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          res.status(500).json({ error: 'Error downloading file' });
        }
      });
    }
  );
});

// Delete document
app.delete('/api/documents/:documentId', (req, res) => {
  const { documentId } = req.params;

  // First get the file path
  db.query(
    'SELECT file_path FROM documents WHERE id = ?',
    [documentId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const row = results[0];

      // Delete the file from filesystem
      const filePath = path.join(__dirname, 'uploads', row.file_path);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        }
      });

      // Delete from database
      db.query(
        'DELETE FROM documents WHERE id = ?',
        [documentId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: 'Document deleted successfully' });
        }
      );
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.end((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection pool closed');
    process.exit(0);
  });
});
