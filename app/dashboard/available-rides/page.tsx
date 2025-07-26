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
import { RideRequestService } from "@/app/utils/rideRequests";

interface Ride extends Models.Document {
  driverId: string;
  driverName?: string;
  from: string;
  to: string;
  date: string;
  time: string;
  availableSeats: number;
  price?: number;
  communityId?: string;
  status: 'active' | 'full' | 'completed' | 'cancelled' | 'unknown';
  description?: string;
  carModel?: string;
  rating?: number;
  noOfSeats: number;
  fromArea?: string;
  toArea?: string;
  createdAt?: string;
}

// This is now a Next.js page component - it cannot accept props
export default function AvailableRidesPage() {
  const { user } = useUserStore();

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'tomorrow'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Environment variables for Appwrite
  const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID!;
  const RIDES_ID = process.env.NEXT_PUBLIC_APPWRITE_RIDES_COLLECTION_ID!;

  const fetchAvailableRides = useCallback(async () => {
    if (!DB_ID || !RIDES_ID) {
      console.error("Missing database configuration:", { DB_ID, RIDES_ID });
      toast.error("Database configuration error. Please check environment variables.");
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);

      let queries: string[] = [];

      if (user?.$id) {
        queries.push(Query.notEqual("driverId", user.$id));
      }

      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      switch (filter) {
        case 'today':
          queries.push(Query.equal("date", today));
          break;
        case 'tomorrow':
          queries.push(Query.equal("date", tomorrowStr));
          break;
        case 'all':
        default:
          queries.push(Query.greaterThanEqual("date", today));
          break;
      }

      console.log("Fetching rides with queries:", queries);
      console.log("Database ID:", DB_ID);
      console.log("Collection ID:", RIDES_ID);

      const result = await databases.listDocuments(
        DB_ID,
        RIDES_ID,
        queries
      );

      console.log("Raw result from Appwrite:", result);

      if (!result) {
        console.error("No result returned from Appwrite");
        toast.error("Failed to fetch rides: No response from database");
        setRides([]);
        return;
      }

      if (!result.documents) {
        console.error("Result does not contain documents property:", result);
        toast.error("Failed to fetch rides: Invalid response format");
        setRides([]);
        return;
      }

      if (!Array.isArray(result.documents)) {
        console.error("Documents is not an array:", typeof result.documents, result.documents);
        toast.error("Failed to fetch rides: Invalid documents format");
        setRides([]);
        return;
      }

      console.log(`Found ${result.documents.length} documents from database`);

      const isValidRide = (doc: any): doc is Ride => {
        const hasRequiredFields = doc &&
               typeof doc.$id === 'string' &&
               typeof doc.driverId === 'string' &&
               typeof doc.from === 'string' &&
               typeof doc.to === 'string' &&
               typeof doc.date === 'string' &&
               typeof doc.time === 'string';

        if (!hasRequiredFields) {
          console.warn("Invalid ride document - missing required fields:", doc);
          return false;
        }

        return true;
      };

      const validRides: Ride[] = result.documents
        .filter(isValidRide)
        .map(doc => ({
          ...doc,
          driverId: doc.driverId,
          driverName: doc.driverName || 'Unknown Driver',
          from: doc.from,
          to: doc.to,
          date: doc.date,
          time: doc.time,
          availableSeats: doc.availableSeats === null || doc.availableSeats === undefined ?
            (doc.noOfSeats ? Number(doc.noOfSeats) : 1) : Number(doc.availableSeats),
          noOfSeats: doc.noOfSeats === null || doc.noOfSeats === undefined ? 1 : Number(doc.noOfSeats),
          price: doc.price ? Number(doc.price) : undefined,
          communityId: doc.communityId,
          status: doc.status === null || doc.status === undefined ? 'active' : doc.status as 'active' | 'full' | 'completed' | 'cancelled' | 'unknown',
          description: doc.description,
          carModel: doc.carModel,
          rating: doc.rating ? Number(doc.rating) : undefined,
          fromArea: doc.fromArea,
          toArea: doc.toArea,
          createdAt: doc.createdAt,
        }));

      console.log(`Found ${validRides.length} valid rides from ${result.documents.length} total documents`);
      console.log("Valid rides:", validRides);

      if (validRides.length === 0) {
        const filterText = filter === 'all' ? '' : ` for ${filter}`;
        toast.info(`No rides available${filterText}.`);
      } else {
        toast.success(`Found ${validRides.length} available ride${validRides.length > 1 ? 's' : ''}!`);
      }

      setRides(validRides);

    } catch (error) {
      console.error("Error fetching rides:", error);

      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        if (error.message.includes('Collection with the requested ID could not be found')) {
          toast.error("Database collection not found. Please check your collection ID.");
        } else if (error.message.includes('Database with the requested ID could not be found')) {
          toast.error("Database not found. Please check your database ID.");
        } else if (error.message.includes('Unauthorized')) {
          toast.error("Unauthorized access. Please check your permissions.");
        } else {
          toast.error(`Failed to load rides: ${error.message}`);
        }
      } else {
        toast.error("Failed to load available rides. Please check your connection and try again.");
      }

      setRides([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.$id, filter, DB_ID, RIDES_ID]);

  const handleRequestRide = async (ride: Ride) => {
    console.log("handleRequestRide called for ride:", ride.$id);
    console.log("User data from store:", user);

    // Get user details
    const userId = user?.$id;
    const userName = user?.name;
    const userEmail = user?.email;
    
    // *** CRITICAL CHANGE HERE: Retrieve phone number more robustly ***
    // Appwrite user object has a 'phone' attribute directly if set
    // As a fallback, check user preferences if you've custom-stored it there.
    const userPhone = user?.phone || user?.prefs?.phone || user?.prefs?.userPhone;

    // Log all essential user properties for debugging
    console.log("Extracted User Properties for Request:", {
      $id: userId,
      name: userName,
      email: userEmail,
      phone: userPhone,
      // Add more if needed, e.g., user?.prefs
    });

    if (!userId || !userName || !userEmail) {
      console.error("Missing essential user data for request:", { 
        userId, 
        userName, 
        userEmail 
      });
      toast.warning("Please log in and ensure your profile has a name and email to request a ride.");
      return;
    }

    // Check if user phone is available and not an empty string
    if (!userPhone || userPhone.trim() === '') {
      toast.warning("Please add your phone number to your profile to request rides. You can update it in your profile settings.");
      return;
    }

    // Check if user is trying to request their own ride
    if (userId === ride.driverId) {
      toast.error("You cannot request your own ride.");
      return;
    }

    // Check if ride has available seats
    if (ride.availableSeats <= 0) {
      toast.error("Sorry, this ride has no available seats.");
      return;
    }

    setRequesting(ride.$id);

    try {
      console.log("About to call RideRequestService.createRideRequest with:", {
        rideId: ride.$id,
        userId,
        userName,
        userPhone, // Pass the validated userPhone
        userEmail,
        driverId: ride.driverId
      });

      // Use the RideRequestService to create the request
      await RideRequestService.createRideRequest(
        ride.$id,
        userId,
        userName,
        userPhone, // Pass the phone number directly
        userEmail,
        ride.driverId,
        1, // Default to 1 seat requested
        `Hi, I would like to join your ride from ${ride.from} to ${ride.to}. Thank you!`
      );

      console.log("Ride request created successfully!");
      toast.success("Ride request sent successfully! The driver will be notified.");
      
      // Re-fetch rides to update the UI with any changes (e.g., available seats)
      await fetchAvailableRides();

    } catch (error) {
      console.error("Error requesting ride:", error);
      
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        // Handle specific error messages
        if (error.message.includes("already have a pending request")) {
          toast.error("You already have a pending request for this ride.");
        } else if (error.message.includes("Missing required fields")) {
          toast.error("Please complete your profile (name, phone, email) to request rides.");
        } else if (error.message.includes("cannot request your own ride")) {
          toast.error("You cannot request your own ride.");
        } else if (error.message.includes("Missing database configuration")) {
          toast.error("Database configuration error. Please check your environment variables.");
        } else {
          toast.error(`Failed to send ride request: ${error.message}`);
        }
      } else {
        toast.error("Failed to send ride request. Please try again.");
      }
    } finally {
      setRequesting(null);
    }
  };

  const formatTime = (time: string) => {
    try {
      if (!time) return "Not specified";
      const timeStr = time.includes('T') ? time.split('T')[1] : time;
      return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
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
      if (!date) return "Not specified";
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

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium mb-2">Please Log In</p>
          <p className="text-sm text-gray-400">
            You need to be logged in to view and request available rides.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Car className="w-6 h-6 text-purple-600" />
          <h1 className="font-bold text-2xl text-gray-800">Available Rides</h1>
          {rides.length > 0 && (
            <span className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full">
              {rides.length} available
            </span>
          )}
        </div>

        <button
          onClick={fetchAvailableRides}
          disabled={refreshing}
          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50 px-3 py-2 rounded-md hover:bg-purple-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        {(['all', 'today', 'tomorrow'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
              filter === filterOption
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {filterOption === 'all' ? 'All Rides' : filterOption}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border border-gray-200 rounded-lg animate-pulse">
              <div className="flex justify-between items-start mb-4">
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

      {!loading && rides.length === 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-12 text-center">
          <Car className="w-20 h-20 mx-auto mb-6 text-purple-300" />
          <p className="text-purple-700 font-medium mb-3 text-lg">No rides available</p>
          <p className="text-sm text-purple-600 mb-6">
            {filter === 'all'
              ? 'There are no available rides right now.'
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

      {!loading && rides.length > 0 && (
        <div className="space-y-4">
          {rides.map((ride) => (
            <div
              key={ride.$id}
              className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-lg">{ride.driverName}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {ride.carModel && (
                        <>
                          <span>{ride.carModel}</span>
                          <span>•</span>
                        </>
                      )}
                      {ride.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span>{ride.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 text-lg font-medium text-gray-800">
                    <Clock className="w-5 h-5" />
                    {formatTime(ride.time)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(ride.date)} • {getTimeDifference(ride.date, ride.time)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-base font-medium text-gray-800">{ride.from}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-base font-medium text-gray-800">{ride.to}</span>
                  </div>
                </div>
                <Navigation className="w-6 h-6 text-gray-400" />
              </div>

              {ride.description && (
                <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-md">
                  {ride.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">{ride.availableSeats} seat{ride.availableSeats !== 1 ? 's' : ''}</span>
                  </div>

                  {ride.price && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      <span className="font-medium">₦{ride.price}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleRequestRide(ride)}
                  disabled={requesting === ride.$id || ride.availableSeats === 0}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requesting === ride.$id ? "Requesting..." :
                   ride.availableSeats === 0 ? "No Seats" : "Request Ride"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}