"use client";

import React, { useState, useEffect, useCallback } from "react";

interface ImageItem {
  src: string;
  alt: string;
}

const CAROUSEL_IMAGES: ImageItem[] = [
  {
    src: "/rs272026__dsc6280-690284132d76e.jpg",
    alt: "Campus UCR - Edificio Histórico y Jardines"
  },
  {
    src: "/Facultad_Derecho_UCR.jpg",
    alt: "Facultad de Derecho - Universidad de Costa Rica"
  },
  {
    src: "/universidad-de-costa-rica-ucr_328332518_760x520.webp",
    alt: "Universidad de Costa Rica - Vista Estudiantil"
  }
];

export function WelcomeCarousel({ className }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % CAROUSEL_IMAGES.length);
  }, []);

  // Auto-slide effect (slides every 6 seconds for a slower, calmer background transition)
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(timer);
  }, [handleNext]);

  return (
    <div className={className || "fixed inset-0 w-screen h-screen -z-10 bg-slate-950 overflow-hidden select-none pointer-events-none"}>
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {CAROUSEL_IMAGES.map((img, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={img.src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                  isActive ? "scale-105" : "scale-100"
                }`}
              />
              {/* Overlay: semi-transparent dark mask + slight blur on background to make the cards on top pop */}
              <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
