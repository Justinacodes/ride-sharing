// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import {
//   GoogleMap,
//   LoadScript,
//   Marker,
// } from '@react-google-maps/api';

// const containerStyle = {
//   width: '100%',
//   height: '400px',
// };

// export default function SearchOrderScreen({ onClose }: { onClose: () => void }) {
//   const [from, setFrom] = useState<google.maps.LatLngLiteral | null>(null);
//   const [to, setTo] = useState<google.maps.LatLngLiteral | null>(null);
//   const [fromAddress, setFromAddress] = useState('');
//   const [toAddress, setToAddress] = useState('');
//   const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({ lat: 6.5244, lng: 3.3792 });

//   const fromInputRef = useRef<HTMLInputElement | null>(null);
//   const toInputRef = useRef<HTMLInputElement | null>(null);
//   const fromAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
//   const toAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition((pos) => {
//         const userLoc = {
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude,
//         };
//         setFrom(userLoc);
//         setMapCenter(userLoc);
//         reverseGeocode(userLoc, setFromAddress);
//       });
//     }
//   }, []);

//   const reverseGeocode = (location: google.maps.LatLngLiteral, callback: (address: string) => void) => {
//     const geocoder = new google.maps.Geocoder();
//     geocoder.geocode({ location }, (results, status) => {
//       if (status === 'OK' && results && results[0]) {
//         callback(results[0].formatted_address);
//       }
//     });
//   };

//   const handlePlaceChanged = (type: 'from' | 'to') => {
//     const autocomplete = type === 'from' ? fromAutocompleteRef.current : toAutocompleteRef.current;
//     if (autocomplete) {
//       const place = autocomplete.getPlace();
//       if (place.geometry && place.geometry.location) {
//         const lat = place.geometry.location.lat();
//         const lng = place.geometry.location.lng();
//         const position = { lat, lng };

//         if (type === 'from') {
//           setFrom(position);
//           setFromAddress(place.formatted_address || '');
//         } else {
//           setTo(position);
//           setToAddress(place.formatted_address || '');
//           setMapCenter(position); // center on destination when chosen
//         }
//       }
//     }
//   };

//   const handleFindRiders = () => {
//     if (from && to) {
//       console.log('Searching from', from, 'to', to);
//       //I'd add my rider search logic here
//     }
//   };

//   return (
//     <div className="h-full max-h-screen overflow-y-auto flex flex-col justify-between p-4">
//       <div>
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold">Plan Your Ride</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 text-2xl"
//           >
//             &times;
//           </button>
//         </div>

//         {/* From & To Inputs */}
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">From</label>
//             <input
//               ref={fromInputRef}
//               type="text"
//               defaultValue={fromAddress}
//               className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//               placeholder="Enter starting point"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">To</label>
//             <input
//               ref={toInputRef}
//               type="text"
//               className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//               placeholder="Enter destination"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Map */}
//       <LoadScript
//         googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
//         libraries={['places']}
//         onLoad={() => {
//           if (window.google && fromInputRef.current && toInputRef.current) {
//             fromAutocompleteRef.current = new window.google.maps.places.Autocomplete(fromInputRef.current);
//             toAutocompleteRef.current = new window.google.maps.places.Autocomplete(toInputRef.current);

//             fromAutocompleteRef.current.addListener('place_changed', () => handlePlaceChanged('from'));
//             toAutocompleteRef.current.addListener('place_changed', () => handlePlaceChanged('to'));
//           }
//         }}
//       >
//         <div className="pt-4">
//           <GoogleMap
//             mapContainerStyle={containerStyle}
//             center={mapCenter}
//             zoom={14}
//           >
//             {from && <Marker position={from} label="From" />}
//             {to && <Marker position={to} label="To" />}
//           </GoogleMap>
//         </div>
//       </LoadScript>

//       {/* Bottom Action Button */}
//       <div className="pt-4">
//         <button
//           onClick={handleFindRiders}
//           disabled={!from || !to}
//           className={`w-full py-3 rounded-md text-white text-sm font-medium transition ${
//             from && to ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'
//           }`}
//         >
//           Find Available Riders
//         </button>
//       </div>
//     </div>
//   );
// }
