'use client';

import BalanceItem from '@/components/BalanceItem';
import AccountMenuItem from '@/components/AccountMenuItem';
import { useRouter } from 'next/navigation';
import { UserCircle } from 'lucide-react';
import { Button } from '@/components/Button';
import { FaChevronRight } from 'react-icons/fa';
import { useUserStore } from '@/stores/userStore';
import { useEffect, useState } from 'react';
import { account } from '@/app/appwrite'; // Adjust path as needed

export default function AccountPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [userPrefs, setUserPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (user) {
        try {
          // Get user preferences which should contain the phone number
          const prefs = await account.getPrefs();
          setUserPrefs(prefs);
        } catch (error) {
          console.error('Error fetching user preferences:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserPreferences();
  }, [user]);

  // Function to mask phone number
  const maskPhoneNumber = (phone: string) => {
    if (!phone) return '+12 *** 7890'; // fallback
    
    // Remove any non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    if (cleanPhone.length >= 4) {
      // Show first 3 characters and last 4 digits with *** in between
      const start = cleanPhone.slice(0, 3);
      const end = cleanPhone.slice(-4);
      return `${start} *** ${end}`;
    }
    
    return '+12 *** 7890'; // fallback if phone format is unexpected
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center w-full bg-white min-h-screen">
        <div className="bg-purple-600 text-white w-full p-4 pb-8 rounded-b-2xl">
          <div className="flex flex-col items-center gap-2">
            <UserCircle className="h-16 w-16 text-gray-300 bg-white rounded-full" />
            <div className="animate-pulse">
              <div className="h-6 bg-purple-400 rounded w-32 mb-2"></div>
              <div className="h-4 bg-purple-400 rounded w-24"></div>
            </div>
            <Button
              variant="outline"
              className="mt-2 text-xs"
              onClick={() => router.push('/dashboard/account/settings')}
            >
              Account Setting <FaChevronRight className="ml-1" />
            </Button>
          </div>
        </div>

        <div className="w-11/12 mt-[-2rem] shadow-md rounded-xl p-4 bg-white">
          <div className="flex justify-between">
            <BalanceItem label="Balance" amount="N80" />
            <BalanceItem label="Deposit" amount="N200" color="text-green-600" />
            <BalanceItem label="Expense" amount="-N120" color="text-red-500" />
          </div>
        </div>

        <div className="w-11/12 mt-4 space-y-2">
          <AccountMenuItem label="Payment Method" />
          <AccountMenuItem label="Join Affiliate Rideshare" />
          <AccountMenuItem label="Security Setting" />
          <AccountMenuItem label="Support Center" />
          <AccountMenuItem label="Term & Condition" />
          <AccountMenuItem label="Privacy Policy" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full bg-white min-h-screen">
      <div className="bg-purple-600 text-white w-full p-4 pb-8 rounded-b-2xl">
        <div className="flex flex-col items-center gap-2">
          <UserCircle className="h-16 w-16 text-gray-300 bg-white rounded-full" />
          <p className="text-lg font-semibold">
            {user?.name || 'User Name'}
          </p>
          <p className="text-sm opacity-80">
            {userPrefs?.phone ? maskPhoneNumber(userPrefs.phone) : '+12 *** 7890'}
          </p>
          <Button
            variant="outline"
            className="mt-2 text-xs"
            onClick={() => router.push('/dashboard/account/settings')}
          >
            Account Setting <FaChevronRight className="ml-1" />
          </Button>
        </div>
      </div>

      <div className="w-11/12 mt-[-2rem] shadow-md rounded-xl p-4 bg-white">
        <div className="flex justify-between">
          <BalanceItem label="Balance" amount="N80" />
          <BalanceItem label="Deposit" amount="N200" color="text-green-600" />
          <BalanceItem label="Expense" amount="-N120" color="text-red-500" />
        </div>
      </div>

      <div className="w-11/12 mt-4 space-y-2">
        <AccountMenuItem label="Payment Method" />
        <AccountMenuItem label="Join Affiliate Rideshare" />
        <AccountMenuItem label="Security Setting" />
        <AccountMenuItem label="Support Center" />
        <AccountMenuItem label="Term & Condition" />
        <AccountMenuItem label="Privacy Policy" />
      </div>
    </div>
  );
}