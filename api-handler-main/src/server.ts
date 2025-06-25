// server.ts
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { createProxy } from "./proxy/proxy"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8051;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://frontend-app-run8-1-team3-fe-app-fe-env.development.krci-dev.cloudmentor.academy',    
    'http://team3-energyx-bucket.s3-website.eu-west-3.amazonaws.com'
  ],
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());

// Service Proxies (reverse proxy setup)
app.use('/booking', createProxy(process.env.BOOKING_MANAGEMENT_BASE_URL || "", "booking"));
app.use('/user', createProxy(process.env.AUTH_SERVICE_BASE_URL || "", "userService"));
app.use('/gym', createProxy(process.env.GYM_MANAGEMENT_BASE_URL || "", "gym"));
app.use('/reports', createProxy(process.env.GYM_REPORTS_BASE_URL || "", "reports"));

// Fallback for undefined routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running at http://localhost:${PORT}`);
});
