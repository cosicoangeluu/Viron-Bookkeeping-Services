const mysql = require('mysql2');

// Connect to database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'viron_bookkeeping_db'
});

db.connect((err) => {
  if (err) {
    console.error(' Error connecting to MySQL:', err.message);
    console.log('\n Make sure MySQL is running!');
    process.exit(1);
  }

  console.log(' Connected to MySQL database\n');

  // Check all users
  db.query('SELECT id, name, email, role FROM users', (err, users) => {
    if (err) {
      console.error(' Error fetching users:', err.message);
      db.end();
      return;
    }

    console.log('Users in database:');
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });

    // Check personal info for each user
    db.query('SELECT * FROM personal_info', (err, personalInfo) => {
      if (err) {
        console.error('Error fetching personal info:', err.message);
        db.end();
        return;
      }

      console.log('\n Personal Info in database:');
      if (personalInfo.length === 0) {
        console.log('   No personal info records found!');
      } else {
        personalInfo.forEach(info => {
          console.log(`\n  User ID: ${info.user_id}`);
          console.log(`    Full Name: "${info.full_name}"`);
          console.log(`    TIN: "${info.tin}"`);
          console.log(`    Birth Date: "${info.birth_date}"`);
          console.log(`    Birth Place: "${info.birth_place}"`);
          console.log(`    Citizenship: "${info.citizenship}"`);
          console.log(`    Civil Status: "${info.civil_status}"`);
          console.log(`    Gender: "${info.gender}"`);
          console.log(`    Address: "${info.address}"`);
          console.log(`    Phone: "${info.phone}"`);
          console.log(`    Spouse Name: "${info.spouse_name}"`);
          console.log(`    Spouse TIN: "${info.spouse_tin}"`);
        });
      }

      db.end();
      console.log('\n Database check complete!');
    });
  });
});
