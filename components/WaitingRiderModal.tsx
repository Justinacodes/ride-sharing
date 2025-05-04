// components/WaitingRiderModal.tsx
'use client';
import { Card } from '@/components/Card';
import { PhoneCall, MessageCircle } from 'lucide-react';

export function WaitingRiderModal() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Waiting for Rider</h2>
      <Card>
        <p className="text-sm font-semibold">#7A5HSF</p>
        <p className="text-sm">Moses Joshua (Level 3 Rider)</p>
        <p className="text-sm text-gray-500">mosesjoshua@gmail.com</p>
        <p className="text-sm text-gray-500">+234 70000 9993 99</p>
        <div className="mt-2 flex gap-3 text-purple-600">
          <PhoneCall className="w-5 h-5" />
          <MessageCircle className="w-5 h-5" />
        </div>
        <div className="mt-2 text-sm">
          <p>Car Type: Honda</p>
          <p>Police Number: KTP AA89BT</p>
          <p>Color: Red </p>
          <p>Car Seat: 4 Seats</p>
        </div>
        <div className="mt-2 text-sm font-medium">Total Payment: <span className="text-purple-600">N4000</span></div>
      </Card>
    </div>
  );
}
