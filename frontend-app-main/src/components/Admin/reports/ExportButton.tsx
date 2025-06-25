// src/components/admin/reports/ExportButton.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from "lucide-react";
import { exportToXLS, exportToCSV, exportToPDF } from './utils/exportUtils';
import { ExportButtonProps } from './types';

const ExportButton: React.FC<ExportButtonProps> = ({ reportType, tableRef }) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExport = (format: string) => {
    if (!tableRef.current) return;
    
    setShowExportDropdown(false);
    
    switch (format) {
      case 'XLS':
        exportToXLS(tableRef.current, reportType);
        break;
      case 'CSV':
        exportToCSV(tableRef.current, reportType);
        break;
      case 'PDF':
        exportToPDF(tableRef.current, reportType);
        break;
      default:
        console.error('Unknown export format:', format);
    }
  };

  return (
    <div className="flex justify-end mt-4 relative" ref={exportRef}>
      <button
        onClick={() => setShowExportDropdown(!showExportDropdown)}
        className="flex items-center gap-2 font-lexend bg-white text-[#323A3A] px-8 border-1 border-b-black py-2 rounded-md hover:bg-[#E5F9FF]"
      >
        Export
        <ChevronDown size={16} className="ml-2" />
      </button>

      {showExportDropdown && (
        <div className="absolute right-0 top-12 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1 font-lexend font-light">
            <button
              onClick={() => handleExport('XLS')}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#E5F9FF]"
            >
              Export XLS
            </button>
            <button
              onClick={() => handleExport('CSV')}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#E5F9FF]"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('PDF')}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#E5F9FF]"
            >
              Export PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;