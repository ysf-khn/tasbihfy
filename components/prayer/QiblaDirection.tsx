"use client";

import { useState, useEffect } from "react";

interface QiblaDirectionProps {
  direction: string;
}

export default function QiblaDirection({ direction }: QiblaDirectionProps) {
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [permissionState, setPermissionState] = useState<
    "unknown" | "granted" | "denied"
  >("unknown");

  useEffect(() => {
    // Platform detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    // Check if device orientation is supported
    if ("DeviceOrientationEvent" in window) {
      const requestPermission = () => {
        if (isIOS && "requestPermission" in DeviceOrientationEvent) {
          // iOS 13+ requires permission
          (DeviceOrientationEvent as any)
            .requestPermission()
            .then((response: string) => {
              if (response === "granted") {
                setPermissionState("granted");
                startCompass();
              } else {
                setPermissionState("denied");
              }
            })
            .catch(() => {
              setPermissionState("denied");
            });
        } else {
          // Android and older iOS
          setPermissionState("granted");
          startCompass();
        }
      };

      const startCompass = () => {
        let cleanupFunctions: (() => void)[] = [];
        let hasCompassData = false;

        // iOS: Use deviceorientation with webkitCompassHeading
        if (isIOS) {
          const handleIOSOrientation = (event: DeviceOrientationEvent) => {
            const webkitHeading = (event as any).webkitCompassHeading;
            if (webkitHeading !== undefined && webkitHeading !== null) {
              setCompassHeading(webkitHeading);
              hasCompassData = true;
            }
          };

          window.addEventListener("deviceorientation", handleIOSOrientation);
          cleanupFunctions.push(() => {
            window.removeEventListener("deviceorientation", handleIOSOrientation);
          });
        } else {
          // Android: Try deviceorientationabsolute first
          const handleAbsoluteOrientation = (event: DeviceOrientationEvent) => {
            if (event.alpha !== null && (event as any).absolute && !hasCompassData) {
              // For Android with absolute orientation
              setCompassHeading(Math.abs(event.alpha - 360));
              hasCompassData = true;
            }
          };

          const handleFallbackOrientation = (event: DeviceOrientationEvent) => {
            if (event.alpha !== null && !hasCompassData) {
              // Fallback for devices without absolute orientation
              setCompassHeading(360 - event.alpha);
              hasCompassData = true;
            }
          };

          window.addEventListener("deviceorientationabsolute", handleAbsoluteOrientation as EventListener);
          window.addEventListener("deviceorientation", handleFallbackOrientation);

          cleanupFunctions.push(() => {
            window.removeEventListener("deviceorientationabsolute", handleAbsoluteOrientation as EventListener);
            window.removeEventListener("deviceorientation", handleFallbackOrientation);
          });
        }

        return () => {
          cleanupFunctions.forEach(cleanup => cleanup());
        };
      };

      // Auto-start for supported devices
      if (
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost"
      ) {
        requestPermission();
      }
    }
  }, []);

  const qiblaAngle = parseFloat(direction) || 0;
  const relativeQiblaDirection =
    compassHeading !== null ? qiblaAngle - compassHeading : qiblaAngle;

  const getDirectionText = (angle: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(angle / 45) % 8;
    return directions[index];
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body text-center p-6">
        <div className="flex items-center justify-center mb-6">
          <h3 className="text-lg font-semibold text-base-content">
            Qibla Compass
          </h3>
          {compassHeading !== null && (
            <div className="ml-2 w-2 h-2 bg-success rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Compass Container */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto mb-6">
          {/* Compass Base */}
          <div 
            className="w-full h-full rounded-full border-4 border-base-300 relative bg-base-300 shadow-xl transition-transform duration-300 ease-out"
            style={{
              transform: `rotate(${compassHeading !== null ? -compassHeading : 0}deg)`
            }}
          >
            {/* Major Degree Markers (every 30 degrees) */}
            {Array.from({ length: 12 }, (_, i) => i * 30).map((degree) => (
              <div
                key={`major-${degree}`}
                className="absolute w-0.5 h-5 bg-base-content top-0 left-1/2 transform -translate-x-1/2"
                style={{
                  transform: `translateX(-50%) rotate(${degree}deg)`,
                  transformOrigin: "center 112px"
                }}
              />
            ))}
            
            {/* Minor Degree Markers (every 15 degrees, excluding majors) */}
            {Array.from({ length: 24 }, (_, i) => i * 15).filter(degree => degree % 30 !== 0).map((degree) => (
              <div
                key={`minor-${degree}`}
                className="absolute w-0.5 h-3 bg-base-content/70 top-0 left-1/2 transform -translate-x-1/2"
                style={{
                  transform: `translateX(-50%) rotate(${degree}deg)`,
                  transformOrigin: "center 112px"
                }}
              />
            ))}

            {/* Compass Rose Background */}
            <div className="absolute inset-4 rounded-full border-2 border-base-content/30 bg-base-200 shadow-inner">
              {/* Subtle compass grid lines */}
              <div className="absolute inset-0 rounded-full border border-base-content/20"></div>
              <div className="absolute inset-2 rounded-full border border-base-content/15"></div>
              
              {/* Cardinal Direction Markers */}
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-error bg-base-100 px-2 py-1 rounded-md border border-error text-sm font-bold shadow-md backdrop-blur-sm">N</div>
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-primary bg-base-100 px-2 py-1 rounded-md border border-primary text-sm font-bold shadow-md backdrop-blur-sm">E</div>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-base-content bg-base-100 px-2 py-1 rounded-md border border-base-content text-sm font-bold shadow-md backdrop-blur-sm">S</div>
              <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-warning bg-base-100 px-2 py-1 rounded-md border border-warning text-sm font-bold shadow-md backdrop-blur-sm">W</div>
            </div>

            {/* Elegant Qibla Pointer */}
            <div
              className={`absolute top-1/2 left-1/2 z-20 transition-all duration-500 ease-out ${
                compassHeading !== null && Math.abs(relativeQiblaDirection) < 5
                  ? "drop-shadow-lg"
                  : ""
              }`}
              style={{
                transform: `translate(-50%, -50%) rotate(${qiblaAngle}deg)`,
                transformOrigin: "center center",
              }}
            >
              {/* Elegant SVG Pointer */}
              <svg
                width="16"
                height="80"
                viewBox="0 0 16 80"
                className={`${
                  compassHeading !== null && Math.abs(relativeQiblaDirection) < 5
                    ? "animate-pulse filter drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                    : ""
                }`}
              >
                <defs>
                  <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--su))" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="hsl(var(--su))" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="hsl(var(--su))" stopOpacity="0.85" />
                  </linearGradient>
                  <filter id="pointerShadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
                  </filter>
                </defs>
                
                {/* Main Pointer Body */}
                <path
                  d="M8 4 L12 16 L10 16 L10 64 L6 64 L6 16 L4 16 Z"
                  fill="url(#pointerGradient)"
                  stroke="hsl(var(--su))"
                  strokeWidth="0.5"
                  filter="url(#pointerShadow)"
                />
                
                {/* Pointer Tip with Star */}
                <path
                  d="M8 0 L10 3 L8 6 L6 3 Z"
                  fill="hsl(var(--su))"
                  stroke="hsl(var(--su))"
                  strokeWidth="0.5"
                />
                
                {/* Small Islamic Star/Rub el Hizb at tip */}
                <circle cx="8" cy="2" r="1" fill="hsl(var(--b1))" opacity="0.9"/>
              </svg>
            </div>

            {/* Elegant Center Hub */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-base-content rounded-full transform -translate-x-1/2 -translate-y-1/2 z-30 border-2 border-base-300 shadow-lg">
              <div className="absolute inset-0.5 bg-base-100 rounded-full shadow-inner"></div>
            </div>
          </div>
        </div>

        {/* Direction Info */}
        <div className="flex justify-center items-center space-x-4 sm:space-x-6 mb-4">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-success">
              {qiblaAngle.toFixed(0)}°
            </div>
            <div className="text-xs sm:text-sm text-base-content/60">
              {getDirectionText(qiblaAngle)}
            </div>
          </div>
          {compassHeading !== null && (
            <div className="w-px h-8 bg-base-300"></div>
          )}
          {compassHeading !== null && (
            <div className="text-center">
              <div className="text-base sm:text-lg font-semibold text-base-content">
                {Math.abs(relativeQiblaDirection).toFixed(0)}°
              </div>
              <div className="text-xs text-base-content/60">offset</div>
            </div>
          )}
        </div>

        {/* Compass Status */}
        <div className="flex justify-center">
          {permissionState === "denied" && (
            <button
              onClick={() => window.location.reload()}
              className="btn btn-warning btn-sm"
            >
              🧭 Enable Compass
            </button>
          )}

          {compassHeading === null && permissionState === "granted" && (
            <div className="text-center">
              <div className="loading loading-spinner loading-sm text-primary mb-2"></div>
              <div className="text-sm text-base-content/60">
                Calibrating compass...
              </div>
            </div>
          )}

          {compassHeading !== null && Math.abs(relativeQiblaDirection) < 5 && (
            <div className="flex items-center space-x-2 text-success">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <div className="text-sm font-medium">Aligned with Qibla</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
