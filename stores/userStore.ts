import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Models } from "appwrite";

type User = Models.User<Models.Preferences> | null;

type UserStore = {
  user: User;
  setUser: (user: User) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      
    }),
    {
      name: "user-storage", // Key in localStorage
    }
  )
);
