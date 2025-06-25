// src/components/admin/reports/SalesStatisticsTable.tsx
import React from 'react';
import { SalesStatisticsData } from './types';

interface SalesStatisticsTableProps {
  data: SalesStatisticsData[];
  tableRef: React.RefObject<HTMLTableElement>;
}

const SalesStatisticsTable: React.FC<SalesStatisticsTableProps> = ({ data, tableRef }) => {
  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table ref={tableRef} className="min-w-full border-collapse border border-[#B7B7B7]">
        <thead className="bg-[#D9D9D9]">
          <tr>
            <th className="py-3 px-4 text-left text-md font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Gym Location</th>
            <th className="py-3 px-4 text-left text-md font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Workout Type</th>
            <th className="py-3 px-4 text-left text-md font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Report Period (Start)</th>
            <th className="py-3 px-4 text-left text-md font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Report Period (End)</th>
            <th className="py-3 px-4 text-left text-md font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Workouts Led</th>
            <th className="py-3 px-4 text-left text-md font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Attendance Rate</th>
            <th className="py-3 px-4 text-left text-md font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Attendance % Change</th>
            <th className="py-3 px-4 text-left text-md font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Average Feedback (1-5)</th>
            <th className="py-3 px-4 text-left text-md font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Min Feedback (1-5)</th>
            <th className="py-3 px-4 text-left text-md font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Min Feedback % Change</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((sales, index) => (
            <tr key={index} className='bg-white'>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{sales.location}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{sales.workoutType}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{sales.startDate}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{sales.endDate}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{sales.workoutsLed}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{sales.attendanceRate}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{sales.attendanceChange}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{sales.avgFeedback}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{sales.minFeedback}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{sales.minFeedbackChange}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Add custom scrollbar styling */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #9EF300;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8ad900;
        }
      `}</style>
    </div>
  );
};

export default SalesStatisticsTable;