import { useState, useRef, useEffect, useCallback, memo } from "react";
import Button1 from "../common/Button1";
import SelectInput from "../common/SelectInput";
import Calendar from "./common/Calendar";
import header from "../../assets/Workout-header.svg";
import { useAppSelector } from "../../hooks/redux";
import { RootState } from "../../store";
import reportsApi from "../../api/reportApi";
import { REPORTS_ENDPOINTS } from "../../api/reportConfig";
import CoachPerformanceTable from "./reports/CoachPerformanceTable";
import SalesStatisticsTable from "./reports/SalesStatisticsTable";
import ExportButton from "./reports/ExportButton"; // Import your existing ExportButton
import { CoachPerformanceData, SalesStatisticsData } from "./reports/types";

interface ApiCoachResponse {
    success: boolean;
    data: {
        gymLocation: string;
        coachName: string;
        email: string;
        reportPeriodStart: string;
        reportPeriodEnd: string;
        noOfWorkouts: number;
        workoutsPercentChange: string;
        averageFeedback: number;
        minFeedback: number;
        minFeedbackPercentChange: string;
    }[];
}

interface ApiSalesResponse {
    success: boolean;
    data: {
        gymLocation: string;
        workoutType: string;
        reportPeriodStart: string;
        reportPeriodEnd: string;
        workoutsLeadWithinReportingPeriod: number;
        clientsAttendanceRate: string;
        deltaOfClientsAttendance: string;
        averageFeedback: number;
        minimumFeedback: number;
        deltaOfMinimumFeedback: string;
    }[];
}

