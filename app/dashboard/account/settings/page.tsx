'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, UserCircle } from 'lucide-react';
import AccountSettingsForm from '@/components/AccountSettingsForm';
import { account } from '@/app/appwrite';
import { useUserStore } from '@/stores/userStore';
import { useEffect, useState } from 'react';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [userPrefs, setUserPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (user) {
        try {
          const prefs = await account.getPrefs();
          setUserPrefs(prefs);
        } catch (error) {
          console.error("Error fetching user preferences", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchUserPreferences();
  }, [user]);

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Top bar */}
      <div className="bg-purple-600 text-white p-4 flex items-center gap-2">
        <ArrowLeft className="cursor-pointer" onClick={() => router.back()} />
        <h1 className="text-lg font-semibold">Your Account</h1>
      </div>

      {/* Cover + Avatar */}
      <div className="relative">
        <div className="h-28 w-full bg-gradient-to-r from-purple-400 to-blue-400" />
        <div className="absolute top-14 left-1/2 -translate-x-1/2">
          <UserCircle className="h-24 w-24 text-gray-300 bg-white rounded-full border-4 border-white" />
        </div>
      </div>

      {/* Form */}
      <div className="mt-20 px-4">
        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <AccountSettingsForm 
            user={user} 
            userPrefs={userPrefs} 
          />
        )}
      </div>
    </div>
  );
}