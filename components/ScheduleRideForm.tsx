"use client";

import { useState } from "react";
import { Button } from "./Button";
// import { Input } from "@/components/ui/input"; 
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";       

type Props = {
  onClose: () => void;
};

export default function ScheduleRideForm({ onClose }: Props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would call your backend/API to store the scheduled ride
    console.log({ from, to, date, time, notes });

    // Reset form
    setFrom("");
    setTo("");
    setDate("");
    setTime("");
    setNotes("");

    onClose();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Schedule a Ride</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="From"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          required
        />
        <input
          placeholder="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
            Schedule Ride
          </button>
        </div>
      </form>
    </div>
  );
}
