'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Globe, Navigation, ChevronDown, X } from 'lucide-react';
import { LOCATION_DATA, searchCountries, getCountryByName } from '@/lib/location-data';

interface LocationSelectorProps {
  onLocationSelect: (location: string, coordinates: { lat: number; lng: number }) => void;
  onClose: () => void;
}

export default function LocationSelector({ onLocationSelect, onClose }: LocationSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const results = searchCountries(searchQuery);
      setSearchResults(results.slice(0, 10)); // Limit to 10 results
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Handle location selection from search results
  const handleSearchResultSelect = (country: any) => {
    onLocationSelect(country.name, country.coords);
  };

  // Handle structured selection
  const handleStructuredSelect = () => {
    if (!selectedCountry) return;

    const country = getCountryByName(selectedCountry);
    if (!country) return;

    onLocationSelect(country.name, country.coords);
  };

  // Handle GPS location
  const handleGPSLocation = async () => {
    setGpsLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Use reverse geocoding to get location name
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await response.json();
        const locationName = data.countryName || data.locality || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        
        onLocationSelect(locationName, { lat: latitude, lng: longitude });
      } catch {
        // Fallback to coordinates if reverse geocoding fails
        onLocationSelect(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, { lat: latitude, lng: longitude });
      }
    } catch (error) {
      console.error('GPS location error:', error);
      alert('Unable to get your location. Please select manually or check your location permissions.');
    } finally {
      setGpsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="neural-panel max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600/30">
          <h2 className="text-xl font-bold text-cyan-300 font-mono flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-neural-pulse" />
            Select Location
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors group"
          >
            <X className="w-5 h-5 text-red-400 group-hover:text-red-300" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* GPS Option */}
          <div className="space-y-3">
            <div className="text-cyan-400 font-mono text-xs mb-2">[GPS LOCATION DETECTION]</div>
            <button
              onClick={handleGPSLocation}
              disabled={gpsLoading}
              className="w-full neural-panel p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-400/30 text-green-300 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-400/20 transition-all duration-300 flex items-center justify-center gap-3 font-mono disabled:opacity-50"
            >
              {gpsLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                  <span>Detecting location...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5" />
                  <span>Use my current location (GPS)</span>
                </>
              )}
            </button>
          </div>

          {/* Search Option */}
          <div className="space-y-3">
            <div className="text-cyan-400 font-mono text-xs mb-2">[MANUAL LOCATION SEARCH]</div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for a country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full neural-panel pl-10 pr-4 py-3 bg-slate-800/50 border-slate-400/30 text-slate-300 placeholder-slate-500 font-mono focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            {/* Search Results - Positioned to drop up on mobile */}
            {searchResults.length > 0 && (
              <div className="relative">
                <div className="absolute bottom-full left-0 right-0 mb-2 sm:relative sm:bottom-auto sm:mb-0 sm:mt-2 neural-panel bg-slate-800/90 border-slate-400/30 rounded-lg max-h-48 overflow-y-auto shadow-lg z-10">
                  {searchResults.map((country, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchResultSelect(country)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-700/50 border-b border-slate-600/30 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-slate-200 font-mono">{country.name}</div>
                      <div className="text-sm text-slate-400 font-mono">{country.code}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Structured Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium font-mono">[COUNTRY SELECTION]</span>
            </div>

            {/* Country Selection with Mobile-Friendly Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-2 font-mono">Country</label>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full neural-panel flex items-center justify-between px-3 py-3 bg-slate-800/50 border-slate-400/30 text-slate-300 font-mono focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                >
                  <span className={selectedCountry ? 'text-slate-200' : 'text-slate-500'}>
                    {selectedCountry || 'Select a country'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Mobile-optimized dropdown that appears upward */}
                {showDropdown && (
                  <div className="absolute z-50 w-full bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 sm:mb-0 neural-panel bg-slate-800/90 border-slate-400/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {LOCATION_DATA.countries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => {
                          setSelectedCountry(country.name);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-700/50 border-b border-slate-600/30 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-slate-200 font-mono">{country.name}</div>
                        <div className="text-sm text-slate-400 font-mono">{country.code}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Confirm Selection Button */}
            {selectedCountry && (
              <button
                onClick={handleStructuredSelect}
                className="w-full neural-panel p-3 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-400/30 text-green-300 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-400/20 transition-all duration-300 font-mono mt-4"
              >
                Confirm Selection
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}