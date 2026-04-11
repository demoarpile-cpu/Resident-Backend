import mysql from 'mysql2/promise';

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
    });
    console.log('✅ Connected to MySQL 3306!');
    const [rows] = await connection.query('SHOW DATABASES;');
    console.log('Databases:', rows.map(r => r.Database));
    await connection.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

main();
