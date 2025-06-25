 // components/InputField.tsx
import React from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps {
  label: string;
  type?: string;
  name: string;
  placeholder: string;
  helperText?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPassword?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  name,
  placeholder,
  helperText,
  value,
  onChange,
  isPassword = false,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputType = isPassword && !showPassword ? "password" : type;

  return (
    <div className="relative mb-4 w-full">
      <input
        id={name}
        type={inputType}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="block w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-gray-950"
      />

      {isPassword && (
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 cursor-pointer text-gray-500"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </span>
      )}

      {/* Static label on the border */}
      <label
        htmlFor={name}
        className="absolute left-3 -top-2 bg-white px-1 text-sm text-gray-500"
      >
        {label}
      </label>

      {helperText && (
        <span className="block mt-1 text-xs text-gray-400">{helperText}</span>
      )}
    </div>
  );
};

export default InputField;
