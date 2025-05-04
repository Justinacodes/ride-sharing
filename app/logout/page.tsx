"use client"
import { useUserStore } from '@/stores/userStore';
import React from 'react'
import { account } from '../appwrite';

const logout = () => {
    const { user, setUser, clearUser } = useUserStore();
    const logout = async () => {
        try {
          await account.deleteSession("current");
          clearUser();
        } catch (error) {
          console.error("Logout failed:", error);
        }
      };

    
  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <p className="mb-4 text-lg">Logged in as <strong>{user.name}</strong></p>
        <button
          type="button"
          onClick={logout}
          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
        
      </div>
    );
  }

}

export default logout
