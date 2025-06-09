// components/DriverRouteForm.tsx
"use client";

import { useState } from "react";

export default function DriverRouteForm({
  title,
  onSubmit,
}: {
  title: string;
  onSubmit: (data: any) => void;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ from, to, date, time });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>

      <div>
        <label className="block text-sm mb-1">From</label>
        <input
          type="text"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm"
          placeholder="Enter starting location"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">To</label>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm"
          placeholder="Enter destination"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Time</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-purple-600 text-white py-2 rounded-md"
      >
        Submit
      </button>
    </form>
  );
}
