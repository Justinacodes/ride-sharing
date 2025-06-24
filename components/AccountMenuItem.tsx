// components/account/AccountMenuItem.tsx
import { FaChevronRight } from "react-icons/fa";

interface AccountMenuItemProps {
  label: string;
  onClick?: () => void;
}

export default function AccountMenuItem({ label, onClick }: AccountMenuItemProps) {
  return (
    <div
      className="flex justify-between items-center p-3 bg-gray-50 rounded-xl shadow-sm cursor-pointer"
      onClick={onClick}
    >
      <span>{label}</span>
      <FaChevronRight className="text-gray-400" />
    </div>
  );
}
