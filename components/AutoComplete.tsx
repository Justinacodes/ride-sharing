// components/AutocompleteInput.tsx
"use client";

import { Autocomplete } from "@react-google-maps/api";
import { useRef } from "react";

export default function AutocompleteInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        onChange(place.formatted_address);
      } else if (place.name) {
        onChange(place.name);
      }
    }
  };

  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm"
          placeholder={`Enter ${label.toLowerCase()}`}
          required
        />
      </Autocomplete>
    </div>
  );
}
