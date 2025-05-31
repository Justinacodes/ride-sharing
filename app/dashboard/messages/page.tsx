"use client";
import React, { useState } from "react";
import { ArrowLeft, Phone } from "lucide-react";

const messages = [
  {
    name: "Leilani Angel",
    lastMessage: "Hello! I'm available to pick you up. I'll be ther..",
    new: true,
    now: true,
    time: "2m ago",
  },
  {
    name: "Alex Wheeler",
    lastMessage: "Hello! I'm available to pick you up. I'll be th..",
    new: false,
    date: "09/27/24",
  },
  // Add other mock users as needed...
];

const chatMessages = [
  {
    fromUser: false,
    time: "02.00 PM",
    text: "Hello! I'm available to pick you up. I'll be there in about",
  },
  {
    fromUser: true,
    time: "02.00 PM",
    text: "Thankyou Sir",
  },
  {
    fromUser: false,
    time: "02.00 PM",
    text: "I've arrived at Location. Look for a Red Car  with the license plate XXXX.",
  },
  {
    fromUser: true,
    time: "02.00 PM",
    text: "Great! I'll be there in a minute.",
  },
  {
    fromUser: false,
    time: "02.00 PM",
    text: "...",
  },
];

export default function MessageScreen() {
  const [selectedChat, setSelectedChat] = useState(0);

  return (
    <div className="flex h-screen">
      {/* Message List */}
      <div className="w-1/3 border-r bg-white">
        <div className="p-4 border-b flex items-center">
          <button className="mr-2">
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Your Message</h2>
        </div>
        <div className="flex justify-around p-2">
          <button className="px-4 py-1 bg-purple-200 rounded-full font-semibold">Messages</button>
          <button className="px-4 py-1 bg-gray-200 rounded-full font-semibold">Call History</button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-130px)]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 cursor-pointer ${idx === selectedChat ? "bg-purple-200" : "hover:bg-gray-100"}`}
              onClick={() => setSelectedChat(idx)}
            >
              <div className="flex justify-between">
                <span className="font-semibold">{msg.name} {msg.now && <span className="text-xs">- (your rider now)</span>}</span>
                <span className="text-xs text-gray-400">{msg.time || msg.date}</span>
              </div>
              <div className="text-sm text-gray-600">{msg.lastMessage}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Screen */}
      <div className="w-2/3 bg-white flex flex-col">
        <div className="flex items-center p-4 border-b">
          <button className="mr-2">
            <ArrowLeft />
          </button>
          <h2 className="flex-grow font-semibold text-lg">Leilani Angel</h2>
          <button className="bg-yellow-200 p-2 rounded-full">
            <Phone className="text-yellow-700" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.fromUser ? "justify-end" : "justify-start"}`}>
              <div className="flex flex-col max-w-xs">
                <div className={`text-xs text-gray-400 ${msg.fromUser ? "text-right" : "text-left"}`}>{msg.time}</div>
                <div
                  className={`p-2 rounded-lg ${msg.fromUser ? "bg-green-100 text-right" : "bg-blue-100 text-left"}`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t flex items-center">
          <input
            type="text"
            placeholder="Type Your Message"
            className="flex-1 border p-2 rounded-full focus:outline-none"
          />
          <button className="ml-2 text-purple-600 font-bold">⏎</button>
        </div>
      </div>
    </div>
  );
}
