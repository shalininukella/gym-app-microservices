 import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuoteContainer from "../Layouts/QuoteContainer";
import { Link } from "react-router-dom";
import TextInput from "../../common/TextInput";
import Button from "../../common/Button";
import Toaster from "../../common/Toaster";
import { useAppDispatch } from "../../../hooks/redux";
import { login } from "../../../store/slices/authSlice";
import api from "../../../api/axios";
import axios from "axios";
//import BASE_URL from "../../../api/config";
interface SignInData {
  email: string;
  password: string;
}
 
export default function SignIn() {
  const navigate = useNavigate();
 
  const dispatch = useAppDispatch();
 
  const [formData, setFormData] = useState<SignInData>({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: false,
    password: false,
  });
 
  const [helperText, setHelperText] = useState({
    email: "e.g. username@domain.com",
    password: "At least one capital letter required",
  });
 
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });
 
  const showToast = (type: "success" | "error", message: string) => {
    setToast({
      show: true,
      type,
      message,
    });
 
    // Hide toast after 3 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    // Handle max length validation
    if (name === 'email') {
      if (value.length > 40) {
        setHelperText(prev => ({
          ...prev,
          email: "Maximum length of 40 characters reached"
        }));
        return;
      }
    } else if (name === 'password') {
      if (value.length > 16) {
        setHelperText(prev => ({
          ...prev,
          password: "Maximum length of 16 characters reached"
        }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
 
    if (name === "email") {
      setHelperText((prev) => ({
        ...prev,
        email: "e.g. username@domain.com",
      }));
    }
 
    if (name === "password") {
      setHelperText((prev) => ({
        ...prev,
        password: "At least one capital letter required",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    let hasError = false;
    const updatedErrors = { email: false, password: false };
    const updatedHelperText = {
      email: "e.g. username@domain.com",
      password: "At least one capital letter required",
    };

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+\.(com|in|co|uk|us|net|org|edu)$/i;

    if (!formData.email.trim()) {
      updatedErrors.email = true;
      updatedHelperText.email = "Email is required";
      hasError = true;
    } else if (!emailRegex.test(formData.email.trim())) {
      updatedErrors.email = true;
      updatedHelperText.email = "Invalid email format";
      hasError = true;
    }

    if (!formData.password.trim()) {
      updatedErrors.password = true;
      updatedHelperText.password = "Password is required";
      hasError = true;
    }

    if (hasError) {
      setErrors(updatedErrors);
      setHelperText(updatedHelperText);
      setIsLoading(false);
      return;
    }

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      
      // Call the signin API endpoint using our configured axios instance
      const response = await api.post(
        `/user/auth/sign-in`, 
        {
          email: normalizedEmail,
          password: formData.password
        }
      );
     console.log(response);
      if (response.data.success) {
        const userData = response.data.data.user;
        
        // Save token to localStorage for future requests
        localStorage.setItem('token', response.data.data.token);
        
        // Dispatch user data to Redux
        dispatch(login({
          id: userData._id || userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName || '',
          type: userData.type as 'client' | 'coach' | 'admin'
        }));

        showToast("success", "Sign in successful!");

        // Navigate based on user type
        setTimeout(() => {
          let destination = "/";
          if (userData.type === "coach") {
            destination = "/coachpage";
          } else if (userData.type === "admin") {
            destination = "/adminpage";
          }
          navigate(destination);
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
    
      // Handle specific error responses
      if (axios.isAxiosError(error) && error.response) {
        const { status } = error.response;
        const errorMessage = error.response?.data.message;
        
        if (status === 401) {
          if (errorMessage.toLowerCase().includes('email')) {
            // Email-related error
            setErrors(prev => ({ ...prev, email: true, password: false }));
            setHelperText(prev => ({ ...prev, email: errorMessage }));
          } else {
            // Password-related error
            setErrors(prev => ({ ...prev, email: false, password: true }));
            setHelperText(prev => ({
              ...prev,
              password: errorMessage
            }));
          }
          setIsLoading(false);
          return;
        }
      }
    
      showToast("error", "We're having technical issues. Please try again later.");
      setIsLoading(false);
      return;
    }
    finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="signup-container grid grid-cols-1 md:grid-cols-2 h-screen p-5 mb-8 bg-white">
      {toast.show && (
          <Toaster type={toast.type} message={toast.message} />
      )}
     
      <div className="flex items-center justify-center w-full">
        <form
          onSubmit={handleSubmit}
          className="form-contents flex justify-center flex-col p-6 w-full max-w-lg"
        >
          <div className="section-1">
            <p className="lexend-font text-[14px] font-light text-gray-600">WELCOME BACK</p>
            <p className="lexend-font text-[24px] font-medium text-gray-900">Log In to Your Account</p>
          </div>
 
          <div className="section-2 flex flex-col gap-4 mt-4">
            <TextInput
              label="Email"
              placeholder="Enter your email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              helperText={helperText.email}
              error={errors.email}
            />
 
            <TextInput
              label="Password"
              placeholder="Enter your password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              helperText={helperText.password}
              error={errors.password}
              type="password"
            />
          </div>
 
          <div className="section-3 flex flex-col gap-2 mt-6">
            <Button type="submit" label="Log In" loading={isLoading} />
            <p className="lexend-font font-light text-[12px] leading-[16px] tracking-[0px] text-center text-gray-600">
              Don't have an account?{" "}
              <Link to="/auth/sign-up">
                <u className="cursor-pointer font-medium text-gray-900 hover:text-gray-700">CREATE NEW ACCOUNT</u>
              </Link>
            </p>
          </div>
        </form>
      </div>
 
      <div className="img-container h-screen hidden sm:block p-4">
        <QuoteContainer />
      </div>
    </div>
  );
}