import { useEffect, useState } from "react";
import { Coach } from "../../../interfaces/Coaches/Coaches";
import { FileText, Star } from "lucide-react";
import BookingConfirmationModal from "../../common/BookingConfirmationModal";
import { format, parse } from "date-fns";
import Toaster from "../../common/Toaster";
import { useAppSelector } from "../../../hooks/redux";
import { useNavigate } from "react-router-dom";
import LoginModal from "../../common/LoginModal";
import api from '../../../api/axios';
import Skeleton from "react-loading-skeleton";

 
type CoachCardProps = {
  coachId: string;
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
};
  
const CoachProfileCard = ({ coachId, selectedDate, selectedTimeSlot }: CoachCardProps) => {
  const navigate = useNavigate();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isLoggedIn = useAppSelector((state) => state.auth.isAuthenticated);
  const clientId = useAppSelector((state) => state.auth.user?.id);

  const handleBookClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else if (!selectedTimeSlot) {
      setToast({ type: "error", message: "Please select the timeslot" });
      setTimeout(() => setToast(null), 3000);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleBookingConfirm = (message: string) => {
    setShowConfirmModal(false);
    setToast({ type: "success", message: message });

    // Auto-dismiss toast after 3 seconds
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/gym/dev/coaches/${coachId}`);
        setCoach(response.data);
      } catch (error) {
        console.error("Error fetching coach data:", error);
      }
    };

    if (coachId) {
      fetchData();
    }
  }, [coachId]);

  if (!coach) {
    return (
      <div className="rounded-2xl shadow-lg flex flex-col mx-auto max-w-[280px] w-full h-fit overflow-hidden font-[Lexend] text-gray-600 dark:bg-gray-800 dark:text-gray-100">
        <Skeleton height={180} width="100%" />
        <div className="flex flex-col justify-between m-4 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col flex-grow">
              <Skeleton width="60%" height={20} />
              <Skeleton width="40%" height={14} />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton width={20} height={20} circle />
              <Skeleton width={25} height={15} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton width="100%" height={12} count={3} />
          </div>
          <Skeleton width="100%" height={36} borderRadius={8} />
          <Skeleton width="100%" height={36} borderRadius={8} />
        </div>
      </div>
    );
  }

  const convertTo24Hour = (slot: string | null): string => {
    if (!slot) return "";
    return format(
      parse(
        selectedTimeSlot?.split("-")[0] + " " + selectedTimeSlot?.split(" ")[1],
        "hh:mm a",
        new Date()
      ),
      "HH:mm"
    );
  };

  const trainerData = {
    id: coach._id,
    name: coach.firstName,
    image: coach.profilePic || "/images/default-coach.jpg",
    rating: coach.rating || 0,
    title: coach.title,
    description: `${coach.firstName} is a professional ${coach.specialization?.join(
      ", "
    )} trainer ready to help you achieve your fitness goals.`,
    availableTimes: [""],
    booking: {
      type: coach.type,
      time: convertTo24Hour(selectedTimeSlot),
      date: selectedDate?.toISOString() || "",
    },
  };

  return (
    <div className="rounded-2xl shadow-lg flex flex-col mx-auto max-w-[280px] h-fit overflow-hidden font-[Lexend] text-gray-600 dark:bg-gray-800 dark:text-white">
      <img
        src={coach.profilePic}
        alt={`${coach.firstName} ${coach.lastName}`}
        className="w-full h-45 object-cover"
      />
      <div className="flex flex-col justify-between m-4 space-y-4">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <h3 className="text-md font-medium">{`${coach.firstName} ${coach.lastName}`}</h3>
            <p className="text-xs">{coach.title}</p>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm">{coach.rating !== undefined ? coach.rating : "N/A"}</span>
            <Star fill="#facc15" color="#facc15" size={15} />
          </div>
        </div>

        {coach.about && (
          <div className="flex flex-col gap-1 text-xs">
            <h3 className="font-semibold text-black dark:text-gray-100">About Coach</h3>
            <p className="text-gray-500 dark:text-gray-300">{coach.about}</p>
          </div>
        )}

        {coach.specialization && coach.specialization.length > 0 && (
          <div className="flex flex-col gap-1 text-xs">
            <h3 className="font-semibold text-black dark:text-gray-100">Specialization</h3>
            <div className="flex flex-wrap gap-1">
              {coach.specialization.map((specialization) => (
                <span
                  key={specialization}
                  className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-sm text-gray-500 dark:text-gray-300"
                >
                  {specialization}
                </span>
              ))}
            </div>
          </div>
        )}

        {coach.certificates && coach.certificates.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-black dark:text-gray-100 mb-2">Certificates</h3>
            {coach.certificates.map((cert) => (
              <div key={cert} className="flex gap-1 my-3 text-black dark:text-gray-300 items-center text-xs">
                <FileText size={20} color="#E85567" className="flex-shrink-0" />
                <span className="underline">{cert}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleBookClick}
          className="cursor-pointer text-gray-800 dark:text-gray-700 py-3 bg-[#9EF300] hover:scale-105 rounded-lg transition-all text-sm"
        >
          Book Workout
        </button>
        <button className="cursor-pointer text-gray-800 dark:text-gray-900  dark:bg-white border-1 py-3 hover:scale-105 rounded-lg transition-all text-sm">
          Repeat Previous Workout
        </button>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          setShowLoginModal(false);
          navigate("/auth/sign-in");
        }}
      />

      <BookingConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleBookingConfirm}
        trainer={trainerData}
        clientId={clientId || ""}
      />

      {toast && <Toaster type={toast.type} message={toast.message} />}
    </div>
  );
};

export default CoachProfileCard;