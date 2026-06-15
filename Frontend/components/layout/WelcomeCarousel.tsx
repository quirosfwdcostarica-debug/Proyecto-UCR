"use client";

import React, { useState, useEffect, useCallback } from "react";

interface ImageItem {
  src: string;
  alt: string;
}

export const CAROUSEL_IMAGES: ImageItem[] = [
  {
    src: "/carousel-1.jpg",
    alt: "Graduados universitarios de la UCR celebrando"
  },
  {
    src: "/carousel-2.jpg",
    alt: "Facultad de Derecho - Universidad de Costa Rica"
  },
  {
    src: "/carousel-3.jpg",
    alt: "Estudiantes y campus de la Universidad de Costa Rica"
  }
];

export function WelcomeCarousel({ className, currentIndex: propCurrentIndex }: { className?: string; currentIndex?: number }) {
  const [internalIndex, setInternalIndex] = useState(0);

  const isControlled = typeof propCurrentIndex === "number";
  const currentIndex = isControlled ? propCurrentIndex! : internalIndex;

  useEffect(() => {
    if (isControlled) return;
    const timer = setInterval(() => {
      setInternalIndex((prevIndex) => (prevIndex + 1) % CAROUSEL_IMAGES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isControlled]);

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
                className={`w-full h-full object-cover transition-transform [transition-duration:6000ms] ease-out ${
                  isActive ? "scale-105" : "scale-100"
                }`}
              />
              {/* Overlay: semi-transparent dark mask + slight blur on background to make the cards on top pop */}
              <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