const Reports: React.FC = memo(() => {
    // Calculate default dates
    const getDefaultDateRange = () => {
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 6); // This will give us a 7-day range including today
        return {
            start: oneWeekAgo,
            end: today
        };
    };

    const [reportType, setReportType] = useState<"coach" | "sales">("coach");
    const [gym, setGym] = useState("All");
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);
    
    // Initialize with default date range
    const defaultDates = getDefaultDateRange();
    const [startDate, setStartDate] = useState<Date>(defaultDates.start);
    const [endDate, setEndDate] = useState<Date>(defaultDates.end);
    
    const [reportData, setReportData] = useState<CoachPerformanceData[] | SalesStatisticsData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const tableRef = useRef<HTMLTableElement>(null!);

    const user = useAppSelector((state: RootState) => state.auth.user);
    const isLoggedIn = useAppSelector((state: RootState) => state.auth.isAuthenticated);

    const handleReportTypeChange = useCallback((value: string) => {
        setReportType(value as "coach" | "sales");
        setReportData([]);
        setError(null);
    }, []);

    const handleGymChange = useCallback((value: string) => {
        setGym(value);
    }, []);

    // Format date to YYYY-MM-DD
    const formatDateToYYYYMMDD = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    // Transform API coach data to component format
    const transformCoachData = (apiData: ApiCoachResponse['data']): CoachPerformanceData[] => {
        return apiData.map(item => ({
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
    };

    // Transform API sales data to component format
    const transformSalesData = (apiData: ApiSalesResponse['data']): SalesStatisticsData[] => {
        return apiData.map(item => ({
            location: item.gymLocation,
            workoutType: item.workoutType,
            startDate: item.reportPeriodStart,
            endDate: item.reportPeriodEnd,
            workoutsLed: item.workoutsLeadWithinReportingPeriod,
            attendanceRate: item.clientsAttendanceRate,
            attendanceChange: item.deltaOfClientsAttendance,
            avgFeedback: item.averageFeedback,
            minFeedback: item.minimumFeedback,
            minFeedbackChange: item.deltaOfMinimumFeedback
        }));
    };

    const handleGenerateReport = useCallback(async () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Construct query parameters
            const params = new URLSearchParams({
                type: reportType,
                startDate: formatDateToYYYYMMDD(startDate),
                endDate: formatDateToYYYYMMDD(endDate)
            });

            if (gym !== "All") {
                params.append('gym', gym);
            }

            // Log the request URL for debugging
            console.log('Request URL:', `${REPORTS_ENDPOINTS.PERFORMANCE}?${params.toString()}`);

            // Make the GET request
            const response = await reportsApi.get<ApiCoachResponse | ApiSalesResponse>(
                `${REPORTS_ENDPOINTS.PERFORMANCE}?${params.toString()}`
            );

            console.log('API Response:', response.data); // Log the response

            if (response.data.success) {
                if (reportType === "coach") {
                    const transformedData = transformCoachData((response.data as ApiCoachResponse).data);
                    console.log('Transformed Coach Data:', transformedData);
                    setReportData(transformedData);
                } else {
                    const transformedData = transformSalesData((response.data as ApiSalesResponse).data);
                    console.log('Transformed Sales Data:', transformedData);
                    setReportData(transformedData);
                }
            } else {
                setError("Failed to fetch report data");
            }
        } catch (err) {
            console.error("Error fetching report:", err);
            setError("An error occurred while fetching the report data");
        } finally {
            setLoading(false);
        }
    }, [reportType, startDate, endDate, gym]);

    // Handle date selection
    const handleStartDateChange = useCallback((date: Date | null) => {
        if (date) {
            if (date > endDate) {
                // If selected start date is after current end date,
                // set end date to start date + 6 days (maintaining a week range)
                const newEndDate = new Date(date);
                newEndDate.setDate(date.getDate() + 6);
                setStartDate(date);
                setEndDate(newEndDate);
            } else {
                setStartDate(date);
            }
        }
    }, [endDate]);

    const handleEndDateChange = useCallback((date: Date | null) => {
        if (date) {
            if (date < startDate) {
                // If selected end date is before start date,
                // set start date to end date - 6 days (maintaining a week range)
                const newStartDate = new Date(date);
                newStartDate.setDate(date.getDate() - 6);
                setEndDate(date);
                setStartDate(newStartDate);
            } else {
                setEndDate(date);
            }
        }
    }, [startDate]);

    // Handle click outside to close calendar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(false);
            }
        };

        if (showCalendar) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCalendar]);

    return (
        <>
            <div className="relative">
                <img
                    src={header}
                    alt="Header"
                    className="w-full h-auto object-cover max-h-[250px]"
                />
                <h1 className="absolute top-1/2 left-6 -translate-y-1/2 text-white text-sm md:text-xl drop-shadow-md">
                    {isLoggedIn
                        ? `Hello, ${user?.firstName} ${user?.lastName} (Admin)`
                        : "Welcome !"}
                </h1>
            </div>

            <div className="px-4 md:px-8 py-8">
                <div className="relative">
                    <h2 className="text-xl font-semibold my-6">FILTER</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-6">
                        <SelectInput
                            label="Report Type"
                            name="report"
                            value={reportType}
                            onChange={handleReportTypeChange}
                            defaultValue="coach"
                            options={[
                                { value: "coach", label: "Coach Performance" },
                                { value: "sales", label: "Sales Statistics" },
                            ]}
                        />
                            
                        <div className="w-full" ref={calendarRef}>
                            <Calendar
                                startDate={startDate}
                                endDate={endDate}
                                setStartDate={handleStartDateChange}
                                setEndDate={handleEndDateChange}
                            />
                        </div>

                        <SelectInput
                            label="Gym"
                            name="gym"
                            value={gym}
                            onChange={handleGymChange}
                            defaultValue="All"
                            options={[
                                { value: "All", label: "All Locations" },
                                { value: "Hrushevsky Street", label: "Hrushevsky Street, 16, Kyiv" },
                                { value: "Roosewelt Street", label: "Roosewelt Street, 83, Kyiv" },
                                { value: "Greyjoy Manor", label: "Greyjoy Manor, 16, Kyiv" },
                            ]}
                        />

                        <div className="container pt-2">
                            <Button1
                                text={loading ? "Loading..." : "Generate Report"}
                                className="h-full w-full"
                                onClick={handleGenerateReport}
                                disabled={loading || !startDate || !endDate}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 mb-6">
                            {error}
                        </div>
                    )}

                    {reportData.length > 0 && !loading && (
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">
                                    {reportType === "coach" ? "Coach Performance Report" : "Sales Statistics Report"}
                                </h3>
                                
                             
                            </div>
                            
                            <div className="bg-white rounded-lg overflow-x-auto border border-[#D9D9D9] border-opacity-40">
                                {reportType === "coach" ? (
                                    <CoachPerformanceTable 
                                        data={reportData as CoachPerformanceData[]} 
                                        tableRef={tableRef}
                                    />
                                ) : (
                                    <SalesStatisticsTable 
                                        data={reportData as SalesStatisticsData[]} 
                                        tableRef={tableRef}
                                    />
                                )}
                                   
                        </div>
                        <ExportButton 
                                    reportType={reportType === "coach" ? "coach performance" : "sales statistics"} 
                                    tableRef={tableRef} 
                                />
                            </div>
                    )}

                    {loading && (
                        <div className="mt-8 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
});

Reports.displayName = 'Reports';

export default Reports;