import 'dotenv/config'; 
import app from './app.js';
import { seedSystemConfig } from './services/settings.service.js';
import { seedAdminUser } from './services/userService.js';

const PORT = process.env.PORT || 5000;

// Automate initial seeding
const runSeeds = async () => {
  try {
    await seedSystemConfig();
    await seedAdminUser();
    console.log('Database seeding checked/completed.');
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

runSeeds();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
