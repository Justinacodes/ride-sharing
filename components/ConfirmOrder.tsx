// components/OrderForm.tsx
'use client';
import { useState } from 'react';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { MapPin, Search } from 'lucide-react';

export function OrderForm({ onClose }: { onClose: () => void }) {
  const [location, setLocation] = useState('');
  const [searching, setSearching] = useState(false);

  const locations = [
    'Potomac Breeze Charters',
    'Columbia River Yachting',
    'Navy Yard Sailing Center',
  ];

  const handleOrder = () => {
    setSearching(true);
    setTimeout(() => {}, 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {!searching ? (
        <>
          <h2 className="text-lg font-bold">Confirm Order</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline">I’m</Button>
            <Button variant="outline">Fam</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Car Seat</Button>
            <Button variant="outline">4 Seat</Button>
          </div>
          <Input
            placeholder="Search location where you go"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <div className="space-y-2">
            {locations.map((loc, i) => (
              <Card key={i}>
                <div className="flex items-center gap-2">
                  <MapPin className="text-purple-600 w-5 h-5" />
                  <div>
                    <p className="font-semibold text-sm">{loc}</p>
                    <p className="text-xs text-gray-500">Washington, DC</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Button onClick={handleOrder}>Order Now</Button>
        </>
      ) : (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-300 rounded-full animate-pulse" />
          <p className="text-lg font-medium">Searching Your Rider</p>
          <Card>
            <div className="flex items-center gap-2">
              <Search className="text-purple-600 w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">{location || 'Searching...'}</p>
                <p className="text-xs text-gray-500">Washington, DC</p>
              </div>
            </div>
          </Card>
          {/* <Button children={undefined} /> */}
        </div>
      )}
    </div>
  );
}
