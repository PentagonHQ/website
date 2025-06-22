export const COLORS = {
  Red: "rgba(239, 68, 68, 1)",    // Tailwind red-500
  Green: "rgba(34, 197, 94, 1)",  // Tailwind green-500
  Blue: "rgba(59, 130, 246, 1)",  // Tailwind blue-500
  Yellow: "rgba(234, 179, 8, 1)", // Tailwind yellow-500
} as const; 

export const ALLOWED_CHARACTERS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  numbers: "0123456789".split(""),
  special: ["!", "@", "#", "$"],
} as const;