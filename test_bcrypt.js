import bcrypt from 'bcryptjs';

async function test() {
  const password = '123456';
  const hash = '$2b$10$nBZ/fhMev2qkYNLe2yAMguYC3ZRi2k0QfwNWHkBzPQAOHHX.0d0sS';
  const match = await bcrypt.compare(password, hash);
  console.log('Password Match:', match);
}

test();
