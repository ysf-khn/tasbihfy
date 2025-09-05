"use client";

import { useState, useEffect } from 'react';
import { MapPinIcon, XMarkIcon, CheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import LocationSelector from './LocationSelector';

interface LocationDisplayProps {
  currentLocation: string;
  onLocationChange: (location: string) => void;
  loading: boolean;
}

export default function LocationDisplay({ currentLocation, onLocationChange, loading }: LocationDisplayProps) {
  const [isEditing, setIsEditing] = useState(false); // Don't start in edit mode initially
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showFallbackMessage, setShowFallbackMessage] = useState(false);

  // Handle initial load - only show edit mode if we're not loading and have no location
  useEffect(() => {
    if (!loading && !hasInitialized) {
      setHasInitialized(true);
      if (!currentLocation) {
        setIsEditing(true);
      }
    }
  }, [loading, currentLocation, hasInitialized]);

  // Auto-fallback timer: show location selector after 10 seconds of loading
  useEffect(() => {
    let fallbackTimer: NodeJS.Timeout;
    
    if (loading && !currentLocation && hasInitialized) {
      fallbackTimer = setTimeout(() => {
        setShowFallbackMessage(true);
        setIsEditing(true);
      }, 10000); // 10 seconds
    }

    return () => {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
    };
  }, [loading, currentLocation, hasInitialized]);

  const handleLocationChange = (newLocation: string) => {
    onLocationChange(newLocation);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-lg p-4 mb-6">
        {showFallbackMessage && (
          <div className="alert alert-warning mb-4">
            <InformationCircleIcon className="h-5 w-5" />
            <div className="text-sm">
              <div className="font-medium">Location detection is taking longer than expected</div>
              <div>Please manually select your location below or check that location services are enabled.</div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-base-content">
            {currentLocation ? 'Change Location' : 'Select Location'}
          </h3>
          {currentLocation && (
            <button
              onClick={handleCancelEdit}
              className="btn btn-ghost btn-sm btn-circle"
              disabled={loading}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <LocationSelector
          currentLocation={currentLocation}
          onLocationChange={handleLocationChange}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center bg-base-100 border border-base-300 rounded-lg px-4 py-2 shadow-sm">
        <MapPinIcon className="h-4 w-4 text-primary mr-2" />
        <span className="text-sm font-medium text-base-content mr-3">
          {currentLocation ? currentLocation.charAt(0).toUpperCase() + currentLocation.slice(1) : 'No location set'}
        </span>
        {loading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <button
            onClick={handleEditClick}
            className="btn btn-xs btn-outline"
            disabled={loading}
          >
            Change
          </button>
        )}
      </div>
    </div>
  );
}