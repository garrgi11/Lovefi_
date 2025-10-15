import React, { useState } from "react";
import { Profile } from "../contexts/UserContext";

interface ProfileCardProps {
  profile: Profile;
  onRemove?: (profileId: string) => void;
  showRemoveButton?: boolean;
}

export default function ProfileCard({
  profile,
  onRemove,
  showRemoveButton = false,
}: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handlePhotoClick = () => {
    if (currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    } else {
      setCurrentPhotoIndex(0);
    }
  };

  return (
    <div className="relative w-full bg-white rounded-[15px] shadow-lg overflow-hidden">
      {/* Photo Section */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={profile.photos[currentPhotoIndex]}
          alt={`${profile.name}'s photo`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={handlePhotoClick}
        />

        {/* Photo pagination dots */}
        {profile.photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {profile.photos.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentPhotoIndex
                    ? "bg-white scale-110"
                    : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Remove button */}
        {showRemoveButton && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(profile.id);
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-gray-600"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.195 4.195a.75.75 0 011.06 0L8 6.94l2.745-2.745a.75.75 0 111.06 1.06L9.06 8l2.745 2.745a.75.75 0 11-1.06 1.06L8 9.06l-2.745 2.745a.75.75 0 01-1.06-1.06L6.94 8 4.195 5.255a.75.75 0 010-1.06z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="p-4">
        {/* Name, Age, and Stats */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <h3 className="text-lg font-[Alata] text-black mr-2">
              {profile.name}, {profile.age}
            </h3>
          </div>
          <div className="flex space-x-2">
            <div className="bg-gray-50 px-2 py-1 rounded-md">
              <span className="text-xs font-[Alata] text-gray-600">
                {profile.distance}km
              </span>
            </div>
            <div className="bg-lovefi-purple/10 px-2 py-1 rounded-md">
              <span className="text-xs font-[Alata] text-lovefi-purple">
                {profile.matchPercentage}% match
              </span>
            </div>
          </div>
        </div>

        {/* Crypto tagline */}
        <p className="text-sm font-[Alata] text-gray-700 mb-3">
          {profile.cryptoTagline}
        </p>

        {/* Common interests */}
        <div>
          <p className="text-xs font-[Alata] text-gray-600 mb-1">
            What's in common:
          </p>
          <p className="text-xs font-[Alata] text-black">
            [{profile.commonInterests.join(", ")}]
          </p>
        </div>
      </div>
    </div>
  );
}
