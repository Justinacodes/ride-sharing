"use client";

import { useState, useEffect } from "react";
import { Home, Activity, CreditCard, User, Search, MapPin } from "lucide-react";
import { Modal } from "@/components/Modal";
import { OrderForm } from "@/components/OrderForm";
import { useUserStore } from "@/stores/userStore";
import { account } from "../appwrite";


export default function HomeScreen() {
  const [location, setLocation] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const { user, setUser } = useUserStore();
  // const showActivity = () => {
  //   router.push("/activity")
  // }

  
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
        <h2 className="text-xl font-bold">
          Hi {user?.name || "there"},
        </h2>
        <p className="text-sm text-gray-500">Welcome Back</p>

        {/* Wallet Card
        <div className="mt-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm">Your Balance</p>
              <h3 className="text-2xl font-bold">₦54,000</h3>
            </div>
            <button className="bg-white text-purple-700 font-semibold px-4 py-1 rounded-md">Deposit</button>
          </div>
          <p className="mt-2 text-xs">Rideshare Wallet</p>
          <p className="text-xs">Your Points: <strong>3782</strong></p>
        </div> */}

        {/* Location Info */}
        <div className="mt-6">
          <p className="text-sm font-semibold mb-1">Your Location</p>
          <div className="bg-gray-100 rounded-md p-2 text-sm flex items-center gap-2">
            <MapPin size={16} /> Lagos, Nigeria
          </div>

          {/* Order trigger input */}
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
              { name: "FUTA", address: "Akure, Ondo Stae, Nigeria" },
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

      {/* Bottom Nav */}
      {/* <div className="fixed bottom-0 w-full bg-white border-t border-gray-200">
      <div className="grid grid-cols-4 text-center text-xs">
        <Link href="/" className="flex flex-col items-center py-2" passHref>
          <div className={isActive("/") ? "text-purple-600" : "text-gray-600"}>
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
    </div> */}


      {/* Order Modal */}
      <Modal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)}>
        <OrderForm onClose={() => setShowOrderModal(false)} />
      </Modal>
    </div>
  );
}
