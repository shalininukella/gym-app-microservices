import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import header from "../../assets/Workout-header.svg";
import TextInput from "../common/TextInput";
import Button from "../common/Button1";
import Toaster from "../common/Toaster";
import { login } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import ChangePassword from "../Navbar/ChangePassword";
import { RootState } from "../../store";
import { X, Download, Trash2 } from "lucide-react";
import api from "../../api/axios";
// import pdfIcon from "../../assets/pdf-icon.png";
import FeedbackList from "../Navbar/ClientFeedback";

interface Certificate {
  id: number;
  name: string;
  size: string;
  type: string;
  file?: File;
}
interface Specialization {
  name: string;
  selected: boolean;
}

const CoachEditProfile: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isLoggedIn = useAppSelector((state) => state.auth.isAuthenticated);
  useEffect(() => {
    if (!isLoggedIn || user?.type !== "coach") {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, navigate, user?.type]);

  const [activeTab, setActiveTab] = useState("general");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [specializations, setSpecializations] = useState<Specialization[]>([
    { name: 'Yoga', selected: true },
    { name: 'Personal workout', selected: true },
    { name: 'Group workout', selected: true }
  ]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isDragging, setIsDragging] = useState(false);
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

  // Fetch current coach data
  
  useEffect(() => {
    const fetchCoachProfile = async () => {
      try {
        const response = await api.get(`gym/dev/coaches/${userId}`);
        console.log(response.data.success);
        if (response.data.success) {
          const coachData = response.data.coach; // Changed from user to coach
          console.log("Coach Data: ", coachData);
          setFirstName(coachData.firstName || "");
          setLastName(coachData.lastName || "");
          setTitle(coachData.specialization || "");
          setAbout(coachData.bio || ""); // Changed from experience to bio
          setSpecializations(
            coachData.specialization?.map((spec: any) => ({ name: spec, selected: true })) || []
          );

          setCertificates(coachData.certificates || []);
          dispatch(login(coachData));
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

              
  
    fetchCoachProfile();
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
    if (!user?.id) return;
    try {
      const updateData = {
        userId: user.id,
        firstName,
        lastName,
        title,
        about,
         specialization: specializations
          .filter(spec => spec.selected)
          .map(spec => spec.name)
      };

      const response = await api.put(
        `/coaches/${user.id}`,
        updateData
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

   const removeSpecialization = (name: string) => {
    setSpecializations(
      specializations.map(spec => 
        spec.name === name ? { ...spec, selected: false } : spec
      )
    );
  };
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const newCertificates: Certificate[] = [];
    
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('certificate', file);

      try {
        const response = await api.post(`/coaches/${user?.id}/certificates`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          newCertificates.push({
            id: response.data.certificate.id,
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            type: file.name.split('.').pop()?.toLowerCase() || ''
          });
        }
      } catch (error) {
        console.error('Failed to upload certificate:', error);
        showToast("error", "Failed to upload certificate");
      }
    }
    
    
    setCertificates(prev => [...prev, ...newCertificates]);
  };

  const removeCertificate = async (id: number) => {
    try {
      await api.delete(`/coaches/${user?.id}/certificates/${id}`);
      setCertificates(certificates.filter(cert => cert.id !== id));
      showToast("success", "Certificate removed successfully");
    } catch (error) {
      console.error('Failed to remove certificate:', error);
      showToast("error", "Failed to remove certificate");
    }
  };


  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
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
            ? `Hello, ${firstName} ${lastName}${user?.type}`
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
              <button
                onClick={() => setActiveTab("feedback")}
                className={`text-left px-4 py-2 border-l-4  ${
                  activeTab === "feedback"
                    ? "border-blue-500 text-black font-medium"
                    : "border-transparent text-black hover:text-black font-medium"
                }`}
              >
                CLIENT FEEDBACK
              </button>
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
          {/* </div><div className="col-span-1 md:col-span-3 space-y-8"> */}
          <div className={`col-span-1 ${activeTab === "feedback" ? "md:col-span-4" : "md:col-span-3"} space-y-8`}>

            
            {/* User info */}
            {activeTab === "general" && (
              <div className="space-y-1">
                <p className="font-semibold text-base">
                  {firstName} {lastName} (Coach)
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
                    placeholder="e.g. John"
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
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <TextInput
                    label="Title"
                    name="Title"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <TextInput
                    label="About"
                    name="about"
                    placeholder="e.g. Doe"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                  />
                </div>

                {/* Specialization Section */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Specialization</h3>
                  <div className="flex flex-wrap gap-2">
                    {specializations.filter(spec => spec.selected).map(spec => (
                      <div key={spec.name} className="flex items-center bg-gray-100 rounded-md px-3 py-1">
                        <span className="text-gray-700">{spec.name}</span>
                        <button 
                          onClick={() => removeSpecialization(spec.name)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificate Upload Section */}
                <div className="mt-6">
                  <h2 className="text-xl font-medium text-gray-800 mb-4">Add your certificates</h2>
                  
                  <div 
                    className={`border-2 ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300'} rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <p className="text-gray-700 font-medium mb-2">Drag & drop file here</p>
                    <p className="text-gray-500 mb-4">or</p>
                    <label className="cursor-pointer">
                      <div className="border border-gray-300 rounded-md px-6 py-2 text-gray-700 hover:bg-gray-50">
                        Select File
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                        multiple
                      />
                    </label>
                  </div>

                  {/* Uploaded Certificates List */}
                  <div className="mt-4 space-y-3">
                    {certificates.map(cert => (
                      <div key={cert.id} className="flex items-center justify-between bg-white p-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex items-center justify-center bg-red-100 text-red-500 rounded-md mr-3">
                            <span className="text-xs font-medium uppercase"><img src="{pdfIcon}" alt="PDF" /></span>
                          </div>
                          <div>
                            <p className="text-gray-800">{cert.name}</p>
                            <p className="text-gray-500 text-sm">({cert.size})</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-gray-500 hover:text-gray-700">
                            <Download size={20} />
                          </button>
                          <button className="text-gray-500 hover:text-gray-700" onClick={() => removeCertificate(cert.id)}>
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="w-fit">
                    <Button onClick={handleSave} text="Save Changes" />
                  </div>
                </div>
              </div>
            )}

            {/* Change Password */}
            {activeTab === "password" && <ChangePassword />}

            {/* Client Feedback Section */}
            {activeTab === "feedback" && user?.type === "coach" && <FeedbackList coachId={user.id} />}
 
          </div>
        </div>
      </div>
    </>
  );
};

export default CoachEditProfile; 