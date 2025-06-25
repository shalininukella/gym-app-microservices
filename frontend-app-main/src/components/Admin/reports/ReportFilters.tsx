// src/components/admin/reports/ReportFilters.tsx
import React, { useRef } from 'react';
import Button1 from "../../common/Button1";
import SelectInput from "../../common/SelectInput";
import Calendar from "../common/Calendar";
import { ReportFiltersProps } from './types';

const ReportFilters: React.FC<ReportFiltersProps> = ({
  reportType,
  setReportType,
  gym,
  setGym,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onGenerateReport
}) => {
  const calendarRef = useRef<HTMLDivElement | null>(null);

  return (
    <div>
      <h2 className="text-xl font-semibold my-6">FILTER</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SelectInput
          label="Report Type"
          name="report"
          value={reportType}
          onChange={setReportType}
          options={[
            { value: "coach performance", label: "Coach Performance" },
            { value: "sales statistics", label: "Sales Statistics" },
          ]}
        />

        <div className="w-full" ref={calendarRef}>
          <Calendar
            startDate={startDate || new Date()}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </div>

        <SelectInput
          label="Gym"
          name="gym"
          value={gym}
          onChange={setGym}
          options={[
            { value: "All", label: "All" },
            { value: "Hrushevsky Street", label: "Hrushevsky Street, 16, Kyiv" },
            { value: "Roosewelt Street", label: "Roosewelt Street, 83, Kyiv" },
            { value: "Greyjoy Manor", label: "Greyjoy Manor, 16, Kyiv" },
          ]}
        />

        <div className="container pt-2">
          <Button1
            text="Generate Report"
            className="h-full w-full"
            onClick={onGenerateReport}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;