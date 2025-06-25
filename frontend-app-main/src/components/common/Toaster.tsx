import { useState, useEffect } from 'react';
interface ToasterProps {
  type: 'success' | 'error';
  message: string;
  duration?: number; // optional auto-close duration in ms
  onClose?: () => void; // callback when toaster closes
}

export default function Toaster({ type, message, duration = 3000, onClose }: ToasterProps) {
  const [visible, setVisible] = useState(true);

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-[#E6F4EA]' : 'bg-[#FEECEC]';
  const borderColor = isSuccess ? 'border-[#34A853]' : 'border-[#D03D0E]';
  const icon = isSuccess ? '/logos/Success.svg' : '/logos/Error.svg';
  const title = isSuccess ? 'Success' : 'Error';

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose(); // notify parent
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="custom-toast fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`toast-container ${bgColor} p-3 flex gap-4 items-center justify-around max-w-lg rounded-xl border-1 ${borderColor}`}>
        <div className="icon-logo mt-1">
          <img src={icon} alt={`${title} icon`} />
        </div>
        <div className="text-message">
          <h2 className="font-medium text-md">{title}</h2>
          <p className="font-light">{message}</p>
        </div>
        <div className="cross-logo mt-1 cursor-pointer" onClick={handleClose}>
          <img src="/logos/Cross.svg" alt="Close toaster" />
        </div>
      </div>
    </div>
  );
}
