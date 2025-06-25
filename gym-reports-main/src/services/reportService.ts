import { Types } from 'mongoose';
import Workout from '../models/Workout';
import Coach from '../models/Coach';
import Feedback from '../models/Feedback';
import { ReportFilters, CoachPerformance, SalesStatistics } from '../config/types';
import { calculatePercentageChange, subtractDaysFromDate } from '../utils/dateUtils';

class ReportService {
  /**
   * Generate coach performance report based on provided filters
   */
  async generateCoachPerformanceReport(filters: ReportFilters): Promise<CoachPerformance[]> {
    // Get all coaches
    const coaches = await Coach.find();
    
    // Calculate previous period for comparison
    const periodDuration = this.calculateDateDifference(filters.startDate, filters.endDate);
    const previousPeriodEndDate = subtractDaysFromDate(filters.startDate, 1);
    const previousPeriodStartDate = subtractDaysFromDate(previousPeriodEndDate, periodDuration);
    
    // Generate report for each coach
    const report = await Promise.all(
      coaches.map(async (coach) => {
        // Get current period workouts for this coach
        const currentPeriodWorkouts = await this.getCoachWorkouts(
          coach._id.toString(),
          filters.startDate,
          filters.endDate
        );
        
        // Get previous period workouts for this coach
        const previousPeriodWorkouts = await this.getCoachWorkouts(
          coach._id.toString(),
          previousPeriodStartDate,
          previousPeriodEndDate
        );
        
        // Calculate workout percentage change
        const workoutsPercentChange = calculatePercentageChange(
          previousPeriodWorkouts.length,
          currentPeriodWorkouts.length
        );
        
        // Get feedback data for current period
        const currentFeedbackData = await this.getCoachFeedbackData(
          coach._id.toString(),
          currentPeriodWorkouts.map(workout => workout._id.toString())
        );
        
        // Get feedback data for previous period
        const previousFeedbackData = await this.getCoachFeedbackData(
          coach._id.toString(),
          previousPeriodWorkouts.map(workout => workout._id.toString())
        );
        
        // Calculate min feedback percentage change
        const minFeedbackPercentChange = calculatePercentageChange(
          previousFeedbackData.minRating || 0,
          currentFeedbackData.minRating || 0
        );
        
        const coachName = `${coach.firstName} ${coach.lastName}`;
        // Use coach.email if available, otherwise create a fallback email
        const email = coach.email || `${coach.firstName.toLowerCase()}${coach.lastName.toLowerCase()}@gmail.com`;
        
        return {
          gymLocation: 'Hrushevsky Street, 16, Kyiv', // Default location as specified
          coachName: coachName,
          email: email,
          reportPeriodStart: filters.startDate,
          reportPeriodEnd: filters.endDate,
          noOfWorkouts: currentPeriodWorkouts.length,
          workoutsPercentChange: workoutsPercentChange,
          averageFeedback: currentFeedbackData.averageRating || 0,
          minFeedback: currentFeedbackData.minRating || 0,
          minFeedbackPercentChange: minFeedbackPercentChange
        };
      })
    );
    
    return report;
  }

