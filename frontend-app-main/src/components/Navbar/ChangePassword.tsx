import React, { useState } from "react";
import { useAppSelector } from "../../hooks/redux";
// import axios from "axios";
import TextInput from "../common/TextInput";
import Button from "../common/Button1";
import Toaster from "../common/Toaster";
import api from "../../api/axios";
const ChangePassword: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    newPassword: false,
    confirmPassword: false,
    passwordMatch: false
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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

  const getPasswordHelperText = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (password.length > 16) return "Maximum 16 characters allowed";
    if (!hasUpperCase) return "At least one uppercase letter required";
    if (!hasNumber) return "Add at least one number";
    if (!hasSpecialChar) return "Add at least one special character";
    if (password.length < 8) return "Minimum 8 characters required";
    return "Strong password, set to go";
  };

  const getConfirmPasswordHelperText = () => {
    if (!formData.confirmPassword) return "Please confirm your password";
    if (errors.passwordMatch) return "Passwords do not match";
    if (formData.newPassword === formData.confirmPassword) return "Passwords match";
    return "Please ensure passwords match";
  };

  const handleChangePassword = async () => {
    const newErrors: any = {};

    const isPasswordValid =
      /[A-Z]/.test(formData.newPassword) &&
      /\d/.test(formData.newPassword) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) &&
      formData.newPassword.length >= 8 &&
      formData.newPassword.length <= 16;

    const isConfirmPasswordValid = formData.confirmPassword.trim() !== "";
    const doPasswordsMatch = formData.newPassword === formData.confirmPassword;

    if (!isPasswordValid) newErrors.newPassword = true;
    if (!isConfirmPasswordValid) newErrors.confirmPassword = true;
    if (isConfirmPasswordValid && !doPasswordsMatch) newErrors.passwordMatch = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const response = await api.put(
        `/user/api/users/${user?.id}/password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.status === 200 || response.data.success) {
        showToast("success", "Password has been updated successfully!");
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setErrors({ newPassword: false, confirmPassword: false, passwordMatch: false });
      } else {
        showToast("error", response.data.message || "Failed to change password");
      }
    } catch (error: any) {
      console.error("Failed to change password:", error);
      showToast("error", error.response?.data?.message || "Failed to change password. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {toast.show && (
        <div onClick={() => setToast(prev => ({ ...prev, show: false }))}>
          <Toaster type={toast.type} message={toast.message} />
        </div>
      )}

      <div className="space-y-4">
        <TextInput
          label="Current Password"
          name="currentPassword"
          type="password"
          placeholder="Enter your current password"
          value={formData.currentPassword}
          onChange={handleChange}
        />

        <TextInput
          label="New Password"
          name="newPassword"
          type="password"
          placeholder="Enter your new password"
          value={formData.newPassword}
          onChange={handleChange}
          helperText={
            errors.newPassword
              ? "Invalid password format"
              : getPasswordHelperText(formData.newPassword)
          }
          error={errors.newPassword}
        />

        <TextInput
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          helperText={
            errors.confirmPassword
              ? "Field is required"
              : errors.passwordMatch
              ? "Passwords do not match"
              : getConfirmPasswordHelperText()
          }
          error={errors.confirmPassword || errors.passwordMatch}
        />
      </div>

      <div className="flex justify-end">
        <div className="w-fit">
          <Button onClick={handleChangePassword} text="Change Password" />
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
