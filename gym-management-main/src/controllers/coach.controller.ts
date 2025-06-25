import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Coach from '../models/Coach.model';
import Feedback from '../models/Feedbacks.model';
import Workout, { WorkoutStatus } from '../models/Workouts.model';
import { format, parse, isToday, isBefore, isValid, isAfter } from 'date-fns';
import User from '../models/User';



/// Fetch all coaches
/// @route GET /dev/coaches
export const getAllCoaches = async (req: Request, res: Response): Promise<void> => {
  try {
    const coaches = await Coach.find();
    if (!coaches || coaches.length === 0) {
      res.status(204).json({ message: 'No coaches available' });
      return;
    }
    res.status(200).json(coaches);
  } catch (error) {
    console.error('Error fetching coaches:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


/// Fetch a coach by ID
/// @route GET /dev/coaches/:coachId
export const getCoachById = async (req: Request, res: Response): Promise<void> => {
  const { coachId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(coachId)) {
    res.status(400).json({ message: 'Invalid coach ID format' });
    return;
  }

  try {
    const coach = await Coach.findById(coachId);
    if (!coach) {
      res.status(404).json({ message: 'Coach not found' });
      return;
    }
    res.status(200).json(coach);
  } catch (error) {
    console.error('Error fetching coach by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



/// Fetch feedbacks for a specific coach
/// @route GET /dev/coaches/:coachId/feedbacks
export const getCoachFeedbacks = async (req: Request, res: Response): Promise<void> => {
  const { coachId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(coachId)) {
    res.status(400).json({ message: 'Invalid coach ID format.' });
    return;
  }

  try {
    const coach = await Coach.findById(coachId);
    if (!coach) {
      res.status(404).json({ message: 'Coach not found.' });
      return;
    }

    console.log(User);
    console.log('Registered models:', mongoose.modelNames());
    const feedbacks = await Feedback.find({ coachId })
      .populate('clientId', 'firstName')
      .lean();

    const clientIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIwLjc1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNpcmNsZS11c2VyLXJvdW5kLWljb24gbHVjaWRlLWNpcmNsZS11c2VyLXJvdW5kIj48cGF0aCBkPSJNMTggMjBhNiA2IDAgMCAwLTEyIDAiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSI0Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48L3N2Zz4='; 

    const response = feedbacks.map(fb => {
      const client = fb.clientId as { firstName?: string; };
      // console.log('Client:', client);
      return {
        clientImageUrl: clientIcon,
        clientName: client?.firstName || 'Unknown',
        date: new Date(fb.createdAt).toLocaleDateString('en-US'),
        id: fb._id.toString(),
        message: fb.comment,
        rating: fb.rating.toString(),
      };
    });
    

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching coach feedbacks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


/// Fetch available slots for a specific coach on a specific date
/// @route GET /dev/coaches/:coachId/available-slots/:date

const allPossibleTimes = [
  '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00'
];

export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  const { coachId, date } = req.params;

  if (!mongoose.Types.ObjectId.isValid(coachId)) {
    res.status(400).json({ message: 'Invalid coach ID format.' });
    return;
  }

  // Validate date format: dd-mm-yyyy
  const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
  if (!dateRegex.test(date)) {
    res.status(400).json({ message: 'Invalid date format. Use DD-MM-YYYY.' });
    return;
  }

  // Convert dd-mm-yyyy → yyyy-mm-dd for proper JS parsing
  const [dd, mm, yyyy] = date.split('-');
  const parsedDate = new Date(`${yyyy}-${mm}-${dd}T00:00:00+05:30`);
  const today = new Date();

  // Reject past dates
  const strippedToday = new Date(today.toDateString());
  const strippedParsedDate = new Date(parsedDate.toDateString());
  if (isBefore(strippedParsedDate, strippedToday)) {
    res.status(400).json({ message: 'Cannot fetch slots for past dates.' });
    return;
  }

  try {
    const coach = await Coach.findById(coachId);
    if (!coach) {
      res.status(404).json({ message: 'Coach not found.' });
      return;
    }

    // Fetch booked slots
    const bookedWorkouts = await Workout.find({
      coachId,
      date, // Store & compare in "dd-mm-yyyy"
      coachStatus: WorkoutStatus.SCHEDULED,
      clientStatus: WorkoutStatus.SCHEDULED,
    });

    const bookedTimes = bookedWorkouts.map(w => w.time);

    // Filter times
    const availableTimes = allPossibleTimes.filter(time => {
      if (bookedTimes.includes(time)) return false;

      // If today, skip past time
      if (strippedParsedDate.getTime() === strippedToday.getTime()) {
        const [hour, minute] = time.split(':').map(Number);
        const slotTime = new Date();
        slotTime.setHours(hour, minute, 0, 0);
        if (isBefore(slotTime, today)) return false;
      }

      return true;
    });

    // Format response
    const formattedSlots = availableTimes.map(time => {
      const [hourStr] = time.split(':');
      const startHour = parseInt(hourStr);
      const endHour = startHour + 1;
      const formatHour = (h: number) => h % 12 === 0 ? 12 : h % 12;
      const period = startHour >= 12 ? 'PM' : 'AM';
      return `${formatHour(startHour)}:00-${formatHour(endHour)}:00 ${period}`;
    });

    if(formattedSlots.length === 0) {
      res.status(204).json({ message: 'No slots available for the selected date.' });
      return;
    }

    res.status(200).json({
      message: 'Slots available for the selected date',
      'availableSlots': formattedSlots,
    });

  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


/// Fetch upcoming workouts for a specific coach and client
/// @route GET /dev/coaches/:coachId/upcoming-workouts/:clientId
export const getUpcomingWorkouts = async (req: Request, res: Response): Promise<void> => {
  const { coachId, clientId } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(coachId) || !mongoose.Types.ObjectId.isValid(clientId)) {
    res.status(400).json({ message: 'Invalid coach or client ID format' });
    return;
  }

  try {
    // Fetch all workouts between this coach and client that are still scheduled
    const allWorkouts = await Workout.find({
      coachId,
      clientId,
      coachStatus: 'Scheduled',
      clientStatus: 'Scheduled',
    });

    const now = new Date();

    // Filter future workouts
    const upcoming = allWorkouts.filter(workout => {
      const workoutDateTime = parse(
        `${workout.date} ${workout.time}`,
        'dd-MM-yyyy HH:mm',
        new Date()
      );
      return isAfter(workoutDateTime, now);
    });

    if (upcoming.length === 0) {
      res.status(200).json({ message: 'No upcoming workouts booked' });
      return;
    }

    // Sort workouts by latest first
    const sortedUpcoming = upcoming.sort((a, b) => {
      const dateA = parse(`${a.date} ${a.time}`, 'dd-MM-yyyy HH:mm', new Date());
      const dateB = parse(`${b.date} ${b.time}`, 'dd-MM-yyyy HH:mm', new Date());
      return dateA.getTime() - dateB.getTime(); 
    });

    // Format to "May 7, 01:00 PM"
    const formattedTimes = sortedUpcoming.map(workout => {
      const workoutDateTime = parse(
        `${workout.date} ${workout.time}`,
        'dd-MM-yyyy HH:mm',
        new Date()
      );
      return format(workoutDateTime, 'MMM d, hh:mm a');
    });

    res.status(200).json({
      type: sortedUpcoming[0].type, 
      upcomingWorkouts: formattedTimes
    });
  } catch (error) {
    console.error('Error fetching upcoming workouts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};