"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const mockDrivers = [
  {
    id: "drv001",
    name: "Chinedu Okafor",
    email: "chinedu.okafor@gmail.com",
    phone: "+234 701 234 5678",
    rating: 4.9,
    vehicle: {
      type: "Toyota Corolla",
      plate: "KJA123AB",
      color: "Black",
      seats: 4,
    },
  },
  {
    id: "drv002",
    name: "Amina Yusuf",
    email: "amina.yusuf@gmail.com",
    phone: "+234 803 456 7890",
    rating: 4.7,
    vehicle: {
      type: "Honda Civic",
      plate: "ABC456DE",
      color: "Silver",
      seats: 4,
    },
  },
  {
    id: "drv003",
    name: "Emeka Nwosu",
    email: "emeka.nwosu@gmail.com",
    phone: "+234 805 678 1234",
    rating: 5.0,
    vehicle: {
      type: "Lexus RX 350",
      plate: "LAG789FG",
      color: "White",
      seats: 4,
    },
  },
];

type FoundRiderModalProps = {
  onClose: () => void;
  onConfirm: () => void;
};

export default function FoundRiderModal({ onClose, onConfirm }: FoundRiderModalProps) {
  const [driver, setDriver] = useState<typeof mockDrivers[0] | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const matchedDriver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)];
      setDriver(matchedDriver);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  if (!driver) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-6 relative animate-pulse text-center">
          <p className="text-lg font-medium text-gray-700">Searching for a rider...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-6 relative transition-all duration-300 ease-in-out">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-4">Confirm Order</h2>

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div>
              <p className="font-bold">{driver.name}</p>
              <p className="text-xs text-gray-500">{driver.email}</p>
              <p className="text-xs text-gray-500">Phone: {driver.phone}</p>
              <p className="text-yellow-500 text-sm font-medium mt-1">⭐ {driver.rating}</p>
            </div>
          </div>

          <div className="text-sm mt-4 space-y-1">
            <p><span className="font-semibold">Car Type:</span> {driver.vehicle.type}</p>
            <p><span className="font-semibold">Plate:</span> {driver.vehicle.plate}</p>
            <p><span className="font-semibold">Color:</span> {driver.vehicle.color}</p>
            <p><span className="font-semibold">Seats:</span> {driver.vehicle.seats}</p>
          </div>
        </div>

        <div className="mt-4">
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm mt-2"
            placeholder="Search destination"
          />
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="font-semibold text-sm">Total Payment</p>
          <p className="text-lg font-bold">₦4,000</p>
        </div>

        <button
          onClick={onConfirm}
          className="mt-4 w-full bg-purple-600 text-white font-semibold py-2 rounded-md"
        >
          Confirm Rider
        </button>
      </div>
    </div>
  );
}
