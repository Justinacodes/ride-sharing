'use client';
import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import FoundRiderModal from '@/components/FoundRiderModal';
import { WaitingRiderModal } from '@/components/WaitingRiderModal';

export function OrderForm({ onClose }: { onClose: () => void }) {
  const [location, setLocation] = useState('');
  const [searching, setSearching] = useState(false);
  const [step, setStep] = useState<'search' | 'found' | 'waiting'>('search');

  const locations = [
    'Lagos, Nigeria',
    'Akure, Nigeria',
    'Lekki, Lagos',
  ];

  const handleOrder = () => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setStep('found');
    }, 2000);
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'search' && !searching && (
        <motion.div
          key="search"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4"
        >
          <h2 className="text-lg font-bold">Order a Ride</h2>

          {/* <div className="flex items-center gap-2">
            <Button variant="outline">I’m</Button>
            <Button variant="outline">Fam</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Car Seat</Button>
            <Button variant="outline">4 Seat</Button>
          </div> */}

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
                    <p className="text-xs text-gray-500">Lagos, Nigeria</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button onClick={handleOrder}>Order Now</Button>
        </motion.div>
      )}

      {step === 'search' && searching && (
        <motion.div
          key="searching"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 mx-auto bg-gray-300 rounded-full animate-pulse" />
          <p className="text-lg font-medium">Searching Your Rider</p>
          <Card>
            <div className="flex items-center gap-2">
              <Search className="text-purple-600 w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">{location || 'Searching...'}</p>
                <p className="text-xs text-gray-500">Lagos, Nigeria</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {step === 'found' && (
        <motion.div
          key="found"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3 }}
        >
          <FoundRiderModal
            onConfirm={() => setStep('waiting')}
            onClose={() => {
              setStep('search');
              setLocation('');
            }}
          />
        </motion.div>
      )}

      {step === 'waiting' && (
        <motion.div
          key="waiting"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3 }}
        >
          <WaitingRiderModal />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
