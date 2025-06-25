import QuoteContainer from "../Layouts/QuoteContainer";
import TextInput from "../../common/TextInput";
import SelectInput from "../../common/SelectInput";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../../api/axios";
import axios from "axios";
import Button from "../../common/Button";
import Toaster from "../../common/Toaster";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  target: string;
  activity: string;
}

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    target: 'lose_weight',
    activity: 'yoga',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
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

    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 1500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
  
    if (name === 'firstName' || name === 'lastName') {
      const lettersOnly = value.replace(/[^a-zA-Z]/g, '');
      if (lettersOnly.length > 20) return;
      setFormData((prev) => ({
        ...prev,
        [name]: lettersOnly,
      }));
    } else if (name === 'email') {
      if (value.length > 40) return;
      setFormData((prev) => ({
        ...prev,
        email: value,
      }));
    } else if (name === 'password' || name === 'confirmPassword') {
      if (value.length > 16) return;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (newErrors[name]) {
        delete newErrors[name];
      }
      return newErrors;
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { firstName, lastName, email, password, confirmPassword, activity, target } = formData;
    const normalizedEmail = email.toLowerCase();
    const newErrors: { [key: string]: boolean } = {};
  
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+\.(com|in|co|uk|us|net|org|edu)$/i;

    const isFirstNameValid = firstName.trim() !== '';
    const isEmailValid = emailRegex.test(email);
    const isPasswordValid =
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password) &&
      password.length >= 8;
    const isConfirmPasswordValid = confirmPassword.trim() !== '';
    const doPasswordsMatch = password === confirmPassword;
  
    if (!isFirstNameValid) newErrors.firstName = true;
    if (!isEmailValid) newErrors.email = true;
    if (!isPasswordValid) newErrors.password = true;
    if (!isConfirmPasswordValid) newErrors.confirmPassword = true;
    if (isConfirmPasswordValid && !doPasswordsMatch) newErrors.passwordMatch = true;
    
    setErrors(newErrors);
  
    if (Object.keys(newErrors).length > 0) {
      setIsLoading(false);
      return;
    }

    const formattedOutput = {
      email: normalizedEmail,
      firstName,
      lastName,
      password,
      preferableActivity: activity.toUpperCase().replace("-", "_"),
      target: target.toUpperCase(),
      type: "client"
    };
    
    try {
     
    const registerResponse = await api.post(
     `/user/auth/sign-up`, 
      formattedOutput
    );
      
      if (registerResponse.data.success) {
        showToast("success", "Account created successfully!");
      
        setTimeout(() => {
          navigate('/auth/sign-in');
        }, 2000);
      } else {
        showToast("error", registerResponse.data.message || "Registration failed");
      }
    } catch (error) {
        console.error(error);
        
        // Check if it's an Axios error with response
        if (axios.isAxiosError(error) && error.response) {
          // Handle specific error codes
          
          if (error.response.status === 409) {
            showToast("error", error.response.data.message);
            //console.log(error.response.data.message)
            // Highlight the email field
            setErrors(prev => ({ ...prev, email: true }));
            return;
          }
        }
        
        showToast("error", "We're having technical issues. Please try again later.");
        
      } finally {
        setIsLoading(false);
      } 
  };

  const getEmailHelperText = (email: string) => {
    const validEmailRegex = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z]+\.(com|in|co|uk|us|net|org|edu)$/i
    if (email.length > 40) return "Maximum length of 40 characters reached";
    if (!email) return "e.g. username@domain.com";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address";
    if (!validEmailRegex.test(email)) return "Please enter a valid email address";
    if (errors.email) return "Email already exists. Please use a different email.";
    return "Looks good, set to go";
  };
  
  const getPasswordHelperText = (password: string) => {
    if (password.length > 16) return "Maximum length of 16 characters reached";
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!hasUpperCase) return "At least one uppercase letter required";
    if (!hasNumber) return "Add at least one number";
    if (!hasSpecialChar) return "Add at least one special character";
    if (password.length < 8) return "Minimum 8 characters required";
    return "Strong password, set to go";
  };

  const getConfirmPasswordHelperText = () => {
    if (!formData.confirmPassword) return "Please confirm your password";
    if (errors.passwordMatch) return "Passwords do not match";
    if (formData.password === formData.confirmPassword) return "Passwords match";
    return "Please ensure passwords match";
  };

  return (
    <div className="signup-container grid grid-cols-1 md:grid-cols-2 h-screen p-5 mb-8">
      {toast.show && (
          <Toaster type={toast.type} message={toast.message} />
      )}
      
      <div className="flex items-center justify-center w-full">
      
        <form onSubmit={handleSubmit} className="form-contents flex justify-center flex-col p-6 w-full max-w-lg">
          <div className="section-1">
            <p className="lexend-font text-[14px] font-light">LET'S GET YOU STARTED</p>
            <p className="lexend-font text-[24px] font-medium">Create an Account</p>
          </div>

          <div className="section-2 flex flex-col gap-4 mt-4">
            <div className="name-collection flex gap-2">
              <TextInput
                label="First Name"
                placeholder="Enter your First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                helperText={errors.firstName ? "First name is required" : "e.g. Jonson"}
                error={errors.firstName}
              />
              <TextInput
                label="Last Name"
                placeholder="Enter your Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                helperText="e.g. Doe"
              />
            </div>

            <TextInput
              label="Email"
              placeholder="Enter your email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              helperText={getEmailHelperText(formData.email)}
              error={errors.email}
            />

            <TextInput
              label="Password"
              placeholder="Enter your password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              helperText={errors.password ? "Invalid password format" : getPasswordHelperText(formData.password)}
              type="password"
              error={errors.password}
            />

            <TextInput
              label="Confirm new password"
              placeholder="Confirm your password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              helperText={errors.confirmPassword ? "Field is required" : (errors.passwordMatch ? "Passwords do not match" : getConfirmPasswordHelperText())}
              type="password"
              error={errors.confirmPassword || errors.passwordMatch}
            />

            <SelectInput
              label="Your Target"
              name="target"
              value={formData.target}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, target: val }))
              }
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
              value={formData.activity}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, activity: val }))
              }
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

          <div className="section-3 flex flex-col gap-2 mt-6">
            <Button type="submit" label="Create an Account" loading={isLoading} />
          
            <p className="lexend-font font-light text-[12px] leading-[16px] tracking-[0px] text-center text-gray-600">
              Already have an account? <Link to="/auth/sign-in"> <u className="cursor-pointer font-medium text-gray-900 hover:text-gray-700">LOGIN HERE</u> </Link>
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
