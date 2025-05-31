import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  fullScreen?: boolean;
  scrollable?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  fullScreen = false,
  scrollable = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div
        className={`bg-white relative shadow-xl ${
          fullScreen ? "w-full h-full rounded-none" : "max-w-md rounded-lg mx-4"
        } ${scrollable ? "overflow-y-auto" : ""}`}
      >
   
        <div className={`${fullScreen ? "p-4 pt-12" : "p-4"}`}>{children}</div>
      </div>
    </div>
  );
}