  /**
   * Generate sales statistics report based on provided filters
   */
  async generateSalesStatisticsReport(filters: ReportFilters): Promise<SalesStatistics[]> {
    // Calculate previous period for comparison
    const periodDuration = this.calculateDateDifference(filters.startDate, filters.endDate);
    const previousPeriodEndDate = subtractDaysFromDate(filters.startDate, 1);
    const previousPeriodStartDate = subtractDaysFromDate(previousPeriodEndDate, periodDuration);
    
    // Get all unique workout types in the date range
    const workouts = await Workout.find({
      date: { $gte: filters.startDate, $lte: filters.endDate },
      clientStatus: { $ne: 'Cancelled' },
      coachStatus: { $ne: 'Cancelled' }
    });
    
    // Extract unique workout types
    const workoutTypes = [...new Set(workouts.map(workout => workout.type))];
    
    // For each workout type, generate a sales statistics entry
    const report = await Promise.all(
      workoutTypes.map(async (workoutType) => {
        // Current period data
        const currentPeriodWorkouts = workouts.filter(w => w.type === workoutType);
        const currentPeriodWorkoutIds = currentPeriodWorkouts.map(w => w._id.toString());
        
        // Previous period data
        const previousPeriodWorkouts = await Workout.find({
          type: workoutType,
          date: { $gte: previousPeriodStartDate, $lte: previousPeriodEndDate },
          clientStatus: { $ne: 'Cancelled' },
          coachStatus: { $ne: 'Cancelled' }
        });
        
        // Calculate client attendance data
        // For this example, we'll use the ratio of finished/total workouts as attendance rate
        const currentFinishedWorkouts = currentPeriodWorkouts.filter(w => w.clientStatus === 'Finished').length;
        const currentAttendanceRate = currentPeriodWorkouts.length > 0 
          ? Math.round((currentFinishedWorkouts / currentPeriodWorkouts.length) * 100)
          : 0;
          
        const previousFinishedWorkouts = previousPeriodWorkouts.filter(w => w.clientStatus === 'Finished').length;
        const previousAttendanceRate = previousPeriodWorkouts.length > 0
          ? Math.round((previousFinishedWorkouts / previousPeriodWorkouts.length) * 100)
          : 0;
          
        const deltaAttendance = calculatePercentageChange(previousAttendanceRate, currentAttendanceRate);
        
        // Get feedback for current period workouts
        const currentFeedbackStats = await this.getWorkoutTypeFeedbackData(
          currentPeriodWorkoutIds
        );
        
        // Get feedback for previous period workouts
        const previousPeriodWorkoutIds = previousPeriodWorkouts.map(w => w._id.toString());
        const previousFeedbackStats = await this.getWorkoutTypeFeedbackData(
          previousPeriodWorkoutIds
        );
        
        // Calculate delta of minimum feedback
        const deltaMinFeedback = calculatePercentageChange(
          previousFeedbackStats.minRating || 0, 
          currentFeedbackStats.minRating || 0
        );
        
        return {
          gymLocation: 'Location 1', // Default location as specified
          workoutType: workoutType,
          reportPeriodStart: filters.startDate,
          reportPeriodEnd: filters.endDate,
          workoutsLeadWithinReportingPeriod: currentPeriodWorkouts.length,
          clientsAttendanceRate: `${currentAttendanceRate}%`,
          deltaOfClientsAttendance: deltaAttendance,
          averageFeedback: currentFeedbackStats.averageRating || 0,
          minimumFeedback: currentFeedbackStats.minRating || 0,
          deltaOfMinimumFeedback: deltaMinFeedback
        };
      })
    );
    
    return report;
  }
  
  /**
   * Get workouts for a specific coach within a date range that aren't cancelled
   */
  private async getCoachWorkouts(coachId: string, startDate: string, endDate: string) {
    return await Workout.find({
      coachId: new Types.ObjectId(coachId),
      date: { $gte: startDate, $lte: endDate },
      clientStatus: { $ne: 'Cancelled' },
      coachStatus: { $ne: 'Cancelled' }
    });
  }
  
  /**
   * Get feedback data (average and min rating) for a coach based on workout IDs
   */
  private async getCoachFeedbackData(coachId: string, workoutIds: string[]) {
    const objectIdWorkoutIds = workoutIds.map(id => new Types.ObjectId(id));
    
    const feedbacks = await Feedback.find({
      coachId: new Types.ObjectId(coachId),
      workoutId: { $in: objectIdWorkoutIds }
    });
    
    if (feedbacks.length === 0) {
      return { averageRating: 0, minRating: 0 };
    }
    
    // Calculate average rating
    const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = parseFloat((totalRating / feedbacks.length).toFixed(1));
    
    // Find minimum rating
    const minRating = Math.min(...feedbacks.map(feedback => feedback.rating));
    
    return { averageRating, minRating };
  }

  /**
   * Get feedback data (average and min rating) for workouts of a specific type
   */
  private async getWorkoutTypeFeedbackData(workoutIds: string[]) {
    if (workoutIds.length === 0) {
      return { averageRating: 0, minRating: 0 };
    }
    
    const objectIdWorkoutIds = workoutIds.map(id => new Types.ObjectId(id));
    
    const feedbacks = await Feedback.find({
      workoutId: { $in: objectIdWorkoutIds }
    });
    
    if (feedbacks.length === 0) {
      return { averageRating: 0, minRating: 0 };
    }
    
    // Calculate average rating
    const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = parseFloat((totalRating / feedbacks.length).toFixed(1));
    
    // Find minimum rating
    const minRating = Math.min(...feedbacks.map(feedback => feedback.rating));
    
    return { averageRating, minRating };
  }
  
  /**
   * Calculate the difference in days between two dates
   */
  private calculateDateDifference(startDate: string, endDate: string): number {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Parse date string in format DD-MM-YYYY to Date object
   */
  private parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}

export default new ReportService();