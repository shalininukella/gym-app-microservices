import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  width?: string;
  height?: string;
  className?: string;
  bgColor?: string;
  textColor?: string;
  hoverBgColor?: string;
 
}

const Button: React.FC<ButtonProps> = ({
  text,
  className = "w-full",
  type = "button",
  bgColor = "bg-lime-400",
  textColor = "text-gray-800",
  hoverBgColor = "hover:bg-lime-500",
  ...props
}) => {
  return (
    <button
      type={type}
      className={`font-medium rounded-lg px-4 py-2 transition ${bgColor} ${textColor} ${hoverBgColor}  cursor-pointer ${className} `}
      {...props}
    >
      {text}
    </button>
  );
};

export default Button;
