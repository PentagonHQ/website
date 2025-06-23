import { useState } from "react";
import { ALLOWED_CHARACTERS } from "@/src/constants/auth";

export function usePasswordValidation() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");

  const validatePassword = (input: string) => {
    const allAllowedChars = [
      ...ALLOWED_CHARACTERS.uppercase,
      ...ALLOWED_CHARACTERS.numbers,
      ...ALLOWED_CHARACTERS.special,
    ];
    return input
      .split("")
      .every((char) => allAllowedChars.includes(char.toUpperCase()));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value.toUpperCase();
    if (validatePassword(newPassword)) {
      setPassword(newPassword);
      setError("");
    } else {
      setError(
        "Password can only contain letters (A-Z), numbers (0-9), and special characters (!, @, #, $)",
      );
    }
  };

  const validatePasswordLength = () => {
    if (password.length < 4) {
      setError("Password must be at least 4 character long");
      return false;
    }
    if (password.length > 10) {
      setError("Password cannot be longer than 10 characters");
      return false;
    }
    return true;
  };

  const resetPassword = () => {
    setPassword("");
    setError("");
  };

  return {
    password,
    error,
    setError,
    handlePasswordChange,
    validatePasswordLength,
    validatePassword,
    resetPassword,
  };
} 