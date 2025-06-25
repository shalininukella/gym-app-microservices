import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";
import { RootState } from "../../store";
import header from "../../assets/Workout-header.svg";


const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state: RootState) => state.auth.user);
  
  useEffect(() => {
    // If no user or the user is not an admin, redirect to home
    if (!user || user.type !== "admin") {
      navigate("/");
      return;
    }

  }, [user, navigate]);


  return (
    <>

      <div className="relative">
        <img
          src={header}
          alt="Admin Header"
          className="w-full h-auto object-cover max-h-[250px]"
        />
        <h1 className="absolute top-1/2 left-6 -translate-y-1/2 text-white text-sm md:text-xl drop-shadow-md">
          Hello, {user?.firstName} {user?.lastName} (Admin)
        </h1>
      </div>
      
    </>
  );
};

export default AdminDashboard; 