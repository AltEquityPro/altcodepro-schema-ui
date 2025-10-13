"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ElementResolver } from "../../schema/ElementResolver";
import { CarouselElement, UIElement, ActionRuntime, AnyObj, EventHandler } from "../../types";
import { Progress } from "./progress";
import { ChevronDown } from "lucide-react";

interface CarouselProps {
  element: CarouselElement;
  runEventHandler?: (handler?: EventHandler | undefined, dataOverride?: AnyObj | undefined) => Promise<void>;
  state: AnyObj;
  t: (key: string) => string
}

export function Carousel({ element, runEventHandler }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!element.autoPlay || element.items.length <= 1) return;

    const intervalTime = element.interval || 3000;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % element.items.length;
        setProgress(0); // Reset progress on slide change
        return next;
      });
    }, intervalTime);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [element.autoPlay, element.interval, element.items.length]);

  // Progress animation
  useEffect(() => {
    if (!element.showProgress || !element.autoPlay) return;

    const intervalTime = element.interval || 3000;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (intervalTime / 100));
        return newProgress >= 100 ? 0 : newProgress;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [element.showProgress, element.autoPlay, element.interval]);

  // Navigation handlers
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + element.items.length) % element.items.length);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % element.items.length);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Animation and style classes
  const carouselClasses = clsx(
    "relative w-full overflow-hidden",
    element.styles?.className,
    element.orientation === "vertical" ? "h-full" : ""
  );

  const slideClasses = clsx(
    "flex transition-all duration-700 ease-in-out",
    element.orientation === "vertical" ? "flex-col" : "flex-row"
  );

  const itemClasses = clsx(
    "flex-shrink-0",
    element.orientation === "vertical" ? "w-full" : "w-full"
  );

  return (
    <div className={carouselClasses}>
      <div
        className={slideClasses}
        style={{
          transform:
            element.orientation === "vertical"
              ? `translateY(-${currentIndex * 100}%)`
              : `translateX(-${currentIndex * 100}%)`,
          height: element.orientation === "vertical" ? "auto" : undefined,
        }}
      >
        {element.items?.map((item, index) => (
          <div
            key={item.id}
            className={clsx(itemClasses, "flex justify-center items-center")}
            style={{ width: "100%" }}
          >
            {item.type === "image" ? (
              <img
                src={item.src}
                className="max-h-[80vh] w-auto object-contain rounded-lg"
              />
            ) : (
              <ElementResolver element={item} runEventHandler={runEventHandler} />
            )}
          </div>
        ))}
      </div>


      {/* Controls */}
      {element.showControls && (
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <button
            onClick={goToPrev}
            className="bg-background text-foreground/80 text-foreground hover:bg-primary/20 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Previous"
          >
            <ChevronDown className="h-6 w-6 rotate-90" />
          </button>
          <button
            onClick={goToNext}
            className="bg-background text-foreground/80 text-foreground hover:bg-primary/20 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Next"
          >
            <ChevronDown className="h-6 w-6 -rotate-90" />
          </button>
        </div>
      )}

      {/* Indicators */}
      {element.showIndicators && element.items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {element.items?.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={clsx(
                "w-3 h-3 rounded-full transition-all duration-300",
                currentIndex === index ? "bg-primary" : "bg-foreground/20 hover:bg-foreground/40"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {element.showProgress && element.autoPlay && (
        <div className="absolute bottom-4 w-full px-4">
          <Progress value={progress} className="h-1 bg-foreground/20" />
        </div>
      )}
    </div>
  );
}