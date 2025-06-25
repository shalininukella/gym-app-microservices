interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  label: string;
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({
  type = "button",
  onClick,
  label,
  disabled = false,
  loading = false,
}:ButtonProps){
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="bg-[#9EF300] rounded-xl w-full px-[20px] py-[15px] lexend-font font-medium text-[14px] leading-[24px] tracking-[0px] cursor-pointer text-center align-middle capitalize pointer disabled:opacity-50 disabled:cursor-not-allowed relative hover:bg-[#8EE000] transition-colors"
    >
      {loading ? (
        <>
          <span className="opacity-0">{label}</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        </>
      ) : (
        label
      )}
    </button>
  );
};