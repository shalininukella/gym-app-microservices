import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface TextInputProps {
  label: string;
  placeholder: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
  type?: string;
  error?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  name,
  value, 
  onChange,
  helperText,
  type = 'text',
  error = false,
}) => {
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType = isPassword && !showPassword ? 'password' : 'text';
  const isEmpty = value.trim() === '';

  return (
    <div className="w-full">
      <fieldset className={`pb-2 bg-white border ${error ? 'border-red-500' : 'border-[#DADADA]'} rounded-lg focus-within:border-[#323232]`}>
        <legend className={`mx-2 px-2 font-light`}>{label}</legend>
          <div className="input-field mx-4 flex items-center justify-between">
          
          <input
            type={inputType}
            name={name}
            value={value}
            onChange={onChange}
            className="outline-none w-full text-[#323A3A] focus:text-[#323A3A] placeholder:text-[#909090]"
            placeholder={placeholder}
          />
          {isPassword && (
            <div
              onClick={() => {
                if (!isEmpty) setShowPassword(!showPassword);
              }}
              className={`cursor-pointer ${
                isEmpty ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500'
              }`}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </div>
          )}
          </div>
      </fieldset>
      {helperText && (
        <p className={`font-light mt-1 text-sm ${error ? 'text-red-500' : 'text-[#909090]'}`}>{helperText}</p>
      )}
    </div>
  );
};

export default TextInput;



