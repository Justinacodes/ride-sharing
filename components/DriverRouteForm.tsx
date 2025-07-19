"use client";

import { useState, useRef } from "react";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { toast } from "sonner";
import { Car, MapPin, Clock, Users, DollarSign, FileText, Loader2 } from "lucide-react";

const libraries: ("places")[] = ["places"];

interface RouteFormData {
  from: string;
  to: string;
  date: string;
  time: string;
  noOfSeats: number;
  availableSeats: number;
  price?: string;
  description?: string;
  carModel?: string;
  fromCoordinates: google.maps.LatLngLiteral;
  toCoordinates: google.maps.LatLngLiteral;
}

export default function DriverRouteForm({
  title,
  onSubmit,
  loading = false,
}: {
  title: string;
  onSubmit: (data: RouteFormData) => void;
  loading?: boolean;
}) {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    noOfSeats: 0,
    availableSeats: 0,
    price: "",
    description: "",
    carModel: "",
    fromCoordinates: { lat: 0, lng: 0 },
    toCoordinates: { lat: 0, lng: 0 },
  });
  const [error, setError] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  const fromAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const toAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      if (field === 'noOfSeats') {
        const numValue = parseInt(value) || 0;
        return {
          ...prev,
          noOfSeats: numValue,
          availableSeats: value ? numValue : prev.availableSeats
        };
      } else if (field === 'availableSeats') {
        return {
          ...prev,
          availableSeats: parseInt(value) || 0
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  const handlePlaceChange = (
    autocompleteRef: React.MutableRefObject<google.maps.places.Autocomplete | null>,
    field: 'from' | 'to'
  ) => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.formatted_address) {
      setFormData(prev => ({ ...prev, [field]: place.formatted_address! }));
    } else if (place?.name) {
      setFormData(prev => ({ ...prev, [field]: place.name! }));
    }
  };

  const geocode = async (address: string): Promise<google.maps.LatLngLiteral | null> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      toast.error("Google Maps API key not configured");
      return null;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results?.[0]?.geometry?.location) {
        return {
          lat: data.results[0].geometry.location.lat,
          lng: data.results[0].geometry.location.lng
        };
      }

      throw new Error(`Geocoding failed: ${data.status}`);
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const validateForm = () => {
    if (!formData.from || !formData.to) {
      return "Please enter both pickup and destination locations";
    }
    if (!formData.date || !formData.time) {
      return "Please select date and time";
    }
    if (!formData.noOfSeats || formData.noOfSeats < 1) {
      return "Please enter valid number of seats";
    }
    if (!formData.availableSeats || formData.availableSeats < 1) {
      return "Please enter valid number of available seats";
    }
    if (formData.availableSeats > formData.noOfSeats) {
      return "Available seats cannot be more than total seats";
    }
    if (formData.price && parseFloat(formData.price) < 0) {
      return "Price cannot be negative";
    }

    // Check if date is not in the past
    const selectedDate = new Date(`${formData.date}T${formData.time}`);
    const now = new Date();
    if (selectedDate <= now) {
      return "Please select a future date and time";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsGeocoding(true);

    try {
      // Get coordinates for both addresses
      const [fromCoordinates, toCoordinates] = await Promise.all([
        geocode(formData.from),
        geocode(formData.to)
      ]);

      if (!fromCoordinates || !toCoordinates) {
        setError("Unable to get coordinates for one or both addresses. Please check the locations.");
        return;
      }

      // Prepare final data - ensure numeric fields are integers
      const submitData: RouteFormData = {
        from: formData.from,
        to: formData.to,
        date: formData.date,
        time: formData.time,
        noOfSeats: Number(formData.noOfSeats),
        availableSeats: Number(formData.availableSeats),
        fromCoordinates,
        toCoordinates,
        ...(formData.price && { price: formData.price }),
        ...(formData.description && { description: formData.description }),
        ...(formData.carModel && { carModel: formData.carModel }),
      };

      onSubmit(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
      setError("Failed to process locations. Please try again.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const isSubmitting = loading || isGeocoding;

  // Use useLoadScript hook instead of LoadScript component
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 text-sm">Error loading Google Maps</p>
          <p className="text-gray-500 text-xs mt-1">Please check your API key configuration</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
          <p className="text-gray-600 text-sm">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Route Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Route Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location
                </label>
                <Autocomplete
                  onLoad={(ref) => (fromAutocompleteRef.current = ref)}
                  onPlaceChanged={() => handlePlaceChange(fromAutocompleteRef, 'from')}
                >
                  <input
                    type="text"
                    value={formData.from}
                    onChange={(e) => handleInputChange('from', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter starting location"
                    required
                  />
                </Autocomplete>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <Autocomplete
                  onLoad={(ref) => (toAutocompleteRef.current = ref)}
                  onPlaceChanged={() => handlePlaceChange(toAutocompleteRef, 'to')}
                >
                  <input
                    type="text"
                    value={formData.to}
                    onChange={(e) => handleInputChange('to', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter destination"
                    required
                  />
                </Autocomplete>
              </div>
            </div>

            {/* Schedule Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Schedule
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seat and Pricing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Capacity & Pricing
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Seats
                  </label>
                  <input
                    type="number"
                    value={formData.noOfSeats || ''}
                    onChange={(e) => handleInputChange('noOfSeats', e.target.value)}
                    min="1"
                    max="8"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Total seats"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Seats
                  </label>
                  <input
                    type="number"
                    value={formData.availableSeats || ''}
                    onChange={(e) => handleInputChange('availableSeats', e.target.value)}
                    min="1"
                    max={formData.noOfSeats || 8}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Available seats"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Price per Seat (Optional)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Additional Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Car Model (Optional)
                </label>
                <input
                  type="text"
                  value={formData.carModel}
                  onChange={(e) => handleInputChange('carModel', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Toyota Camry, Honda Civic"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Any additional information about your ride..."
                />
              </div>
            </div>

            {/* Add some bottom padding to ensure the last elements aren't cut off */}
            <div className="pb-4"></div>
          </form>
        </div>

        {/* Fixed Footer with Submit Button */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white">
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={(e) => {
              // Find the form element and trigger submit
              const formElement = document.querySelector('form');
              if (formElement) {
                formElement.requestSubmit();
              }
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isGeocoding ? "Processing locations..." : "Creating ride..."}
              </>
            ) : (
              "Create Ride"
            )}
          </button>
        </div>
      </div>
    );
  }