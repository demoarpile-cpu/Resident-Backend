import mysql from 'mysql2/promise';

const hosts = ['127.0.0.1', 'localhost'];
const ports = [3306, 3307, 3308];
const passwords = ['', 'root', 'admin', 'password'];

async function testConnection(host, port, password) {
  try {
    const connection = await mysql.createConnection({
      host: host,
      port: port,
      user: 'root',
      password: password,
    });
    console.log(`✅ Connection successful! Host: ${host}, Port: ${port}, Password: "${password}"`);
    
    // Check if resident_db exists
    try {
        await connection.query('USE resident_db');
        console.log('✅ Database "resident_db" found!');
    } catch (dbError) {
        console.log(`⚠️ Database "resident_db" NOT found. Error: ${dbError.message}`);
    }
    
    await connection.end();
    return true;
  } catch (error) {
    // console.log(`❌ Connection failed. Host: ${host}, Port: ${port}, Password: "${password}". Error: ${error.message}`);
    return false;
  }
}

async function bruteForce() {
  for (const host of hosts) {
    for (const port of ports) {
      for (const password of passwords) {
        if (await testConnection(host, port, password)) {
          console.log(`--- SUCCESS: host=${host}, port=${port}, password="${password}" ---`);
          // process.exit(0);
        }
      }
    }
  }
  console.log('--- Brute force finished. ---');
}

bruteForce();
