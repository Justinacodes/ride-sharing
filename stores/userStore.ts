import { create } from "zustand";
import { Models } from "appwrite";

type User = Models.User<Models.Preferences> | null;

type UserStore = {
  user: User;
  setUser: (user: User) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
