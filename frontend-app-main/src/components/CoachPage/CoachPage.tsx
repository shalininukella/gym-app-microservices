// import { useEffect, useState } from "react";
// import axios from "axios";
// import { CalendarCheck } from "lucide-react";
// import header from "../../assets/Workout-header.svg";
// import CancelWorkoutModal from "../Activities/CancelWorkoutModal";
// import { useParams } from "react-router-dom";


// interface Workout {
//   id: string;
//   coachId: string;
//   name: string;
//   description: string;
//   dateTime: string;
//   state: string;
// }

// const CoachWorkouts = () => {
//   const { id } = useParams<{ id: string }>();
//   const [workouts, setWorkouts] = useState<Workout[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [modalOpen, setModalOpen] = useState<boolean>(false);
//   const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

//   useEffect(() => {
//     const fetchCoachWorkouts = async () => {
//       try {
//         const response = await axios.get("../../../public/data/coachworkouts.json");
//         console.log(response.data)
//         const allWorkouts = response.data.coachWorkouts;
//         console.log(allWorkouts);

//         const filtered = allWorkouts.filter(
//           (workout: Workout) => workout.coachId === id
//         );

//         const currentDate = new Date();
//         const updatedWorkouts = filtered.map((workout: Workout) => {
//           const workoutDate = new Date(workout.dateTime);
//           if (workout.state === "Scheduled" && workoutDate < currentDate) {
//             return { ...workout, state: "Finished" };
//           }
//           return workout;
//         });

//         setWorkouts(updatedWorkouts);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to fetch workouts.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       fetchCoachWorkouts();
//     }
//   }, [id]);

//   const handleCancelClick = (workout: Workout) => {
//     setSelectedWorkout(workout);
//     setModalOpen(true);
//   };

//   const handleCancelConfirm = () => {
//     if (selectedWorkout) {
//       setWorkouts((prev) =>
//         prev.map((w) =>
//           w.id === selectedWorkout.id ? { ...w, state: "Cancelled" } : w
//         )
//       );
//     }
//     setModalOpen(false);
//   };

//   if (loading) return <p>Loading coach workouts...</p>;
//   if (error) return <p className="text-red-500">{error}</p>;

//   return (
//     <>
//       <div className="relative">
//         <img
//           src={header}
//           alt="Coach Header"
//           className="w-full h-auto object-cover max-h-[250px]"
//         />
//         <h1 className="absolute top-1/2 left-6 -translate-y-1/2 text-white text-sm md:text-xl drop-shadow-md">
//           Coach Workouts
//         </h1>
//       </div>

//       <div className="p-6 max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//           {workouts.map((workout) => {
//             const dateObj = new Date(workout.dateTime);
//             const datePart = dateObj.toLocaleDateString("en-US", {
//               month: "long",
//               day: "numeric",
//             });
//             const timePart = dateObj.toLocaleTimeString("en-US", {
//               hour: "numeric",
//               minute: "2-digit",
//               hour12: true,
//             });
//             const formattedDateTime = `${datePart}, ${timePart}`;

//             return (
//               <div
//                 key={workout.id}
//                 className="relative p-6 bg-white rounded-lg shadow-md w-full md:max-w-2xl"
//               >
//                 <span
//                   className={`absolute top-4 right-4 px-3 py-1 text-sm font-semibold rounded-full ${
//                     workout.state === "Scheduled"
//                       ? "bg-blue-500 text-white"
//                       : workout.state === "Finished"
//                       ? "bg-yellow-500 text-black"
//                       : workout.state === "Waiting for feedback"
//                       ? "bg-gray-500 text-white"
//                       : "bg-red-500 text-white"
//                   }`}
//                 >
//                   {workout.state}
//                 </span>

//                 <h2 className="text-xl font-semibold">{workout.name}</h2>
//                 <p className="text-gray-700 mt-2">{workout.description}</p>

//                 <div className="mt-3 flex items-center text-gray-800 font-medium text-sm">
//                   <CalendarCheck className="w-5 h-5 text-gray-800 mr-2" />
//                   <span>{formattedDateTime}</span>
//                 </div>

