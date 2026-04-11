import 'dotenv/config'; 
import app from './app.js';
import chargeRoutes from './routes/charge.routes.js';
import houseRoutes from './routes/house.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import remindersRoutes from './routes/reminders.routes.js';
import residentRoutes from './routes/resident.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import bankRoutes from './routes/bank.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import reportsRoutes from './routes/reports.routes.js';
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
