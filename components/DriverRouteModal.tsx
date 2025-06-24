"use client";

import { Modal } from "@/components/Modal";
import DriverRouteForm from "./DriverRouteForm";
import { X } from "lucide-react";
import { account, databases } from "@/app/appwrite";
import { ID } from "appwrite";
import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";

interface DriverRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DriverRouteModal({ isOpen, onClose }: DriverRouteModalProps) {
  const { user, setUser } = useUserStore();

  // ✅ Fetch user when modal mounts
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

  // ✅ Handle form submit
  const handleSubmit = async (data: any) => {
    if (!user) {
      console.error("User not available");
      return;
    }
const extractArea = (address: string) => {
  return address.split(",")[0].trim().toLowerCase(); // e.g., "Agege"
};

    try {
      await databases.createDocument(
        "67fd20cb0004451b13d0",        // database ID
        "684731600025abc0da34",       // collection ID
        ID.unique(),
        {
          driverId: user.$id,        // Use user's Appwrite ID
          from: data.from,
          to: data.to,
          fromArea: extractArea(data.from),
          toArea: extractArea(data.to),
          date: data.date,
          time: data.time,
          createdAt: data.time,
          noOfSeats: data.noOfSeats,
        }
      );

      console.log("Ride scheduled successfully");
      onClose();
    } catch (error) {
      console.error("Error scheduling ride:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-lg mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Schedule a Ride</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <DriverRouteForm title="" onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
}
