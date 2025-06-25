import { Resend } from 'resend';
import { CoachPerformance, SalesStatistics } from '../config/types';

class EmailService {
  private resend: Resend;
  
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendCoachReport(adminEmail: string, data: CoachPerformance[], period: { start: string, end: string }) {
    // Generate HTML for coach performance report
    const htmlContent = this.generateCoachReportHtml(data, period);
    
    try {
      const { data: responseData, error } = await this.resend.emails.send({
        from: 'Gym Reports <onboarding@resend.dev>',
        to: adminEmail,
        subject: `Weekly Coach Performance Report (${period.start} to ${period.end})`,
        html: htmlContent,
      });
      
      if (error) {
        console.error('Error sending coach report email:', error);
        return { success: false, error };
      }
      
      return { success: true, data: responseData };
    } catch (error) {
      console.error('Exception sending coach report email:', error);
      return { success: false, error };
    }
  }

  async sendSalesReport(adminEmail: string, data: SalesStatistics[], period: { start: string, end: string }) {
    // Generate HTML for sales statistics report
    const htmlContent = this.generateSalesReportHtml(data, period);
    
    try {
      const { data: responseData, error } = await this.resend.emails.send({
        from: 'Gym Reports <onboarding@resend.dev>',
        to: adminEmail,
        subject: `Weekly Sales Statistics Report (${period.start} to ${period.end})`,
        html: htmlContent,
      });
      
      if (error) {
        console.error('Error sending sales report email:', error);
        return { success: false, error };
      }
      
      return { success: true, data: responseData };
    } catch (error) {
      console.error('Exception sending sales report email:', error);
      return { success: false, error };
    }
  }

  private generateCoachReportHtml(data: CoachPerformance[], period: { start: string, end: string }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .report-container { max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .positive-change { color: green; }
            .negative-change { color: red; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <h1>Weekly Coach Performance Report</h1>
            <p>Report Period: ${period.start} to ${period.end}</p>
            
            <table>
              <thead>
                <tr>
                  <th>Coach Name</th>
                  <th>Email</th>
                  <th>Gym Location</th>
                  <th>Workouts</th>
                  <th>Change</th>
                  <th>Avg Feedback</th>
                  <th>Min Feedback</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(coach => `
                  <tr>
                    <td>${coach.coachName}</td>
                    <td>${coach.email}</td>
                    <td>${coach.gymLocation}</td>
                    <td>${coach.noOfWorkouts}</td>
                    <td class="${coach.workoutsPercentChange.includes('+') ? 'positive-change' : 'negative-change'}">${coach.workoutsPercentChange}</td>
                    <td>${coach.averageFeedback}</td>
                    <td>${coach.minFeedback} <span class="${coach.minFeedbackPercentChange.includes('+') ? 'positive-change' : 'negative-change'}">(${coach.minFeedbackPercentChange})</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
  }

  private generateSalesReportHtml(data: SalesStatistics[], period: { start: string, end: string }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .report-container { max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .positive-change { color: green; }
            .negative-change { color: red; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <h1>Weekly Sales Statistics Report</h1>
            <p>Report Period: ${period.start} to ${period.end}</p>
            
            <table>
              <thead>
                <tr>
                  <th>Workout Type</th>
                  <th>Gym Location</th>
                  <th>Total Workouts</th>
                  <th>Attendance Rate</th>
                  <th>Attendance Change</th>
                  <th>Avg Feedback</th>
                  <th>Min Feedback</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(stat => `
                  <tr>
                    <td>${stat.workoutType}</td>
                    <td>${stat.gymLocation}</td>
                    <td>${stat.workoutsLeadWithinReportingPeriod}</td>
                    <td>${stat.clientsAttendanceRate}</td>
                    <td class="${stat.deltaOfClientsAttendance.includes('+') ? 'positive-change' : 'negative-change'}">${stat.deltaOfClientsAttendance}</td>
                    <td>${stat.averageFeedback}</td>
                    <td>${stat.minimumFeedback} <span class="${stat.deltaOfMinimumFeedback.includes('+') ? 'positive-change' : 'negative-change'}">(${stat.deltaOfMinimumFeedback})</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
  }
}

export default new EmailService();