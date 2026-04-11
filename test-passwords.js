import mysql from 'mysql2/promise';

async function test(password) {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: password,
    });
    console.log(`✅ SUCCESS with password: "${password}"`);
    await connection.end();
  } catch (error) {
    console.log(`❌ FAILED with password: "${password}". Error: ${error.message}`);
  }
}

test('root');
test('');
test('admin');
