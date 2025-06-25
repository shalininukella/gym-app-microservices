// src/components/admin/reports/CoachPerformanceTable.tsx
import React from 'react';
import { CoachPerformanceData } from './types';

interface CoachPerformanceTableProps {
  data: CoachPerformanceData[];
  tableRef: React.RefObject<HTMLTableElement>;
}

const CoachPerformanceTable: React.FC<CoachPerformanceTableProps> = ({ data, tableRef }) => {
  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table ref={tableRef} className="min-w-full border-collapse border border-[#B7B7B7]">
        <thead className="bg-[#D9D9D9]">
          <tr>
            <th className="py-3 px-4 text-left text-medium font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Gym Location</th>
            <th className="py-3 px-4 text-left text-medium font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Coach Name</th>
            <th className="py-3 px-4 text-left text-medium font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Email</th>
            <th className="py-3 px-4 text-left text-medium font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Report Period (Start)</th>
            <th className="py-3 px-4 text-left text-medium font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Report Period (End)</th>
            <th className="py-3 px-4 text-left text-medium font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">No. of Workouts</th>
            <th className="py-3 px-4 text-left text-medium font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Workouts % Change</th>
            <th className="py-3 px-4 text-left text-medium font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Average Feedback (1-5)</th>
            <th className="py-3 px-4 text-left text-medium font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Min Feedback (1-5)</th>
            <th className="py-3 px-4 text-left text-medium font-medium uppercase tracking-wider border border-[#B7B7B7] font-inter">Min Feedback % Change</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((coach, index) => (
            <tr key={index} className='bg-white'>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{coach.location}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{coach.name}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{coach.email}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{coach.startDate}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{coach.endDate}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{coach.workouts}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{coach.workoutsChange}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{coach.avgFeedback}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{coach.minFeedback}</td>
              <td className="py-4 px-4 text-sm border border-[#B7B7B7]">{coach.minFeedbackChange}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Add custom scrollbar styling */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
      <style>{`
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

export default CoachPerformanceTable;