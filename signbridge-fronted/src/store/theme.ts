import { create } from "zustand";
import { COLOR_ROLE_ACCESS } from "../constants/account.constant";

interface ThemeState {
  color: string;
  updateColors: (newColors: string) => void;
}

var data = localStorage.getItem("color");

if (data !== null) {
  // console.log("Data found in localStorage:", data);
} else {
  // console.log("No data found in localStorage");
}

export const useThemeStore = create<ThemeState>((set) => ({
  color: data ?? COLOR_ROLE_ACCESS.public.color,
  updateColors: (newColors) => set({ color: newColors }),
}));
