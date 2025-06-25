import { Request, Response, NextFunction } from 'express';
import reportService from '../services/reportService';
import SchedulerService from '../services/schedulerService';
import { ReportFilters } from '../config/types';
import { formatDate } from '../utils/dateUtils';

export const getPerformanceReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const type = req.query.type as string;
    // Validate type first
    if (type !== 'coach' && type !== 'sales') {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type. Must be either "coach" or "sales"'
      });
    }

    const filters: ReportFilters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      type: type as 'coach' | 'sales'
    };

    // Validate date format
    if (!filters.startDate || !filters.endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Start date and end date are required' 
      });
    }

    // Format dates if necessary
    filters.startDate = formatDate(filters.startDate);
    filters.endDate = formatDate(filters.endDate);

    let report;
    
    // Generate report based on type
    if (filters.type === 'coach') {
      report = await reportService.generateCoachPerformanceReport(filters);
    } else {
      report = await reportService.generateSalesStatisticsReport(filters);
    }
    
    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

export const triggerWeeklyReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const scheduler = new SchedulerService();
    await scheduler.triggerWeeklyReports();
    
    return res.status(200).json({
      success: true,
      message: 'Weekly reports generated and sent successfully'
    });
  } catch (error) {
    next(error);
  }
};