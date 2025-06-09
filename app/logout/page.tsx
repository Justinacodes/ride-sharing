"use client";

import { useRouter } from "next/navigation";
import { account } from "../appwrite";
import { useUserStore } from "@/stores/userStore";

const LogoutButton = () => {
  const router = useRouter();
  const { clearUser } = useUserStore();

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      clearUser();
      router.push("/login"); 
    } catch (error) {
      router.push("/login");
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="p-5 bg-red-500 text-white rounded-lg hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default LogoutButton;


