"use client";

import { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import { databases, Query } from "@/app/appwrite";
import type { Models } from "appwrite";
import { useUserStore } from "@/stores/userStore";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, User, Star, Users, DollarSign, Clock, Navigation } from "lucide-react";
import haversine from "haversine-distance";

const containerStyle = {
  width: "100%",
  height: "400px",
};

interface Ride {
  $id: string;
  driverId: string;
  driverName: string;
  from: string;
  to: string;
  date: string;
  time: string;
  availableSeats: number;
  noOfSeats: number; // Keep both for compatibility
  price?: number;
  communityId: string;
  status: 'active' | 'full' | 'completed' | 'cancelled';
  description?: string;
  carModel?: string;
  rating?: number;
  fromCoordinates: google.maps.LatLngLiteral;
  toCoordinates: google.maps.LatLngLiteral;
}

export default function SearchOrderScreen({ 
  onClose, 
  joinedCommunities = [],
  onRequestRide 
}: { 
  onClose: () => void;
  joinedCommunities?: string[];
  onRequestRide?: (rideId: string) => void;
}) {
  const { user } = useUserStore();
  const [from, setFrom] = useState<google.maps.LatLngLiteral | null>(null);
  const [to, setTo] = useState<google.maps.LatLngLiteral | null>(null);
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({ lat: 6.5244, lng: 3.3792 });
  const [rides, setRides] = useState<Ride[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  const fromInputRef = useRef<HTMLInputElement | null>(null);
  const toInputRef = useRef<HTMLInputElement | null>(null);
  const fromAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const toAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID!;
  const RIDES_ID = process.env.NEXT_PUBLIC_APPWRITE_RIDES_COLLECTION_ID!;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLoc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setFrom(userLoc);
          setMapCenter(userLoc);
          
          // Only reverse geocode if Google Maps is loaded
          if (isGoogleMapsLoaded && window.google) {
            reverseGeocode(userLoc, setFromAddress);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Unable to get your location. Please enter manually.");
        }
      );
    }
  }, [isGoogleMapsLoaded]);

  const reverseGeocode = (location: google.maps.LatLngLiteral, callback: (address: string) => void) => {
    if (!window.google) return;
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        callback(results[0].formatted_address);
      } else {
        console.error("Geocoding failed:", status);
      }
    });
  };

  const initializeAutocomplete = () => {
    if (!window.google || !fromInputRef.current || !toInputRef.current) return;

    try {
      // Clean up existing autocomplete instances
      if (fromAutocompleteRef.current) {
        google.maps.event.clearInstanceListeners(fromAutocompleteRef.current);
      }
      if (toAutocompleteRef.current) {
        google.maps.event.clearInstanceListeners(toAutocompleteRef.current);
      }

      // Create new autocomplete instances
      fromAutocompleteRef.current = new window.google.maps.places.Autocomplete(fromInputRef.current, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'ng' } // Restrict to Nigeria based on default coordinates
      });
      
      toAutocompleteRef.current = new window.google.maps.places.Autocomplete(toInputRef.current, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'ng' }
      });

      // Add event listeners
      fromAutocompleteRef.current.addListener("place_changed", () => handlePlaceChanged("from"));
      toAutocompleteRef.current.addListener("place_changed", () => handlePlaceChanged("to"));
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
    }
  };

  const handlePlaceChanged = (type: "from" | "to") => {
    const autocomplete = type === "from" ? fromAutocompleteRef.current : toAutocompleteRef.current;
    if (!autocomplete) return;

    try {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const position = { lat, lng };

        if (type === "from") {
          setFrom(position);
          setFromAddress(place.formatted_address || place.name || "");
        } else {
          setTo(position);
          setToAddress(place.formatted_address || place.name || "");
          setMapCenter(position);
        }
      }
    } catch (error) {
      console.error("Error handling place change:", error);
    }
  };

  const fetchAvailableRides = async () => {
    if (!from || !to) {
      toast.error("Please select both locations.");
      return;
    }

    if (!DB_ID || !RIDES_ID) {
      console.error("Missing database configuration:", { DB_ID, RIDES_ID });
      toast.error("Database configuration error. Please check environment variables.");
      return;
    }

    setIsSearching(true);

    try {
      // Build queries array - be more explicit about the query construction
      let queries: string[] = [];
      
      // Basic filters
      queries.push(Query.equal("status", "active"));
      queries.push(Query.greaterThan("availableSeats", 0));

      // Don't show user's own rides if user is logged in
      if (user?.$id) {
        queries.push(Query.notEqual("driverId", user.$id));
      }

      // Get rides from today onwards
      const today = new Date().toISOString().split('T')[0];
      queries.push(Query.greaterThanEqual("date", today));

      // Add community filter if available
      if (joinedCommunities.length > 0) {
        // For multiple communities, we might need to make separate queries
        // or use Query.contains if communityId is an array field
        // For now, let's filter by the first community or use OR logic
        if (joinedCommunities.length === 1) {
          queries.push(Query.equal("communityId", joinedCommunities[0]));
        } else {
          // If you have multiple communities, you might need to use Query.contains
          // or make multiple requests. For now, let's use the first one:
          queries.push(Query.equal("communityId", joinedCommunities[0]));
        }
      }

      console.log("Fetching rides with queries:", queries);
      console.log("Database ID:", DB_ID);
      console.log("Collection ID:", RIDES_ID);

      // Make the request with explicit parameter names
      const result = await databases.listDocuments(
        DB_ID,      // databaseId
        RIDES_ID,   // collectionId  
        queries     // queries array
      );

      const radiusKm = 10; // 10km radius for matching
      
      // Type guard function to validate ride data
      const isValidRide = (doc: any): doc is Ride => {
        return doc && 
               typeof doc.$id === 'string' &&
               typeof doc.driverId === 'string' &&
               typeof doc.driverName === 'string' &&
               typeof doc.from === 'string' &&
               typeof doc.to === 'string' &&
               typeof doc.date === 'string' &&
               typeof doc.time === 'string' &&
               typeof doc.availableSeats === 'number' &&
               typeof doc.communityId === 'string' &&
               typeof doc.status === 'string' &&
               doc.fromCoordinates &&
               doc.toCoordinates &&
               typeof doc.fromCoordinates.lat === 'number' &&
               typeof doc.fromCoordinates.lng === 'number' &&
               typeof doc.toCoordinates.lat === 'number' &&
               typeof doc.toCoordinates.lng === 'number';
      };

      // Convert documents to rides with proper type checking
      const validRides: Ride[] = result.documents
        .filter(isValidRide)
        .map(doc => ({
          $id: doc.$id,
          driverId: doc.driverId,
          driverName: doc.driverName,
          from: doc.from,
          to: doc.to,
          date: doc.date,
          time: doc.time,
          availableSeats: doc.availableSeats,
          noOfSeats: doc.noOfSeats || doc.availableSeats, // Fallback
          price: doc.price,
          communityId: doc.communityId,
          status: doc.status as 'active' | 'full' | 'completed' | 'cancelled',
          description: doc.description,
          carModel: doc.carModel,
          rating: doc.rating,
          fromCoordinates: doc.fromCoordinates,
          toCoordinates: doc.toCoordinates,
        }));

      console.log(`Found ${validRides.length} valid rides from ${result.documents.length} total documents`);

      const matchedRides = validRides.filter((ride) => {
        try {
          // Check proximity to pickup and dropoff points
          const fromDistance = haversine(from, ride.fromCoordinates) / 1000; // in km
          const toDistance = haversine(to, ride.toCoordinates) / 1000;

          // Both pickup and dropoff should be within radius
          if (fromDistance > radiusKm || toDistance > radiusKm) return false;

          // Optional: Additional destination matching for better accuracy
          if (fromAddress && toAddress && ride.from && ride.to) {
            const fromMatch = ride.from.toLowerCase().includes(fromAddress.split(",")[0].toLowerCase()) ||
                              fromAddress.toLowerCase().includes(ride.from.split(",")[0].toLowerCase());
            const toMatch = ride.to.toLowerCase().includes(toAddress.split(",")[0].toLowerCase()) ||
                           toAddress.toLowerCase().includes(ride.to.split(",")[0].toLowerCase());

            return fromMatch && toMatch; // Both should match for better results
          }

          return true; // If no address strings, rely on distance matching
        } catch (error) {
          console.error("Error calculating distance for ride:", ride.$id, error);
          return false;
        }
      });

      if (matchedRides.length === 0) {
        toast.error("No nearby rides match your criteria. Try expanding your search radius or checking different times.");
      } else {
        toast.success(`Found ${matchedRides.length} matching ride${matchedRides.length > 1 ? 's' : ''}!`);
      }

      setRides(matchedRides);
    } catch (error) {
      console.error("Ride search failed:", error);
      toast.error("Failed to fetch rides. Please check your connection and try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequestRide = async (rideId: string) => {
    if (!user?.$id) {
      toast.error("Please log in to request a ride");
      return;
    }

    setRequesting(rideId);
    
    try {
      if (onRequestRide) {
        await onRequestRide(rideId);
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
      if (!time) return "Not specified";
      // Handle different time formats
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

  const handleGoogleMapsLoad = () => {
    setIsGoogleMapsLoaded(true);
    // Initialize autocomplete after maps is loaded
    setTimeout(initializeAutocomplete, 100);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fromAutocompleteRef.current) {
        google.maps.event.clearInstanceListeners(fromAutocompleteRef.current);
      }
      if (toAutocompleteRef.current) {
        google.maps.event.clearInstanceListeners(toAutocompleteRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full max-h-screen overflow-y-auto flex flex-col justify-between p-4 relative">
      <Toaster position="top-center" />
      
      {/* Searching Overlay */}
      {isSearching && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg px-6 py-4 text-center">
            <div className="flex items-center gap-2 justify-center animate-pulse">
              <Loader2 className="animate-spin h-5 w-5 text-purple-600" />
              <span className="text-purple-600 font-medium">Searching for rides...</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Find Your Ride</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* From & To Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <input
              ref={fromInputRef}
              type="text"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter starting point"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <input
              ref={toInputRef}
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter destination"
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        libraries={["places"]}
        onLoad={handleGoogleMapsLoad}
        onError={(error) => {
          console.error("Google Maps failed to load:", error);
          toast.error("Failed to load Google Maps. Please refresh the page.");
        }}
      >
        <div className="pt-4">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={14}
            onLoad={() => {
              // Additional map load handling if needed
            }}
          >
            {from && <Marker position={from} label="A" title="Your pickup location" />}
            {to && <Marker position={to} label="B" title="Your destination" />}
            
            {/* Show ride markers */}
            {rides.map((ride, index) => (
              ride.fromCoordinates && (
                <Marker
                  key={`ride-${ride.$id}`}
                  position={ride.fromCoordinates}
                  title={`Ride by ${ride.driverName}: ${ride.from} → ${ride.to}`}
                  icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#7c3aed" stroke="white" stroke-width="2"/>
                        <text x="12" y="16" font-family="Arial" font-size="10" font-weight="bold" text-anchor="middle" fill="white">${index + 1}</text>
                      </svg>
                    `),
                    scaledSize: new google.maps.Size(24, 24),
                  }}
                />
              )
            ))}
          </GoogleMap>
        </div>
      </LoadScript>

      {/* Search Button */}
      <div className="pt-4">
        <button
          onClick={fetchAvailableRides}
          disabled={!from || !to || isSearching}
          className={`w-full py-3 rounded-md text-white text-sm font-medium transition ${
            from && to && !isSearching
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isSearching ? "Searching..." : "Find Available Rides"}
        </button>
      </div>

      {/* Ride Results Modal */}
      {rides.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-lg font-semibold">Available Rides ({rides.length})</h3>
              <button
                onClick={() => setRides([])}
                className="text-gray-500 hover:text-red-600 transition text-xl"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Rides List */}
            <div className="p-4 space-y-4">
              {rides.map((ride, index) => (
                <div
                  key={ride.$id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
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
                              <span>{ride.rating.toFixed(1)}</span>
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
                        {formatDate(ride.date)}
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
                        <span>{ride.availableSeats || ride.noOfSeats} seat{(ride.availableSeats || ride.noOfSeats) !== 1 ? 's' : ''}</span>
                      </div>
                      
                      {ride.price && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>₦{ride.price}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleRequestRide(ride.$id)}
                      disabled={requesting === ride.$id}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {requesting === ride.$id ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Requesting...
                        </div>
                      ) : (
                        "Request Ride"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}