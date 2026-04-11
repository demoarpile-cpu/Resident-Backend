import mysql from 'mysql2/promise';

async function main() {
  try {
    console.log('Attempting connection to 127.0.0.1:3307...');
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3307,
      user: 'root',
      password: '',
    });
    console.log('✅ Connected to MySQL 3307!');
    const [rows] = await connection.query('SHOW DATABASES;');
    console.log('Databases:', rows.map(r => r.Database));
    
    // Check if resident_db exists
    const dbExists = rows.some(r => r.Database === 'resident_db');
    if (!dbExists) {
        console.log('⚠️ Database "resident_db" does NOT exist. Creating it...');
        await connection.query('CREATE DATABASE resident_db');
        console.log('✅ Created database "resident_db"');
    } else {
        console.log('✅ Database "resident_db" exists!');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

main();
