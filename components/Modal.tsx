// components/Modal.tsx
import React from "react";

export function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 p-4 relative shadow-xl">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl">
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
