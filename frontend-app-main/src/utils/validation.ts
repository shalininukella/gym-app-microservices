export const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+\.(com|in|co|uk|us|net|org|edu)$/i;
    return regex.test(email);
  };
  
  export const validatePassword = (password: string) => {
    return (
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password) &&
      password.length >= 8
    );
  };
  
  export const getEmailHelperText = (email: string, error?: boolean) => {
    if (!email) return "e.g. username@domain.com";
    if (!validateEmail(email)) return "Please enter a valid email address";
    if (error) return "Email already exists. Please use a different email.";
    return "Looks good, set to go";
  };
  
  export const getPasswordHelperText = (password: string) => {
    if (password.length > 16) return "Maximum 16 characters allowed";
    if (!/[A-Z]/.test(password)) return "At least one uppercase letter required";
    if (!/\d/.test(password)) return "Add at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Add at least one special character";
    if (password.length < 8) return "Minimum 8 characters required";
    return "Strong password, set to go";
  };
  