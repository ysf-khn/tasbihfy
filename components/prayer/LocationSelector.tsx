"use client";

import { useState } from 'react';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { reverseGeocode, GeocodeResult } from '@/lib/geocoding';

interface LocationSelectorProps {
  currentLocation: string;
  onLocationChange: (location: string) => void;
  loading: boolean;
}


export default function LocationSelector({ currentLocation, onLocationChange, loading }: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onLocationChange(searchQuery.trim());
      setSearchQuery('');
    }
  };


  const getCurrentLocation = async () => {
    setIsSearching(true);
    
    if (!navigator.geolocation) {
      setIsSearching(false);
      alert('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get city name
          const geocodeResult = await reverseGeocode(latitude, longitude);
          
          // Use the city name instead of coordinates
          onLocationChange(geocodeResult.city);
          setIsSearching(false);
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          
          // Fallback to coordinates if reverse geocoding fails
          const { latitude, longitude } = position.coords;
          const locationQuery = `${latitude},${longitude}`;
          onLocationChange(locationQuery);
          setIsSearching(false);
          
          alert('Could not determine city name, using coordinates instead');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsSearching(false);
        
        let errorMessage = 'Failed to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Unknown error occurred.';
            break;
        }
        alert(errorMessage);
      }
    );
  };

  return (
    <div className="space-y-4">
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-base-content/40" />
            </div>
            <input
              type="text"
              placeholder="Search for your city..."
              className="input input-bordered w-full pl-10 h-10 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-full h-10 text-sm"
            disabled={loading || !searchQuery.trim()}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Searching...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Search Location
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 h-px bg-base-300"></div>
          <span className="text-sm font-medium text-base-content/60">OR</span>
          <div className="flex-1 h-px bg-base-300"></div>
        </div>

        {/* Current Location Button */}
        <button
          onClick={getCurrentLocation}
          className="btn btn-outline w-full h-10 text-sm border-2 hover:border-primary hover:bg-primary/5"
          disabled={loading || isSearching}
        >
          <MapPinIcon className="h-5 w-5 mr-2" />
          {isSearching ? (
            <>
              <span className="loading loading-spinner loading-sm mr-2"></span>
              Detecting Location...
            </>
          ) : (
            'Use Current Location'
          )}
        </button>

    </div>
  );
}