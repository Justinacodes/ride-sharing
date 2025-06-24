"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { databases, Query } from "@/app/appwrite";
import { useUserStore } from "@/stores/userStore";
import { Models } from "appwrite";
import { 
  Car, 
  MapPin, 
  Clock, 
  User, 
  Calendar,
  Navigation,
  DollarSign,
  Users,
  Star,
  Filter,
  RefreshCw
} from "lucide-react";

interface Ride extends Models.Document {
  driverId: string;
  driverName: string;
  from: string;
  to: string;
  date: string;
  time: string;
  availableSeats: number;
  price?: number;
  communityId: string;
  status: 'active' | 'full' | 'completed' | 'cancelled';
  description?: string;
  carModel?: string;
  rating?: number;
}

interface AvailableRidesSectionProps {
  joinedCommunities: string[];
  disabled?: boolean;
  onRequestRide?: (rideId: string) => void;
}

export default function AvailableRidesSection({ 
  joinedCommunities, 
  disabled = false,
  onRequestRide 
}: AvailableRidesSectionProps) {
  const { user } = useUserStore();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'tomorrow'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID!;
  const RIDES_ID = process.env.NEXT_PUBLIC_RIDES_ID!; // You'll need to add this collection

  const fetchAvailableRides = useCallback(async () => {
    if (disabled || joinedCommunities.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      
      // Build queries for each joined community
      const queries = [
        Query.equal("status", "active"),
        Query.greaterThan("availableSeats", 0),
        Query.notEqual("driverId", user?.$id || ""), // Don't show user's own rides
      ];

      // Add community filter
      if (joinedCommunities.length > 0) {
        queries.push(Query.contains("communityId", joinedCommunities));
      }

      // Add date filter
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      if (filter === 'today') {
        queries.push(Query.equal("date", today));
      } else if (filter === 'tomorrow') {
        queries.push(Query.equal("date", tomorrow));
      } else {
        // For 'all', get rides from today onwards
        queries.push(Query.greaterThanEqual("date", today));
      }

      const response = await databases.listDocuments(
        DB_ID,
        RIDES_ID,
        queries
      );

      setRides(response.documents as Ride[]);
    } catch (error) {
      console.error("Error fetching rides:", error);
      toast.error("Failed to load available rides");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [DB_ID, RIDES_ID, disabled, joinedCommunities, user?.$id, filter]);

  const handleRequestRide = async (rideId: string) => {
    if (!user?.$id) {
      toast.warning("Please log in to request a ride");
      return;
    }

    setRequesting(rideId);
    
    try {
      // Call the parent's onRequestRide function or implement your ride request logic
      if (onRequestRide) {
        onRequestRide(rideId);
      } else {
        // Default implementation - you can customize this
        toast.success("Ride request sent! The driver will be notified.");
      }
    } catch (error) {
      console.error("Error requesting ride:", error);
      toast.error("Failed to request ride. Please try again.");
    } finally {
      setRequesting(null);
    }
  };

  const formatTime = (time: string) => {
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return time;
    }
  };

  const formatDate = (date: string) => {
    try {
      const rideDate = new Date(date);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (rideDate.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (rideDate.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return rideDate.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch {
      return date;
    }
  };

  const getTimeDifference = (date: string, time: string) => {
    try {
      const rideDateTime = new Date(`${date}T${time}`);
      const now = new Date();
      const diffMs = rideDateTime.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes > 0 ? `${diffMinutes}m` : 'Soon';
      } else if (diffHours < 24) {
        return `${diffHours}h`;
      } else {
        return `${Math.floor(diffHours / 24)}d`;
      }
    } catch {
      return '';
    }
  };

  useEffect(() => {
    fetchAvailableRides();
  }, [fetchAvailableRides]);

  if (disabled) {
    return (
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Car className="w-5 h-5 text-gray-400" />
          <p className="font-semibold text-gray-400">Available Rides</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium mb-2">Join a Community First</p>
          <p className="text-sm text-gray-400">
            You need to join a community to see and request available rides in your area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-purple-600" />
          <p className="font-semibold text-lg text-gray-800">Available Rides</p>
          {rides.length > 0 && (
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
              {rides.length} available
            </span>
          )}
        </div>
        
        <button
          onClick={fetchAvailableRides}
          disabled={refreshing}
          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        {(['all', 'today', 'tomorrow'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
              filter === filterOption
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {filterOption === 'all' ? 'All Rides' : filterOption}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-300 rounded w-20"></div>
              </div>
              <div className="h-3 bg-gray-300 rounded w-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* No Rides State */}
      {!loading && rides.length === 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 text-center">
          <Car className="w-16 h-16 mx-auto mb-4 text-purple-300" />
          <p className="text-purple-700 font-medium mb-2">No rides available</p>
          <p className="text-sm text-purple-600 mb-4">
            {filter === 'all' 
              ? 'There are no available rides in your communities right now.'
              : `No rides available for ${filter}.`
            }
          </p>
          <button
            onClick={fetchAvailableRides}
            className="text-sm text-purple-600 hover:text-purple-700 underline"
          >
            Refresh to check again
          </button>
        </div>
      )}

      {/* Rides List */}
      {!loading && rides.length > 0 && (
        <div className="space-y-4">
          {rides.map((ride) => (
            <div
              key={ride.$id}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              {/* Driver Info & Time */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{ride.driverName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {ride.carModel && (
                        <>
                          <span>{ride.carModel}</span>
                          <span>•</span>
                        </>
                      )}
                      {ride.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{ride.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-800">
                    <Clock className="w-4 h-4" />
                    {formatTime(ride.time)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(ride.date)} • {getTimeDifference(ride.date, ride.time)}
                  </div>
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-800">{ride.from}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-800">{ride.to}</span>
                  </div>
                </div>
                <Navigation className="w-5 h-5 text-gray-400" />
              </div>

              {/* Description */}
              {ride.description && (
                <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                  {ride.description}
                </p>
              )}

              {/* Bottom Info & Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{ride.availableSeats} seat{ride.availableSeats !== 1 ? 's' : ''}</span>
                  </div>
                  
                  {ride.price && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${ride.price}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleRequestRide(ride.$id)}
                  disabled={requesting === ride.$id}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requesting === ride.$id ? "Requesting..." : "Request Ride"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}