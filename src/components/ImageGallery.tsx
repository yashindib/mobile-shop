"use client";

// BUG #1: Memory leak — setInterval runs a slideshow but is never cleared on unmount.
import { useState, useEffect } from "react";

interface Props {
  images: string[];
  productName: string;
}

export default function ImageGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  console.log("[ImageGallery] render, activeIndex:", activeIndex);

  useEffect(() => {
    if (images.length <= 1) return;

    console.log("[ImageGallery] starting slideshow interval");
    // BUG #1: interval is created but never cleared — memory leak on unmount
    setInterval(() => {
      console.log("[ImageGallery] auto-advancing slide");
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    // missing: return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square">
        <img
          src={images[activeIndex]}
          alt={`${productName} - image ${activeIndex + 1}`}
          className="w-full h-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
            >
              →
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeIndex ? "border-indigo-500" : "border-transparent"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
