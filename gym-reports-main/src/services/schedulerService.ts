import cron from 'node-cron';
import reportService from './reportService';
import emailService from './emailService';
import { formatDate, subtractDaysFromDate } from '../utils/dateUtils';
import { ReportFilters } from '../config/types';

class SchedulerService {
  private adminEmail: string;

  constructor(adminEmail: string = process.env.ADMIN_EMAIL || 'admin@yourgym.com') {
    this.adminEmail = adminEmail;
  }

  /**
   * Initialize all scheduled tasks
   */
  public init(): void {
    this.scheduleWeeklyReports();
    console.log('Scheduler initialized. Weekly reports will be sent every Sunday at 8:00 AM.');
  }

  /**
   * Schedule weekly reports to be sent every Sunday at 8:00 AM
   */
  private scheduleWeeklyReports(): void {
    // Format: '0 8 * * 0' = At 8:00 AM, only on Sunday
    cron.schedule('0 8 * * 0', async () => {
      console.log('Generating and sending weekly reports...');
      
      try {
        // Calculate date range for the past week
        const today = new Date();
        const endDate = formatDate(today.toISOString());
        
        // Subtract 6 days to get the start of the week (past 7 days including today)
        const startDate = subtractDaysFromDate(endDate, 6);
        
        const reportPeriod = {
          start: startDate,
          end: endDate
        };
        
        const filters: ReportFilters = {
          startDate,
          endDate,
          type: 'coach' // will be overridden for each report
        };
        
        // Generate and send coach performance report
        filters.type = 'coach';
        const coachReport = await reportService.generateCoachPerformanceReport(filters);
        await emailService.sendCoachReport(this.adminEmail, coachReport, reportPeriod);
        
        // Generate and send sales statistics report
        filters.type = 'sales';
        const salesReport = await reportService.generateSalesStatisticsReport(filters);
        await emailService.sendSalesReport(this.adminEmail, salesReport, reportPeriod);
        
        console.log('Weekly reports sent successfully!');
      } catch (error) {
        console.error('Error sending weekly reports:', error);
      }
    });
  }
  
  /**
   * Manually trigger report generation and sending for testing
   */
  public async triggerWeeklyReports(): Promise<void> {
    // Calculate date range for the past week
    const today = new Date();
    const endDate = formatDate(today.toISOString());
    const startDate = subtractDaysFromDate(endDate, 6);
    
    const reportPeriod = {
      start: startDate,
      end: endDate
    };
    
    const filters: ReportFilters = {
      startDate,
      endDate,
      type: 'coach' 
    };
    
    // Generate and send coach performance report
    filters.type = 'coach';
    const coachReport = await reportService.generateCoachPerformanceReport(filters);
    await emailService.sendCoachReport(this.adminEmail, coachReport, reportPeriod);
    
    // Generate and send sales statistics report
    filters.type = 'sales';
    const salesReport = await reportService.generateSalesStatisticsReport(filters);
    await emailService.sendSalesReport(this.adminEmail, salesReport, reportPeriod);
    
    console.log('Reports generated and sent manually!');
  }
}

export default SchedulerService;