import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

type Option = {
  value: string;
  label: string;
};

type SelectInputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  defaultValue?: string;
  options: Option[];
  isOpen?: boolean;
  onToggle?: () => void;
};

const SelectInput = ({
  label,
  name,
  value,
  onChange,
  defaultValue = "All",
  options,
  isOpen = false,
  onToggle,
}: SelectInputProps) => {
  const [showOptions, setShowOptions] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowOptions(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setShowOptions(false);
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
    onToggle?.();
  };

  return (
    <div className={`${name}-field`} ref={selectRef}>
      <fieldset className="pb-2 bg-white border border-[#DADADA] rounded-lg relative">
        <legend className="mx-2 px-2 font-light text-[#4B5563]">{label}</legend>

        <div
          onClick={toggleOptions}
          className="cursor-pointer flex justify-between items-center px-4 py-1 rounded-md text-[#323A3A] bg-white w-full"
        >
          <span>
            {options.find((opt) => opt.value === value)?.label || defaultValue}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform text-gray-500 ${showOptions ? 'rotate-180' : ''}`} />
        </div>

        {showOptions && (
          <ul className="absolute w-full bg-white border border-gray-200 rounded shadow-lg mt-1 z-10">
            {options.map((option) => (
              <li
                key={option.value}
                className="p-2 cursor-pointer hover:bg-[#F6FFE5] transition flex justify-between items-center text-[#323A3A]"
                onClick={() => handleOptionClick(option.value)}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-black" />}
              </li>
            ))}
          </ul>
        )}
      </fieldset>
    </div>
  );
};

export default SelectInput;
