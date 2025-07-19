"use client";

import { Clock, MapPin, Calendar, TrendingUp, Star } from "lucide-react";

interface RideHistory {
  id: string;
  destination: string;
  date: string;
  type: 'offered' | 'taken';
  status: 'completed' | 'cancelled';
  rating?: number;
  distance?: string;
  duration?: string;
}

interface HistoryDestinationProps {
  destinations?: string[];
  recentRides?: RideHistory[];
  onDestinationClick?: (destination: string) => void;
  disabled?: boolean;
}


export default function HistoryDestination({ 
  destinations = [], 
  recentRides = [],
  onDestinationClick,
  disabled = false
}: HistoryDestinationProps) {
  const handleDestinationClick = (destination: string) => {
    if (disabled) return;
    onDestinationClick?.(destination);
  };

  // Get popular destinations from history
  const getPopularDestinations = () => {
    const destinationCount: { [key: string]: number } = {};
    recentRides.forEach(ride => {
      destinationCount[ride.destination] = (destinationCount[ride.destination] || 0) + 1;
    });
    
    return Object.entries(destinationCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([destination, count]) => ({ destination, count }));
  };

  const popularDestinations = getPopularDestinations();

  if (disabled) {
    return (
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <p className="font-semibold text-gray-400">Ride History</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium mb-1">No History Available</p>
          <p className="text-sm text-gray-400">Join a community to start building your ride history</p>
        </div>
      </div>
    );
  }

  if (destinations.length === 0 && recentRides.length === 0) {
    return (
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-purple-600" />
          <p className="font-semibold text-gray-800">Ride History</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-purple-300" />
          <p className="text-purple-700 font-medium mb-1">No rides yet</p>
          <p className="text-sm text-purple-600">Your ride history will appear here once you start using the service</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Quick Access Destinations */}
      {destinations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <p className="font-semibold text-gray-800">Quick Destinations</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {destinations.map((item) => (
              <button
                key={item}
                onClick={() => handleDestinationClick(item)}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 py-2 text-sm shrink-0 font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Destinations */}
      {popularDestinations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-amber-500" />
            <p className="font-semibold text-gray-800">Popular Destinations</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularDestinations.map(({ destination, count }) => (
              <button
                key={destination}
                onClick={() => handleDestinationClick(destination)}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-800">{destination}</span>
                  </div>
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                    {count}x
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Rides */}
      {recentRides.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-purple-600" />
            <p className="font-semibold text-gray-800">Recent Activity</p>
          </div>
          <div className="space-y-3">
            {recentRides.slice(0, 5).map((ride) => (
              <div
                key={ride.id}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        ride.type === 'offered' 
                          ? 'bg-blue-500' 
                          : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-800">
                        {ride.type === 'offered' ? 'Offered ride to' : 'Took ride to'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ride.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {ride.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{ride.destination}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {ride.date}
                      </div>
                      {ride.distance && (
                        <span>{ride.distance}</span>
                      )}
                      {ride.duration && (
                        <span>{ride.duration}</span>
                      )}
                    </div>
                  </div>

                  {ride.rating && ride.status === 'completed' && (
                    <div className="flex items-center gap-1 ml-3">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-medium text-gray-700">{ride.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {recentRides.length > 5 && (
            <button className="w-full mt-3 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
              View all rides ({recentRides.length})
            </button>
          )}
        </div>
      )}

      {/* Stats Summary */}
      {recentRides.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-4 text-white">
          <h3 className="font-semibold mb-3">Your Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{recentRides.length}</p>
              <p className="text-xs text-purple-200">Total Rides</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {recentRides.filter(r => r.type === 'offered').length}
              </p>
              <p className="text-xs text-purple-200">Rides Offered</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {recentRides.filter(r => r.status === 'completed').length}
              </p>
              <p className="text-xs text-purple-200">Completed</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}