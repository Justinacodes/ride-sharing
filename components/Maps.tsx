'use client'
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useMemo, useState } from 'react';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 9.0820,
  lng: 8.6753,
};

// const staticLocations = [
//   { id: 1, lat: 6.5244, lng: 3.3792 }, // Lagos
//   { id: 2, lat: 9.0578, lng: 7.4951 }, // Abuja
// ];

export default function Map() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });
  

  const [userLocation, setUserLocation] = useState<null | { lat: number; lng: number }>(null);
  const [path, setPath] = useState<{ lat: number; lng: number }[]>([]);

  useEffect(() => {
    let watchId: number;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newPoint = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newPoint);
          setPath((prev) => [...prev, newPoint]); 
        },
        (error) => {
          console.error('Error watching position:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser.');
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const center = useMemo(() => userLocation || defaultCenter, [userLocation]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={userLocation ? 15 : 6}
    >
      {/* {staticLocations.map((location) => (
        <Marker key={location.id} position={location} />
      ))} */}

      {userLocation && (
        <Marker
          position={userLocation}
          icon={{
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          }}
        />
      )}

      {/* Draw user's movement path */}
      {path.length > 1 && (
        <Polyline
          path={path}
          options={{
            strokeColor: '#1E90FF',
            strokeOpacity: 0.8,
            strokeWeight: 4,
          }}
        />
      )}
    </GoogleMap>
  );
}
