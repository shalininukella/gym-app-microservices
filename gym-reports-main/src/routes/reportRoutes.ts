import { Router } from 'express';
import { getPerformanceReport, triggerWeeklyReports } from '../controllers/reportController';

const router = Router();

// Wrap the controller with a middleware handler to properly handle async functions
router.get('/performance', (req, res, next) => {
  getPerformanceReport(req, res, next)
    .catch(next);
});

// Manual trigger for weekly reports (useful for testing)
router.post('/trigger-weekly', (req, res, next) => {
  triggerWeeklyReports(req, res, next)
    .catch(next);
});

export default router;