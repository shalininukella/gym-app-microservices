import React from "react";
import { Coach } from "../../../interfaces/Coaches/Coaches";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../common/Button1";
import { coachTypeDescriptions } from "../../common/coachTypeDescription";
 
const CoachCard: React.FC<{ coach: Coach }> = ({ coach }) => {
  const description = coachTypeDescriptions[coach.title] || "No description available.";
 
  return (
    <div className="shadow-2xl rounded-2xl flex flex-col justify-between gap-2 font-[Lexend] text-gray-600 dark:text-white dark:bg-gray-800">
      <div className="img-container rounded-2xl">
        <img
          src={coach.profilePic}
          alt={coach.firstName}
          className="w-full h-40 object-cover rounded-t-2xl"
        />
      </div>

      <div className="flex flex-col justify-between px-4 gap-4">
        <div className="flex justify-between">
        <div className="flex flex-col">
              <h3 className="text-sm font-medium">{coach.firstName} {coach.lastName}</h3>
              <p className="text-xs">{coach.title}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{coach.rating}</span>
              <Star fill="#facc15" color="#facc15" size={15} />
            </div>
        </div>
        <div className="div">  
          <p className="text-xs">{description}</p>
        </div>
      </div>
 
      <div className="btn px-4 py-3">
        <Link to={`/coach-profile/${coach._id}`}>
          <Button text="Book Workout" />
        </Link>
      </div>
    </div>
  );
};

export default CoachCard;