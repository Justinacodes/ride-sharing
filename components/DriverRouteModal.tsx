import { Modal } from "@/components/Modal";
import DriverRouteForm from "./DriverRouteForm";
import { X } from "lucide-react";

interface DriverRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DriverRouteModal({ isOpen, onClose }: DriverRouteModalProps) {
  const handleSubmit = (data: any) => {
    console.log("Driver submitted:", data);
    // Submit to Appwrite or handle as needed
    onClose(); // close the modal
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

        <DriverRouteForm title="Schedule a Ride" onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
}
