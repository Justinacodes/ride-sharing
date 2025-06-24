"use client";

import LogoutButton from "@/app/logout/page";
import { toast } from "sonner";
import { Car, Users, Clock } from "lucide-react";

type DashboardHeaderProps = {
  name: string;
  onOfferRide: () => void;
  disabled?: boolean;
  joinedCommunities?: string[];
  stats?: {
    totalRides?: number;
    totalCommunities?: number;
    lastRideDate?: string;
  };
};

export default function DashboardHeader({ 
  name, 
  onOfferRide, 
  disabled, 
  joinedCommunities = [],
  stats = {}
}: DashboardHeaderProps) {
  const handleClick = () => {
    if (disabled) {
      toast.warning("You need to join a community before offering rides", {
        description: "Join a community to start offering and requesting rides in your area."
      });
    } else {
      onOfferRide();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-1">
              {getGreeting()}, {name}! 👋
            </h2>
            <p className="text-purple-100 text-sm">
              {joinedCommunities.length > 0 
                ? `You're part of ${joinedCommunities.length} ${joinedCommunities.length === 1 ? 'community' : 'communities'}`
                : "Join a community to get started with ride sharing"
              }
            </p>
          </div>

          {/* Stats Section */}
          {(stats.totalRides || stats.totalCommunities || stats.lastRideDate) && (
            <div className="flex gap-4 mb-4">
              {stats.totalRides !== undefined && (
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                  <Car className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-purple-100">Total Rides</p>
                    <p className="font-semibold">{stats.totalRides}</p>
                  </div>
                </div>
              )}
              
              {stats.totalCommunities !== undefined && (
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                  <Users className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-purple-100">Communities</p>
                    <p className="font-semibold">{stats.totalCommunities}</p>
                  </div>
                </div>
              )}
              
              {stats.lastRideDate && (
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                  <Clock className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-purple-100">Last Ride</p>
                    <p className="font-semibold text-xs">{stats.lastRideDate}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 items-start ml-4">
          <button
            onClick={handleClick}
            className={`${
              disabled 
                ? "bg-white/20 cursor-not-allowed text-white/60" 
                : "bg-white text-purple-600 hover:bg-purple-50 shadow-md hover:shadow-lg"
            } px-6 py-3 rounded-lg text-sm font-semibold min-w-[140px] transition-all duration-200 flex items-center justify-center gap-2`}
            disabled={disabled}
          >
            <Car className="w-4 h-4" />
            {disabled ? "Join Community" : "Offer a Ride"}
          </button>
          
          <div className="min-w-[120px]">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              joinedCommunities.length > 0 ? 'bg-green-400' : 'bg-orange-400'
            }`}></div>
            <span className="text-sm text-purple-100">
              {joinedCommunities.length > 0 
                ? 'Ready to ride!' 
                : 'Setup required'
              }
            </span>
          </div>
          
          {!disabled && (
            <div className="text-xs text-purple-200">
              All systems ready • {new Date().toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}