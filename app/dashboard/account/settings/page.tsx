'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, UserCircle } from 'lucide-react';
import AccountSettingsForm from '@/components/AccountSettingsForm';

export default function AccountSettingsPage() {
  const router = useRouter();

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
        <AccountSettingsForm />
      </div>
    </div>
  );
}
