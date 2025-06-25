// src/components/admin/reports/types.ts

export interface CoachPerformanceData {
    location: string;
    name: string;
    email: string;
    startDate: string;
    endDate: string;
    workouts: number;
    workoutsChange: string;
    avgFeedback: number;
    minFeedback: number;
    minFeedbackChange: string;
  }
  
  export interface SalesStatisticsData {
    location: string;
    workoutType: string;
    startDate: string;
    endDate: string;
    workoutsLed: number;
    attendanceRate: string;
    attendanceChange: string;
    avgFeedback: number;
    minFeedback: number;
    minFeedbackChange: string;
  }
  
  export interface ReportFiltersProps {
    reportType: string;
    setReportType: (value: string) => void;
    gym: string;
    setGym: (value: string) => void;
    startDate: Date;
    setStartDate: (date: Date) => void;
    endDate: Date;
    setEndDate: (date: Date) => void;
    onGenerateReport: () => void;
  }
  
  export interface ExportButtonProps {
    reportType: string;
    tableRef: React.RefObject<HTMLTableElement>;
  }

