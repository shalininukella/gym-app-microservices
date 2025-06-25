import { useState, useEffect, useMemo } from "react";
import FeedbackCard from "./FeedbackCard";
import { ChevronsRight, ChevronsLeft } from 'lucide-react';
import CustomSelect, { OptionType } from "../../common/Dropdown";
import api from '../../../api/axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export type Feedback = {
  id: string;
  clientImageUrl: string;
  clientName: string;
  date: string;
  message: string;
  rating: string;
};

const options: OptionType[] = [
  { value: "rating", label: "Rating" },
  { value: "date", label: "Date" },
];

const FeedbackSection = ({ coachId }: { coachId: string }) => {
  const CARDS_PER_PAGE = 3;
  const PAGINATION_BUTTONS_LIMIT = 3;

  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationStart, setPaginationStart] = useState(1);
  const [selectedOption, setSelectedOption] = useState<OptionType>(options[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/gym/dev/coaches/${coachId}/feedbacks`);
        console.log(response);
        if (response.data.length === 0) {
          setFeedbackData([]); 
        } else {
          setFeedbackData(response.data); 
        }
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (coachId) {
      fetchData();
    }
  }, [coachId]);

  const sortedFeedbacks = useMemo(() => {
    const feedbacksCopy = [...feedbackData];

    if (selectedOption?.value === "rating") {
      return feedbacksCopy.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (selectedOption?.value === "date") {
      return feedbacksCopy.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    return feedbacksCopy;
  }, [selectedOption, feedbackData]);

  const totalPages = Math.ceil(sortedFeedbacks.length / CARDS_PER_PAGE);

  const handleSortChange = (option: OptionType | null) => {
    if (option) {
      setSelectedOption(option);
      setCurrentPage(1);
      setPaginationStart(1);
    }
  };

  const currentFeedbacks = sortedFeedbacks.slice(
    (currentPage - 1) * CARDS_PER_PAGE,
    currentPage * CARDS_PER_PAGE
  );

  const paginationEnd = Math.min(
    paginationStart + PAGINATION_BUTTONS_LIMIT - 1,
    totalPages
  );

  return (
    <div className="flex flex-col gap-4 items-center font-lexend mt-3">
      <div className="flex justify-between items-center w-full">
        <h3 className="text-gray-600 text-xs dark:text-white">FEEDBACK</h3>
        <div className="flex justify-center items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-white">Sort by</span>
          <div className="min-w-[120px]">
            <CustomSelect
              options={options}
              value={selectedOption}
              onChange={handleSortChange}
              isSearchable={false}
              isClearable={false}
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "transparent",
                  boxShadow: "none",
                  "&:hover": {
                    borderColor: "transparent",
                  },
                }),
              }}
            />
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: CARDS_PER_PAGE }).map((_, index) => (
            <div key={index} className="p-4">
              <Skeleton height={20} width={20} circle />
              <Skeleton height={20} width={200} />
              <Skeleton height={10} width={100} />
            </div>
          ))}
        </div>
      ) : feedbackData.length === 0 ? (
        <div className="text-gray-500 text-sm mt-4">No feedbacks available.</div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {currentFeedbacks.map((feedback: Feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}
          </div>

          <div className="flex gap-2 mt-4 items-center">
            {paginationStart > 1 && (
              <button
                onClick={() =>
                  setPaginationStart((prev) =>
                    Math.max(prev - PAGINATION_BUTTONS_LIMIT, 1)
                  )
                }
                className="px-3 py-1"
              >
                <ChevronsLeft size={15} />
              </button>
            )}

            {Array.from(
              { length: paginationEnd - paginationStart + 1 },
              (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(paginationStart + index)}
                  className={`px-3 py-1 text-sm ${
                    currentPage === paginationStart + index
                      ? "border-b-2 border-b-green-500"
                      : "border-b-2 border-transparent"
                  }`}
                >
                  {paginationStart + index}
                </button>
              )
            )}

            {paginationEnd < totalPages && (
              <button
                onClick={() =>
                  setPaginationStart((prev) =>
                    Math.min(
                      prev + PAGINATION_BUTTONS_LIMIT,
                      totalPages - PAGINATION_BUTTONS_LIMIT + 1
                    )
                  )
                }
                className="px-3 py-1"
              >
                <ChevronsRight size={15} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FeedbackSection;