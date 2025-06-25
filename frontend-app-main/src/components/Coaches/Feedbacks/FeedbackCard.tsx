import React from "react";
import { Star } from "lucide-react";
import { format } from "date-fns";

type Feedback = {
  clientImageUrl: string;
  clientName: string;
  date: string;
  message: string;
  rating: string;
};

type Props = {
  feedback: Feedback;
};

const FeedbackCard: React.FC<Props> = ({ feedback }) => {
  const { clientImageUrl, clientName, date, message, rating } = feedback;

  return (
    <div className="rounded-2xl p-4 shadow-sm hover:shadow-md transition duration-300 flex flex-col gap-3 font-[Lexend] dark:bg-gray-600">
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <img
            src={clientImageUrl}
            alt={clientName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-xs dark:text-white">{clientName}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-300">
              {format(new Date(date), "MM/dd/yyyy")}
            </p>
          </div>
        </div>

        <div className="flex gap-1 text-yellow-400">
          {Array.from({ length: +rating }).map((_, idx) => (
            <Star key={idx} size={12} fill="currentColor" />
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
    </div>
  );
};

export default FeedbackCard;