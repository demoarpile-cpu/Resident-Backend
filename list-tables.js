import mysql from 'mysql2/promise';

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3307,
      user: 'root',
      password: '',
      database: 'resident_db'
    });
    console.log('✅ Connected to resident_db!');
    const [rows] = await connection.query('SHOW TABLES;');
    const tables = rows.map(r => Object.values(r)[0]);
    console.log('Tables:', tables);
    await connection.end();
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

main();
