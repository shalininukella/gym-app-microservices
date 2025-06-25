// src/components/admin/reports/index.tsx
import React, { useState, useRef } from "react";
import header from "../../../assets/Workout-header.svg";
import PageHeader from "../common/PageHeader";
import ReportFilters from "./ReportFilters";
import CoachPerformanceTable from "./CoachPerformanceTable";
import SalesStatisticsTable from "./SalesStatisticsTable";
import ExportButton from "./ExportButton";
import { CoachPerformanceData, SalesStatisticsData } from "./types";
import api from "../../../api/axios";

interface ReportsProps {}

const Reports: React.FC<ReportsProps> = () => {
  // Calculate default dates
  const getDefaultStartDate = (): Date => {
    const today = new Date();
    // Set to first day of current month
    return new Date(today.getFullYear(), today.getMonth(), 1);
  };

  const getDefaultEndDate = (): Date => {
    // Use current date as end date
    return new Date();
  };

  const [reportType, setReportType] = useState("coach performance");
  const [gym, setGym] = useState("All");
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for dynamic data
  const [coachPerformanceData, setCoachPerformanceData] = useState<CoachPerformanceData[]>([]);
  const [salesStatisticsData, setSalesStatisticsData] = useState<SalesStatisticsData[]>([]);

  const tableRef = useRef<HTMLTableElement>(null!);

  // Format dates to dd-mm-yyyy
  const formatDateToDDMMYYYY = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Function to fetch coach performance data
  const fetchCoachPerformanceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        type: "coach",
        startDate: formatDateToDDMMYYYY(startDate),
        endDate: formatDateToDDMMYYYY(endDate)
      };

      console.log("Fetching coach performance data with:", requestData);

      const response = await api.post(
        `/api/reports/coach-performance`,
        requestData
      );

      if (response.data.success) {
        // Map the API response to our component's data structure
        const mappedData: CoachPerformanceData[] = response.data.data.map((item: any) => ({
          location: item.gymLocation,
          name: item.coachName,
          email: item.email,
          startDate: item.reportPeriodStart,
          endDate: item.reportPeriodEnd,
          workouts: item.noOfWorkouts,
          workoutsChange: item.workoutsPercentChange,
          avgFeedback: item.averageFeedback,
          minFeedback: item.minFeedback,
          minFeedbackChange: item.minFeedbackPercentChange
        }));

        setCoachPerformanceData(mappedData);
        setShowReport(true);
      } else {
        setError("Failed to fetch coach performance data");
      }
    } catch (err) {
      console.error("Error fetching coach performance data:", err);
      setError("An error occurred while fetching data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch sales statistics data
  const fetchSalesStatisticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        type: "sales",
        startDate: formatDateToDDMMYYYY(startDate),
        endDate: formatDateToDDMMYYYY(endDate)
      };

      console.log("Fetching sales statistics data with:", requestData);

      const response = await api.post(
        `$/api/reports/sales-statistics`,
        requestData
      );

      if (response.data.success) {
        // Assuming the API returns data in a similar structure to what we need
        // You may need to adjust this mapping based on the actual API response
        setSalesStatisticsData(response.data.data);
        setShowReport(true);
      } else {
        setError("Failed to fetch sales statistics data");
      }
    } catch (err) {
      console.error("Error fetching sales statistics data:", err);
      setError("An error occurred while fetching data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    // Create the formatted object for logging
    const formattedData = {
      type: reportType === "coach performance" ? "coach" : "sales",
      startDate: formatDateToDDMMYYYY(startDate),
      endDate: formatDateToDDMMYYYY(endDate)
    };

    // Log the formatted data
    console.log("Report request data:", formattedData);

    // Fetch the appropriate data based on report type
    if (reportType === "coach performance") {
      await fetchCoachPerformanceData();
    } else {
      await fetchSalesStatisticsData();
    }
  };

  return (
    <>
      <PageHeader headerImage={header} />

      <div className="px-4 md:px-8 py-8">
        <div className="relative">
          <ReportFilters
            reportType={reportType}
            setReportType={setReportType}
            gym={gym}
            setGym={setGym}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onGenerateReport={handleGenerateReport}
          />

          {/* Loading indicator */}
          {loading && (
            <div className="mt-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#9ae600] border-r-transparent border-l-transparent"></div>

            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p>{error}</p>
            </div>
          )}

          {/* Report display section - Only shown after clicking Generate Report */}
          {showReport && !loading && !error && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">
                {reportType === "coach performance" ? "Coach Performance Report" : "Sales Statistics Report"}
              </h2>

              <div className="bg-white rounded-lg overflow-x-auto border border-[#D9D9D9] border-opacity-40">
                {reportType === "coach performance" ? (
                  <CoachPerformanceTable data={coachPerformanceData} tableRef={tableRef} />
                ) : (
                  <SalesStatisticsTable data={salesStatisticsData} tableRef={tableRef} />
                )}
              </div>

              {/* Export buttons - Only shown when report is displayed */}
              <ExportButton reportType={reportType} tableRef={tableRef} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Reports;
