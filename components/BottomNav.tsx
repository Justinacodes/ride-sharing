"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, CreditCard, User } from "lucide-react";

const BottomNav = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-200">
      <div className="grid grid-cols-4 text-center text-xs">
        <Link href="/homepage" className="flex flex-col items-center py-2" passHref>
          <div className={isActive("/homepage") ? "text-purple-600" : "text-gray-600"}>
            <Home size={20} />
            <span>Home</span>
          </div>
        </Link>
        <Link href="/activity" className="flex flex-col items-center py-2" passHref>
          <div className={isActive("/activity") ? "text-purple-600" : "text-gray-600"}>
            <Activity size={20} />
            <span>Activity</span>
          </div>
        </Link>
        <Link href="/payment" className="flex flex-col items-center py-2" passHref>
          <div className={isActive("/payment") ? "text-purple-600" : "text-gray-600"}>
            <CreditCard size={20} />
            <span>Payment</span>
          </div>
        </Link>
        <Link href="/account" className="flex flex-col items-center py-2" passHref>
          <div className={isActive("/account") ? "text-purple-600" : "text-gray-600"}>
            <User size={20} />
            <span>Account</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
