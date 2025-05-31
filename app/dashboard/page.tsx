"use client";

import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useUserStore } from "@/stores/userStore";
import { account } from "../appwrite";
import LogoutButton from "../logout/page";
import dynamic from "next/dynamic";
import SearchOrderScreen from "@/components/SearchOrderScreen";

const Map = dynamic(() => import("../../components/Maps"), { ssr: false });

// function SearchOrderScreen({ onClose }: { onClose: () => void }) {
//   const [showMap, setShowMap] = useState(false);

//   return (
//     <div className="h-full space-y-4">
//       <div className="flex justify-between items-center">
//         <h2 className="text-lg font-semibold">Search Ride Location</h2>
//         <button onClick={onClose} className="text-sm text-purple-600">Close</button>
//       </div>

//       <div className="relative">
//         <input
//           type="text"
//           placeholder="Tap to search on map"
//           readOnly
//           onClick={() => setShowMap(true)}
//           className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
//         />
//         <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
//       </div>

//       {showMap && (
//         <div className="h-[400px] w-full">
//           <Map />
//         </div>
//       )}
//     </div>
//   );
// }

export default function HomeScreen() {
  const [location, setLocation] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const { user, setUser } = useUserStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user) {
          const currentUser = await account.get();
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, [user, setUser]);

  return (
    <div className="bg-white min-h-screen text-gray-900 pb-24">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-bold">Hi {user?.name || "there"},</h2>
            <p className="text-sm text-gray-500">Welcome Back</p>
          </div>
          <LogoutButton />
        </div>

        {/* Location Info */}
        <div className="mt-6">
          <p className="text-sm font-semibold mb-1">Your Location</p>
          <div className="bg-gray-100 rounded-md p-2 text-sm flex items-center gap-2">
            <MapPin size={16} /> Lagos, Nigeria
          </div>

          {/* Search trigger */}
          <p className="mt-4 text-sm font-semibold">Search Location</p>
          <div className="relative mt-1">
            <input
              type="text"
              readOnly
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              placeholder="Search location where you go"
              value={location}
              onClick={() => setShowOrderModal(true)}
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        {/* History */}
        <div className="mt-6">
          <p className="font-semibold mb-2">History Destination</p>
          <div className="flex gap-2 overflow-x-auto">
            {["My Home", "Elizade", "Lekki,Lagos", "Yaba, Lagos"].map((item) => (
              <button
                key={item}
                className="bg-purple-600 text-white rounded-full px-4 py-2 text-sm shrink-0"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Communities */}
        <div className="mt-6">
          <p className="font-semibold mb-2">Communities</p>
          <div className="space-y-2">
            {[
              { name: "Elizade University", address: "Ilara-Mokin, Ondo State, Nigeria" },
              { name: "FUTA", address: "Akure, Ondo State, Nigeria" },
              { name: "Unilag", address: "Lagos, Nigeria" },
            ].map(({ name, address }) => (
              <div key={name} className="p-3 border rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-xs text-gray-500">{address}</p>
                </div>
                <button className="bg-purple-600 text-white text-xs px-3 py-1 rounded-md">Join</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen & Scrollable Modal */}
      <Modal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} fullScreen scrollable>
        <SearchOrderScreen onClose={() => setShowOrderModal(false)} />
      </Modal>
    </div>
  );
}
