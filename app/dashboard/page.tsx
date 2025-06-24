"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Modal } from "@/components/Modal";
import { useUserStore } from "@/stores/userStore";
import { account } from "../appwrite";
import LogoutButton from "../logout/page";
import SearchOrderScreen from "@/components/SearchOrderScreen";
import DriverRouteModal from "@/components/DriverRouteModal";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LocationSearch from "@/components/dashboard/LocationSection";
import HistoryDestination from "@/components/dashboard/HistorySection";
import CommunitiesSection from "@/components/dashboard/CommunitiesSection";

const Map = dynamic(() => import("../../components/Maps"), { ssr: false });

export default function HomeScreen() {
  const [location, setLocation] = useState("Fetching location...");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [hasJoinedCommunity, setHasJoinedCommunity] = useState(false);
  const [userCommunities, setUserCommunities] = useState<string[]>([]);
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

    const fetchLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            );
            const data = await res.json();
            const address = data?.results?.[0]?.formatted_address || "Unknown location";
            setLocation(address);
          },
          (err) => {
            console.error("Location error:", err);
            setLocation("Unable to get location");
          }
        );
      } else {
        setLocation("Geolocation not supported");
      }
    };

    fetchUser();
    fetchLocation();
  }, [user, setUser]);

  const handleJoinStatusChange = (hasJoined: boolean, joinedCommunities: string[]) => {
    setHasJoinedCommunity(hasJoined);
    setUserCommunities(joinedCommunities);
  };

  return (
    <div className="bg-white min-h-screen text-gray-900 pb-24">
      <div className="p-4">
        {!hasJoinedCommunity && (
          <div className="bg-purple-50 border border-purple-200 text-purple-800 p-4 rounded-lg mb-4 shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span className="text-purple-600 text-lg">📣</span> Join a Community
            </h3>
            <p className="text-sm mt-1">
              You have not joined any community yet. Select one below to get started with ride offers and bookings.
            </p>
          </div>
        )}

        <DashboardHeader
          name={user?.name || "there"}
          onOfferRide={() => {
            if (!hasJoinedCommunity) {
              toast.warning("You need to join a community before offering rides");
              return;
            }
            setShowDriverModal(true);
          }}
          disabled={!hasJoinedCommunity}
        />

        <LocationSearch
          location={location}
          onSearch={() => {
            if (!hasJoinedCommunity) {
              toast.warning("You need to join a community before searching for rides");
              return;
            }
            setShowOrderModal(true);
          }}
          disabled={!hasJoinedCommunity}
        />

        <HistoryDestination destinations={[]} />

        <CommunitiesSection onJoinStatusChange={handleJoinStatusChange} />
      </div>

      <Modal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} fullScreen scrollable>
        <SearchOrderScreen onClose={() => setShowOrderModal(false)} />
      </Modal>

      <DriverRouteModal isOpen={showDriverModal} onClose={() => setShowDriverModal(false)} />
    </div>
  );
}