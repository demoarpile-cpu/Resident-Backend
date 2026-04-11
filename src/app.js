import express from 'express';
import paymentRoutes from './routes/payment.routes.js';
import residentRoutes from './routes/resident.routes.js';
import houseRoutes from './routes/house.routes.js';
import chargeRoutes from './routes/charge.routes.js';
import bankRoutes from './routes/bank.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import remindersRoutes from './routes/reminders.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import noteRoutes from './routes/note.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import userRoutes from './routes/user.routes.js';

import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images

// Debug Logger to track all requests
app.use((req, res, next) => {
  console.log(`[DEBUG] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/payments", paymentRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/charges", chargeRoutes);
app.use("/api/bank", bankRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reminders", remindersRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/user", userRoutes);

export default app;
