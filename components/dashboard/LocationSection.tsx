"use client";

import { Search, MapPin, Navigation, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

type Props = {
  location: string;
  onSearch: () => void;
  disabled?: boolean;
  recentSearches?: string[];
  quickLocations?: string[];
};

export default function LocationSearch({ 
  location, 
  onSearch, 
  disabled,
  recentSearches = [],
  quickLocations = ['Home', 'Work', 'Mall', 'Airport', 'Hospital']
}: Props) {
  const handleClick = () => {
    if (disabled) {
      toast.warning("You need to join a community before searching for rides", {
        description: "Join a community to start searching for rides in your area."
      });
    } else {
      onSearch();
    }
  };

  const handleQuickLocationClick = (quickLocation: string) => {
    if (disabled) {
      handleClick();
      return;
    }
    // You can implement quick location search logic here
    toast.info(`Searching rides to ${quickLocation}...`);
    onSearch();
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Current Location */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Navigation className="w-4 h-4 text-purple-600" />
          <p className="text-sm font-semibold text-gray-800">Your Location</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 text-sm flex items-center gap-3 border border-purple-200">
          <div className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-full">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800">{location}</p>
            <p className="text-xs text-gray-500">Current location</p>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Search Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-4 h-4 text-purple-600" />
          <p className="text-sm font-semibold text-gray-800">Find Rides</p>
          {!disabled && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Active</span>}
        </div>
        
        <div className="relative">
          <input
            type="text"
            readOnly
            className={`w-full border-2 rounded-lg px-4 py-3 text-sm focus:outline-none transition-all duration-200 ${
              disabled 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" 
                : "focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer hover:border-purple-300 bg-white border-gray-200"
            }`}
            placeholder={disabled ? "Join a community first" : "Where would you like to go?"}
            value=""
            onClick={handleClick}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {!disabled && <Zap className="w-4 h-4 text-purple-400" />}
            <Search className={`w-4 h-4 ${disabled ? 'text-gray-400' : 'text-purple-600'}`} />
          </div>
        </div>
        
        {disabled && (
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Join a community to unlock ride search
          </p>
        )}
      </div>

      {/* Quick Locations */}
      {!disabled && (
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Quick Destinations</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickLocations.map((location) => (
              <button
                key={location}
                onClick={() => handleQuickLocationClick(location)}
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full px-4 py-2 text-sm shrink-0 font-medium transition-colors duration-200 border border-purple-200 hover:border-purple-300"
              >
                {location}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {!disabled && recentSearches.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Recent Searches
          </p>
          <div className="space-y-2">
            {recentSearches.slice(0, 3).map((search, index) => (
              <button
                key={index}
                onClick={() => handleQuickLocationClick(search)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors duration-200 flex items-center gap-3 border border-gray-200 hover:border-gray-300"
              >
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <Clock className="w-3 h-3 text-gray-500" />
                </div>
                <span className="text-gray-700">{search}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      {!disabled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">💡</span>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">Pro Tip</p>
              <p className="text-xs text-blue-600">
                Use specific landmarks or addresses for better ride matches in your community.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}