//                 <div className="mt-4 flex justify-end">
//                   {workout.state === "Waiting for feedback" && (
//                     <button className="px-4 py-2 border rounded cursor-pointer text-gray-800 bg-white shadow-sm hover:bg-gray-100">
//                       Leave Feedback
//                     </button>
//                   )}
//                   {workout.state === "Scheduled" && (
//                     <button
//                       onClick={() => handleCancelClick(workout)}
//                       className="px-4 py-2 border rounded text-gray-800 bg-white shadow-sm hover:bg-gray-100 cursor-pointer"
//                     >
//                       Cancel Workout
//                     </button>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <CancelWorkoutModal
//         isOpen={modalOpen}
//         onClose={() => setModalOpen(false)}
//         onCancelConfirm={handleCancelConfirm}
//       />
//     </>
//   );
// };

// export default CoachWorkouts;

import { useEffect, useState } from "react";
import axios from "axios";
import { CalendarCheck } from "lucide-react";
import header from "../../assets/Workout-header.svg";
import CancelWorkoutModal from "../Activities/CancelWorkoutModal";
import { useParams } from "react-router-dom";

interface Workout {
  id: string;
  coachId: string;
  name: string;
  description: string;
  dateTime: string;
  state: string;
}

const CoachWorkouts = () => {
  const { id } = useParams<{ id: string }>();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    const fetchCoachWorkouts = async () => {
      try {
        const response = await axios.get("../../../public/data/coachworkouts.json");
        console.log(response.data);
        const allWorkouts = response.data.coachWorkouts;
        console.log(allWorkouts);

        const filtered = allWorkouts.filter(
          (workout: Workout) => workout.coachId === id
        );

        const currentDate = new Date();
        const updatedWorkouts = filtered.map((workout: Workout) => {
          const workoutDate = new Date(workout.dateTime);
          if (workout.state === "Scheduled" && workoutDate < currentDate) {
            return { ...workout, state: "Finished" };
          }
          return workout;
        });

        setWorkouts(updatedWorkouts);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch workouts.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCoachWorkouts();
    }
  }, [id]);

  const handleCancelClick = (workout: Workout) => {
    setSelectedWorkout(workout);
    setModalOpen(true);
  };

  const handleCancelConfirm = () => {
    if (selectedWorkout) {
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === selectedWorkout.id ? { ...w, state: "Cancelled" } : w
        )
      );
    }
    setModalOpen(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading coach workouts...</p>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500 text-lg">{error}</p>
    </div>
  );

  return (
    <>
      {/* Header Section */}
      <div className="relative">
        <img
          src={header}
          alt="Coach Header"
          className="w-full h-auto object-cover max-h-[250px]"
        />
        <h1 className="absolute top-1/2 left-6 -translate-y-1/2 text-white text-sm md:text-xl drop-shadow-md">
          Coach Workouts
        </h1>
      </div>
  
      {/* Workouts Listing */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {workouts.map((workout) => {
            const dateObj = new Date(workout.dateTime);
            const datePart = dateObj.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            });
            const timePart = dateObj.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
            const formattedDateTime = `${datePart}, ${timePart}`;
  
            return (
                <div
                key={workout.id}
                className="relative p-6 bg-white rounded-lg shadow-md w-full md:max-w-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="pr-16 sm:pr-0"> {/* Add padding-right on mobile to make space for the badge */}
                    <h2 className="text-xl font-semibold">{workout.name}</h2>
                  </div>
                  <span
                    className={`absolute sm:relative top-6 right-6 sm:top-0 sm:right-0 px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap ${
                      workout.state === "Scheduled"
                        ? "bg-blue-500 text-white"
                        : workout.state === "Finished"
                        ? "bg-yellow-500 text-black"
                        : workout.state === "Waiting for feedback"
                        ? "bg-gray-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {workout.state}
                  </span>
                </div>
              
                <p className="text-gray-700 mt-4">{workout.description}</p>
              
                <div className="mt-3 flex items-center text-gray-800 font-medium text-sm">
                  <CalendarCheck className="w-5 h-5 text-gray-800 mr-2" />
                  <span>{formattedDateTime}</span>
                </div>
              
                <div className="mt-4 flex justify-end">
                  {workout.state === "Waiting for feedback" && (
                    <button className="px-4 py-2 border rounded cursor-pointer text-gray-800 bg-white shadow-sm hover:bg-gray-100">
                      Leave Feedback
                    </button>
                  )}
                  {workout.state === "Scheduled" && (
                    <button
                      onClick={() => handleCancelClick(workout)}
                      className="px-4 py-2 border rounded text-gray-800 bg-white shadow-sm hover:bg-gray-100 cursor-pointer"
                    >
                      Cancel Workout
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
  
      <CancelWorkoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCancelConfirm={handleCancelConfirm}
      />
    </>
  );
}

export default CoachWorkouts;