import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import AnimatedPageWrapper from "./AnimatedPageWrapper";

interface LocationSelectionProps {
  onContinue?: () => void;
  onBack?: () => void;
}

interface LocationData {
  street?: string;
  city: string;
  country: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    street?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
    postcode?: string;
  };
}

export default function LocationSelection({
  onContinue,
  onBack,
}: LocationSelectionProps) {
  const { userData, updateUserData } = useUser();
  const locationState = useLocation();

  // Parse existing location data
  const parseLocationData = (location?: string): LocationData => {
    if (!location) return { street: "", city: "", country: "" };

    try {
      const parsed = JSON.parse(location);
      if (parsed.city && parsed.country) {
        return {
          street: parsed.street || "",
          city: parsed.city,
          country: parsed.country,
          fullAddress: parsed.fullAddress,
          latitude: parsed.latitude,
          longitude: parsed.longitude,
        };
      }
    } catch {
      // If it's not JSON, treat as legacy string format
      return { street: "", city: location, country: "" };
    }

    return { street: "", city: location, country: "" };
  };

  const [locationData, setLocationData] = useState<LocationData>(
    parseLocationData(userData.location),
  );
  const [radius, setRadius] = useState(userData.radius || 10);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Determine back route based on referrer or default flow
  const isFromProfile = locationState.state?.from === "profile";
  const backRoute = isFromProfile ? "/profile" : "/gender-selection";

  // Debounced search function
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (locationData.city.length > 2) {
        searchLocations(locationData.city);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [locationData.city]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    if (showSuggestions) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showSuggestions]);

  const searchLocations = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
      );
      const results: NominatimResult[] = await response.json();
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error("Geocoding search failed:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionSelect = (suggestion: NominatimResult) => {
    const city =
      suggestion.address.city ||
      suggestion.address.town ||
      suggestion.address.village ||
      "";
    const country = suggestion.address.country || "";

    // Build street address from API components
    let street = "";
    if (suggestion.address.house_number && suggestion.address.road) {
      street = `${suggestion.address.house_number} ${suggestion.address.road}`;
    } else if (suggestion.address.road) {
      street = suggestion.address.road;
    } else if (suggestion.address.street) {
      street = suggestion.address.street;
    } else {
      // Fallback: extract from display name
      const addressParts = suggestion.display_name.split(",");
      street = addressParts[0] || "";
    }

    setLocationData({
      street: street.trim(),
      city,
      country,
      fullAddress: suggestion.display_name,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    });

    setShowSuggestions(false);
  };

  const handleContinue = () => {
    // Save structured location data as JSON string for backward compatibility
    const locationString = JSON.stringify(locationData);
    updateUserData({ location: locationString, radius });
    if (onContinue) {
      onContinue();
    }
  };

  const getDisplayName = () => {
    if (userData.firstName) {
      return userData.firstName;
    }
    return "[Name]";
  };

  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationData((prev) => ({ ...prev, street: e.target.value }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationData((prev) => ({ ...prev, city: e.target.value }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationData((prev) => ({ ...prev, country: e.target.value }));
  };

  const canContinue = locationData.city.trim() && locationData.country.trim();

  return (
    <AnimatedPageWrapper direction="left">
      <div className="h-screen bg-white px-5 py-5 relative overflow-hidden">
        <div className="w-full max-w-[375px] mx-auto h-full flex flex-col">
          {/* Back Button */}
          <div className="flex-shrink-0 pt-4">
            <Link
              to={backRoute}
              onClick={onBack}
              className="inline-flex items-center justify-center w-[52px] h-[52px] rounded-2xl border border-lovefi-border bg-white hover:bg-gray-50 transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.2071 18.7071C14.8166 19.0976 14.1834 19.0976 13.7929 18.7071L7.79289 12.7071C7.40237 12.3166 7.40237 11.6834 7.79289 11.2929L13.7929 5.29289C14.1834 4.90237 14.8166 4.90237 15.2071 5.29289C15.5976 5.68342 15.5976 6.31658 15.2071 6.70711L9.91421 12L15.2071 17.2929C15.5976 17.6834 15.5976 18.3166 15.2071 18.7071Z"
                  fill="#9D74FF"
                />
              </svg>
            </Link>
          </div>

          {/* Header Text */}
          <div className="pt-12 pb-8">
            <h1 className="text-lg font-alata font-normal leading-[150%] text-black">
              Thanks for the information, {getDisplayName()}! Where are you{" "}
              <span className="text-lovefi-text-secondary">located?</span>
            </h1>
          </div>

          {/* Location Input Fields */}
          <div className="flex-grow">
            {/* Street Address Input */}
            <div className="relative mb-6">
              <div className="relative">
                <input
                  id="street"
                  name="street"
                  type="text"
                  value={locationData.street || ""}
                  onChange={handleStreetChange}
                  className="w-full h-[58px] border border-lovefi-border rounded-2xl bg-white px-4 text-base font-alata font-normal text-gray-600 focus:outline-none focus:ring-2 focus:ring-lovefi-purple focus:border-transparent"
                  placeholder="Enter your street address (optional)"
                  autoComplete="address-line1"
                />

                {/* Floating Label */}
                <div className="absolute -top-[9px] left-5 bg-white px-2">
                  <span className="text-xs font-alata font-normal text-black text-opacity-40">
                    Street Address (Optional)
                  </span>
                </div>
              </div>
            </div>

            {/* City Input */}
            <div className="relative mb-6">
              <div className="relative">
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={locationData.city}
                  onChange={handleCityChange}
                  onFocus={() => setShowSuggestions(suggestions.length > 0)}
                  className="w-full h-[58px] border border-lovefi-border rounded-2xl bg-white px-4 text-base font-alata font-normal text-gray-600 focus:outline-none focus:ring-2 focus:ring-lovefi-purple focus:border-transparent"
                  placeholder="Enter your city"
                  autoComplete="address-level2"
                />

                {/* Floating Label */}
                <div className="absolute -top-[9px] left-5 bg-white px-2">
                  <span className="text-xs font-alata font-normal text-black text-opacity-40">
                    City
                  </span>
                </div>

                {/* Search indicator */}
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lovefi-purple"></div>
                  </div>
                )}
              </div>

              {/* Location Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-lovefi-border rounded-2xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {suggestion.address.city ||
                          suggestion.address.town ||
                          suggestion.address.village}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.display_name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Country Input */}
            <div className="relative mb-6">
              <div className="relative">
                <input
                  id="country"
                  name="country"
                  type="text"
                  value={locationData.country}
                  onChange={handleCountryChange}
                  className="w-full h-[58px] border border-lovefi-border rounded-2xl bg-white px-4 text-base font-alata font-normal text-gray-600 focus:outline-none focus:ring-2 focus:ring-lovefi-purple focus:border-transparent"
                  placeholder="Enter your country"
                  autoComplete="country"
                />

                {/* Floating Label */}
                <div className="absolute -top-[9px] left-5 bg-white px-2">
                  <span className="text-xs font-alata font-normal text-black text-opacity-40">
                    Country
                  </span>
                </div>
              </div>
            </div>

            {/* Radius Slider Section */}
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-base font-alata font-normal text-black mb-2">
                  Search Radius: {radius} km
                </h3>
              </div>

              {/* Radius Slider */}
              <div className="relative">
                <input
                  id="search-radius"
                  name="searchRadius"
                  type="range"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #8F7CFF 0%, #8F7CFF ${(radius / 50) * 100}%, #E5E5E5 ${(radius / 50) * 100}%, #E5E5E5 100%)`,
                  }}
                />
                <style>{`
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #8f7cff;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  }
                  .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #8f7cff;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  }
                `}</style>
              </div>

              {/* Slider Labels */}
              <div className="flex justify-between mt-2 text-xs font-alata text-gray-500">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex-shrink-0 pb-8">
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full h-14 rounded-2xl text-white font-alata font-normal text-base transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: canContinue
                  ? "linear-gradient(90deg, #8F7CFF 0%, #AC6DFF 100%)"
                  : "#E5E5E5",
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </AnimatedPageWrapper>
  );
}
