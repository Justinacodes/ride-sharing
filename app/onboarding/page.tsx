"use client"
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const slides = [
  {
    title: "Welcome to RideShare",
    heading: "Where Journeys Meet Communities",
    description:
      "Connect with trusted riders and drivers within your neighborhood. RideShare brings people together through smarter, safer travel.",
    image: "/assets/onboarding.jpg",
    buttons: [
      { text: "Skip", variant: "ghost" },
      { text: "Next", variant: "ghost" },
    ],
  },
  {
    title: "Shared by Neighbors",
    heading: "Ride with Familiar Faces",
    description:
      "Find or offer rides to people you know or live around. Build trust and comfort by sharing rides with familiar and verified community members.",
    image: "/assets/onboarding2.jpg",
    buttons: [
      { text: "Previous", variant: "ghost" },
      { text: "Next", variant: "ghost" },
    ],
  },
  {
    title: "Eco-Friendly Travel",
    heading: "Save Money & the Planet",
    description:
      "Reduce your carbon footprint and travel expenses by carpooling. One small ride can make a big difference for your wallet and the world.",
    image: "/assets/money.jpg",
    buttons: [
      { text: "Previous", variant: "ghost" },
      { text: "Next", variant: "ghost" },
    ],
  },
  {
    title: "Smart Matchmaking",
    heading: "Find the Right Ride Instantly",
    description:
      "Get paired with nearby drivers or riders who match your route. Our algorithm ensures timely, smooth, and safe travel every time.",
    image: "/assets/onboarding-4.jpg",
    buttons: [
      { text: "Previous", variant: "ghost" },
      { text: "Get Started", variant: "success" },
    ],
  },
];

const OnboardingCarousel = () => {
  const [page, setPage] = useState(0);
  const router = useRouter()

  const next = () => {
    if (page < slides.length - 1) setPage(page + 1);
  };
  const prev = () => {
    if (page > 0) setPage(page - 1);
  };
  const skip = () => {
    setPage(slides.length - 1);
  };
  const getStarted = () => {
 router.push("/login")
  };

  return (
    <div className="w-full h-screen flex items-center bg-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="w-full flex flex-col md:flex-row items-center justify-between gap-10 p-0"
        >
          <div className="flex-1 flex justify-center">
            <Image
              src={slides[page].image!}
              alt="illustration"
              width={1000}
              height={1000}
              className="object-contain"
            />
          </div>

          <div className="flex-1 p-2">
            <p className="text-sm text-gray-500 mb-1">{slides[page].title}</p>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              {slides[page].heading}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {slides[page].description}
            </p>

            <div className="flex gap-4">
              {slides[page].buttons.map((btn) => (
                <button
                  key={btn.text}
                  onClick={() => {
                    if (btn.text === "Skip") skip();
                    else if (btn.text === "Next") next();
                    else if (btn.text === "Previous") prev();
                    else if (btn.text === "Get Started") getStarted();
                  }}
                  className={`flex-1 py-2 rounded-lg ${
                    btn.variant === "primary"
                      ? "bg-primary text-white"
                      : btn.variant === "success"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {btn.text}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingCarousel;
