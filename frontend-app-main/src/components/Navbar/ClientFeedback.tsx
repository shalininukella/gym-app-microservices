import React, { useState, useEffect, useMemo } from "react";
import { ChevronsRight, ChevronsLeft, Star } from "lucide-react";
import { format } from "date-fns";
import api from "../../api/axios";

export type Feedback = {
  id: string;
  clientImageUrl: string;
  clientName: string;
  date: string;
  message: string;
  rating: string;
};

type Props = {
  coachId: string;
};

const FeedbackList: React.FC<Props> = ({ coachId }) => {
  const CARDS_PER_PAGE = 6;
  const PAGINATION_BUTTONS_LIMIT = 3;

  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationStart, setPaginationStart] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/gym/dev/coaches/${coachId}/feedbacks`);
        setFeedbackData(response.data || []);
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      }
    };

    if (coachId) {
      fetchData();
    }
  }, [coachId]);

  const totalPages = Math.ceil(feedbackData.length / CARDS_PER_PAGE);

  const currentFeedbacks = useMemo(() => {
    const start = (currentPage - 1) * CARDS_PER_PAGE;
    return feedbackData.slice(start, start + CARDS_PER_PAGE);
  }, [currentPage, feedbackData]);

  const paginationEnd = Math.min(
    paginationStart + PAGINATION_BUTTONS_LIMIT - 1,
    totalPages
  );

  return (
    <div className="flex flex-col gap-4 items-center font-lexend mt-3">
      {feedbackData.length === 0 ? (
        <div className="text-gray-500 text-sm mt-4">No feedbacks available.</div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {currentFeedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="rounded-2xl p-4 shadow-sm hover:shadow-md transition duration-300 flex flex-col gap-3"
              >
                <div className="flex justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <img
                      src={feedback.clientImageUrl}
                      alt={feedback.clientName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-xs">{feedback.clientName}</h3>
                      <p className="text-xs text-gray-500">
                        {format(new Date(feedback.date), "MM/dd/yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 text-yellow-400">
                    {Array.from({ length: +feedback.rating }).map((_, idx) => (
                      <Star key={idx} size={12} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{feedback.message}</p>
              </div>
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

export default FeedbackList;
 