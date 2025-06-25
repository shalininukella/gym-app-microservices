import React, { useState } from "react";
import Select, {
  Props as SelectProps,
  components,
  OptionProps,
  GroupBase,
  DropdownIndicatorProps,
} from "react-select";
import { FiCheck } from "react-icons/fi";
import { ChevronDown, ChevronUp } from "lucide-react";
 
// Option type
export interface OptionType {
  label: string;
  value: string;
}
 
interface CustomSelectProps extends SelectProps<OptionType, false, GroupBase<OptionType>> {
  label?: string;
}
 
// Custom Option renderer
const CustomOption = (props: OptionProps<OptionType, false>) => {
  const { data, innerRef, innerProps, isSelected, isFocused } = props;
 
  return (
    <div
      ref={innerRef}
      {...innerProps}
      style={{
        backgroundColor: isFocused ? "#f4ffe6" : "white",
        padding: "10px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: isSelected ? 500 : 400,
        color: "#222",
        cursor: "pointer",
      }}
    >
      <span>{data.label}</span>
      {isSelected && <FiCheck color="#333" size={16} />}
    </div>
  );
};
 
// Custom dropdown indicator with Lucide icons
const DropdownIndicator = (props: DropdownIndicatorProps<OptionType, false>) => {
  const {
    selectProps: { menuIsOpen },
  } = props;
  return (
    <components.DropdownIndicator {...props}>
      {menuIsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
    </components.DropdownIndicator>
  );
};
 
const CustomSelect: React.FC<CustomSelectProps> = ({ label, ...props }) => {
  const [menuOpen, setMenuOpen] = useState(false);
 
  return (
    <div style={{ width: "100%", position: "relative", marginTop: "24px" }}>
    {label && (
      <label
        style={{
          position: "absolute",
          top: "-10px",
          left: "12px",
          backgroundColor: "white",
          padding: "0 4px",
          fontSize: "13px",
          color: "#4B5563",
          zIndex: 1,
        }}
      >
        {label}
      </label>
    )}
 
<Select
  isClearable={false}
  components={{
    Option: CustomOption,
    DropdownIndicator,
    ClearIndicator: () => null,
    IndicatorSeparator: () => null,
  }}
  styles={{
    control: (base) => ({
        ...base,
        borderRadius: 10,
        padding: "2px 4px",
        boxShadow: "none",
        borderColor: "#4B5563",
        fontSize: "15px",
        cursor: "pointer",
        transition: "border-color 0.2s ease",
        outline: "none",
        "&:hover": {
          borderColor: "#4B5563",
          boxShadow: "none",    
        },
      }),  
    menu: (base) => ({
      ...base,
      borderRadius: 10,
      padding: 0,
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#1a1a1a",
    }),
  }}
  {...props}
  menuIsOpen={menuOpen}
  onMenuOpen={() => setMenuOpen(true)}
  onMenuClose={() => setMenuOpen(false)}
  onChange={(option, actionMeta) => {
    if (props.onChange) {
      props.onChange(option, actionMeta);
    }
  }}
/>
 
    </div>
  );
};
 
export default CustomSelect;
 