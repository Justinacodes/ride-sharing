// app/activity/page.tsx
"use client";

import { useState } from "react";
import { ChevronRight, Trash2 } from "lucide-react";

const historyRides = [
  {
    title: "Capital City Cruises",
    date: "September 18 2023",
    price: "$32",
  },
  {
    title: "Potomac Breeze Charters",
    date: "September 18 2023",
    price: "$32",
  },
  {
    title: "Harbor Lights Sailboat Rentals",
    date: "September 18 2023",
    price: "$21",
  },
  {
    title: "Capital Cove Yacht Charters",
    date: "September 18 2023",
    price: "$10",
  },
];

const savedLocations = [
  "Seaside Harbor Yacht Rentals",
  "Capital City Cruises",
  "Potomac Breeze Charters",
  "Monument Marina Yacht Club",
  "Cherry Blossom Sailing Adventures",
  "Patriot Yacht Rentals",
  "Columbia River Yachting",
  "Harbor Lights Sailboat Rentals",
  "Riverside Yacht Haven",
];


export default function ActivityPage() {
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  const toggleCheckbox = (idx: number) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };
  
  return (
    <div className="min-h-screen bg-white p-4 text-gray-900">
      <header className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Your Activity</h1>
        </div>
        {/* <button
          className="text-purple-600 text-sm"
          onClick={() => setEditMode((prev) => !prev)}
        >
          {editMode ? "Done" : "Edit"}
        </button> */}
{/*         
          {!editMode && <button className="text-purple-600 text-sm">Edit</button>} */}
      </header>

      {/* History Rides */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-2">History Ride</h2>
        <div className="space-y-3">
          {historyRides.map((ride, idx) => (
            <div
              key={idx}
              className="border p-3 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-sm">{ride.title}</p>
                <p className="text-xs text-gray-500">{ride.date}</p>
                <p className="text-xs text-gray-500 mt-1">Hapus</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{ride.price}</p>
                <button className="text-xs bg-purple-600 text-white px-3 py-1 rounded-md mt-1">
                  Re-order
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Saved Locations */}
      <section>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold">Location Saved</h2>
        <button
          className="text-purple-600 text-sm"
          onClick={() => {
            setEditMode((prev) => !prev);
            setSelected([]); // reset selection when toggling mode
          }}
        >
          {editMode ? "Done" : "Edit"}
        </button>
      </div>

      <div className="space-y-3">
        {savedLocations.map((loc, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center p-3 border rounded-md"
          >
            <div className="flex items-center gap-3">
              {editMode && (
                <input
                  type="checkbox"
                  checked={selected.includes(idx)}
                  onChange={() => toggleCheckbox(idx)}
                  className="accent-purple-600"
                />
              )}
              <div>
                <p className="font-semibold text-sm">{loc}</p>
                <p className="text-xs text-gray-500">
                  123 Marina Avenue, Washington, D.C. 20003
                </p>
              </div>
            </div>

            {editMode ? (
              <div className="flex gap-2">
                <button className="text-xs bg-yellow-500 text-white px-3 py-1 rounded-md">
                  Update
                </button>
                <button className="text-xs bg-red-500 text-white p-1 rounded-md">
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button className="text-xs bg-purple-600 text-white px-4 py-1 rounded-md">
                Order
              </button>
            )}
          </div>
        ))}

        {editMode && selected.length > 0 && (
          <button className="w-full mt-4 bg-red-600 text-white py-2 rounded-md text-sm font-semibold">
            Delete Selected ({selected.length})
          </button>
        )}
      </div>
    </section>
    </div>
  );
}