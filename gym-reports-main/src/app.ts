import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { connectToDatabase } from './config/db';
import reportRoutes from './routes/reportRoutes';
import errorHandler from './middlewares/errorHandler';
import SchedulerService from './services/schedulerService';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(json());

// Routes
app.use('/api/reports', reportRoutes);

// Error handling middleware
app.use(errorHandler);

// Initialize scheduler for weekly reports
const scheduler = new SchedulerService();
scheduler.init();

// Database connection
connectToDatabase();

export default app;