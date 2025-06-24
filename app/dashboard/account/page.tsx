'use client';

import BalanceItem from '@/components/BalanceItem';
import AccountMenuItem from '@/components/AccountMenuItem';
import { useRouter } from 'next/navigation';
import { UserCircle } from 'lucide-react';
import { Button } from '@/components/Button';
import { FaChevronRight } from 'react-icons/fa';

export default function AccountPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center w-full bg-white min-h-screen">
      <div className="bg-purple-600 text-white w-full p-4 pb-8 rounded-b-2xl">
        <div className="flex flex-col items-center gap-2">
        <UserCircle className="h-16 w-16 text-gray-300 bg-white rounded-full" />
          <p className="text-lg font-semibold">Richard Steven G.</p>
          <p className="text-sm opacity-80">+12 *** 7890</p>
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
