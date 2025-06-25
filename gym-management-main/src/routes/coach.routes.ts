import express from 'express';
import { getAllCoaches, getCoachById,getCoachFeedbacks,getAvailableSlots, getUpcomingWorkouts } from '../controllers/coach.controller';
import { validateCoachId } from '../middlewares/coach.middleware'

const router = express.Router();

router.get('/', getAllCoaches);
router.get('/:coachId', validateCoachId, getCoachById);
router.get('/:coachId/feedbacks', validateCoachId, getCoachFeedbacks);
router.get('/:coachId/available-slots/:date', validateCoachId, getAvailableSlots);
router.get('/:coachId/upcoming-workouts/:clientId', getUpcomingWorkouts);

export default router;