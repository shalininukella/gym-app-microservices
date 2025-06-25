import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
// import axios from "axios";
import header from "../../assets/Workout-header.svg";
import TextInput from "../common/TextInput";
import SelectInput from "../common/SelectInput";
import Button from "../common/Button1";
import Toaster from "../common/Toaster";
import { login } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import ChangePassword from "./ChangePassword";
import { RootState } from "../../store";
// import BASE_URL from "../../api/config";
import ClientFeedback from "./ClientFeedback";
import CoachEditProfile from "../CoachLogin/CoachEditProfile";
import { User } from "../../types/user";
import api from "../../api/axios";

const EditProfile: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isLoggedIn = useAppSelector((state) => state.auth.isAuthenticated);
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, navigate]);

  const [activeTab, setActiveTab] = useState("general");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [preferableActivity, setPreferableActivity] = useState("");
  const [target, setTarget] = useState("");
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const userId = useAppSelector((state: RootState) => state.auth.user?.id);
  // Fetch current user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get(`/user/api/users/${userId}`);
        
        if (response.data.success) {
          const userData = response.data.user;
          setFirstName(userData.firstName || "");
          setLastName(userData.lastName || "");
          setPreferableActivity(userData.preferableActivity || "");
          setTarget(userData.target || "");
          dispatch(login(userData));
        }
      } catch (error: any) {
        console.error("Failed to fetch profile:", error);
        setToast({
          show: true,
          type: "error",
          message: error.response?.data?.message || "Failed to load profile",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserProfile();
  }, [dispatch, userId]);
  
  const showToast = (type: "success" | "error", message: string) => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 1500);

  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleSave = async () => {
    if (!user?.id) {
      setToast({ show: true, type: "error", message: "User ID not found" });
      return;
    }

    try {
      const updateData: any = {
        userId: user.id,
        firstName,
        lastName,
      };

      if (user.type === "client") {
        updateData.preferableActivity = preferableActivity;
        updateData.target = target;
      }

      const response = await api.put(
        `/user/api/users/${user.id}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
  
      if (response.data.success) {
        dispatch(login(response.data.user));
        showToast("success", "Profile updated successfully!");
      } else {
        showToast("error", response.data.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      showToast("error", error.response?.data?.message || "Failed to update profile");
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // If user is a coach, render the CoachEditProfile component
  if (user && (user as User).type === "coach") {
    return <CoachEditProfile />;
  }

  return (
    <>
      {/* Header */}
      <div className="relative">
        <img
          src={header}
          alt="Header"
          className="w-full h-auto object-cover max-h-[250px]"
        />
        <h1 className="absolute top-1/2 left-6 -translate-y-1/2 text-white text-sm md:text-xl drop-shadow-md">
          {isLoggedIn
            ? `Hello, ${firstName} ${lastName}${user?.type === "admin" ? " (Admin)" : ""}`
            : "Welcome !"}
        </h1>
      </div>

      {/* Main */}
      {toast.show && (
        <div onClick={() => setToast(prev => ({ ...prev, show: false }))}>
          <Toaster type={toast.type} message={toast.message} />
        </div>
      )}
      <div className="px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex flex-col gap-2 text-sm">
              <button
                onClick={() => setActiveTab("general")}
                className={`text-left px-4 py-2 border-l-4 ${
                  activeTab === "general"
                    ? "border-blue-500 text-black font-medium"
                    : "border-transparent text-black hover:text-black font-medium"
                }`}
              >
                GENERAL INFORMATION
              </button>
              {/* {user?.type === "coach" && (
                <button
                  onClick={() => setActiveTab("feedback")}
                  className={`text-left px-4 py-2 border-l-4 ${
                    activeTab === "feedback"
                      ? "border-blue-500 text-black font-medium"
                      : "border-transparent text-black hover:text-black font-medium"
                  }`}
                >
                  CLIENT FEEDBACK
                </button>
              )} */}
              <button
                onClick={() => setActiveTab("password")}
                className={`text-left px-4 py-2 border-l-4  ${
                  activeTab === "password"
                    ? "border-blue-500 text-black font-medium"
                    : "border-transparent text-black hover:text-black font-medium"
                }`}
              >
                CHANGE PASSWORD
              </button>
              <button onClick={handleLogout} className="text-left px-4 py-2 mt-4 w-fit border px-3 rounded hover:bg-gray-100 text-sm">
                Log Out
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={`col-span-1 ${activeTab === "feedback" ? "md:col-span-4" : "md:col-span-3"} space-y-8`}>
            {/* User info */}
            {activeTab === "general" && (
              <div className="space-y-1">
                <p className="font-semibold text-base">
                  {firstName} {lastName} ({user?.type})
                </p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            )}

            {/* General Info */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="First Name"
                    name="firstName"
                    placeholder="e.g. Janson"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <TextInput
                    label="Last Name"
                    name="lastName"
                    placeholder="e.g. Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                {user?.type === "client" && (
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <SelectInput
                      label="Your Target"
                      name="target"
                      value={target}
                      onChange={setTarget}
                      defaultValue="Lose Weight"
                      options={[
                        { value: 'LOSE_WEIGHT', label: 'Lose Weight' },
                        { value: 'GAIN_WEIGHT', label: 'Gain Weight' },
                        { value: 'IMPROVE_FLEXIBILITY', label: 'Improve Flexibility' },
                        { value: 'GENERAL_FITNESS', label: 'General Fitness' },
                        { value: 'BUILD_MUSCLE', label: 'Build Muscle' },
                        { value: 'REHAB_RECOVERY', label: 'Rehabilitation/Recovery' }
                      ]}              
                    />

                    <SelectInput
                      label="Preferable Activity"
                      name="activity"
                      value={preferableActivity}
                      onChange={setPreferableActivity}
                      defaultValue="Yoga"
                      options={[
                        { value: 'YOGA', label: 'Yoga' },
                        { value: 'CLIMBING', label: 'Climbing' },
                        { value: 'STRENGTH_TRAINING', label: 'Strength Training' },
                        { value: 'CROSS_FIT', label: 'Cross-Fit' },
                        { value: 'CARDIO_TRAINING', label: 'Cardio Training' },
                        { value: 'REHABILITATION', label: 'Rehabilitation' },
                      ]}
                                
                    />
                  </div>
                )}
                <div className="flex justify-end">
                  <div className="w-fit">
                    <Button onClick={handleSave} text="Save Changes" />
                  </div>
                </div>
              </div>
            )}

            {/* Change Password (inactive view) */}
            {activeTab === "password" && <ChangePassword/>}

            {/* Client Feedback Section */}
            {activeTab === "feedback" && user?.type === "coach" && userId && <ClientFeedback coachId={userId}/>}
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
