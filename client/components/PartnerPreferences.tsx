import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import AnimatedPageWrapper from "./AnimatedPageWrapper";

interface PartnerPreferencesProps {
  onContinue?: () => void;
  onBack?: () => void;
}

type PreferenceCategory = {
  id: string;
  options: string[];
  selected: number;
};

export default function PartnerPreferences({
  onContinue,
  onBack,
}: PartnerPreferencesProps) {
  // Get user context
  const { userData, updateUserData } = useUser();
  const location = useLocation();

  // Determine back route based on referrer or default flow
  const isFromProfile = location.state?.from === "profile";
  const backRoute = isFromProfile ? "/profile" : "/location-selection";

  const [preferences, setPreferences] = useState<PreferenceCategory[]>([
    {
      id: "lifestyle",
      options: ["🏠 Homebody (NYC)", "🌍 Digital Nomad (Homeless)"],
      selected: 0,
    },
    {
      id: "blockchain",
      options: ["EVM Compatible L1 Maxi", "ETH L2"],
      selected: 0,
    },
    {
      id: "investment",
      options: ["💎 ETH (steady & loyal)", "🚀 Alts (fun & whimsical)"],
      selected: 0,
    },
    {
      id: "community",
      options: ["The Hodlers 🟧", "The Builders 🛠️", "The Vibers 🐸"],
      selected: 0,
    },
  ]);

  // Load saved preferences from context on component mount
  useEffect(() => {
    if (userData.partnerPreferences) {
      setPreferences(userData.partnerPreferences);
    }
  }, []); // Only run on mount to avoid infinite loop

  const handleOptionSelect = (categoryIndex: number, optionIndex: number) => {
    setPreferences((prev) =>
      prev.map((category, idx) =>
        idx === categoryIndex
          ? { ...category, selected: optionIndex }
          : category,
      ),
    );
  };

  const handleContinue = () => {
    // Save preferences to context when continuing
    updateUserData({ partnerPreferences: preferences });
    if (onContinue) {
      onContinue();
    }
  };

  const renderToggleButton = (
    category: PreferenceCategory,
    categoryIndex: number,
  ) => {
    const isThreeOptions = category.options.length === 3;

    if (isThreeOptions) {
      // Special layout for 3 options (The Hodlers, Builders, Vibers)
      return (
        <div className="relative w-full h-[58px] bg-white border border-lovefi-border rounded-2xl overflow-hidden">
          {/* Background highlight for selected option */}
          <div
            className="absolute h-full bg-lovefi-purple transition-all duration-300 ease-in-out"
            style={{
              width: "33.33%",
              left: `${category.selected * 33.33}%`,
              borderRadius:
                category.selected === 0
                  ? "15px 0 0 15px"
                  : category.selected === 2
                    ? "0 15px 15px 0"
                    : "0",
            }}
          />

          {/* Options */}
          {category.options.map((option, optionIndex) => (
            <button
              key={optionIndex}
              onClick={() => handleOptionSelect(categoryIndex, optionIndex)}
              className={`absolute h-full flex items-center justify-center text-sm font-alata font-normal transition-colors z-10 ${
                category.selected === optionIndex ? "text-white" : "text-black"
              }`}
              style={{
                width: "33.33%",
                left: `${optionIndex * 33.33}%`,
              }}
            >
              {option}
            </button>
          ))}

          {/* Dividers */}
          <div className="absolute top-1/2 transform -translate-y-1/2 w-px h-6 bg-lovefi-border left-1/3 z-20" />
          <div className="absolute top-1/2 transform -translate-y-1/2 w-px h-6 bg-lovefi-border left-2/3 z-20" />
        </div>
      );
    } else {
      // Layout for 2 options
      return (
        <div className="relative w-full h-[59px] bg-white border border-lovefi-border rounded-2xl overflow-hidden">
          {/* Background highlight for selected option */}
          <div
            className="absolute h-full bg-lovefi-purple transition-all duration-300 ease-in-out"
            style={{
              width: "50%",
              left: category.selected === 0 ? "0%" : "50%",
              borderRadius:
                category.selected === 0 ? "15px 0 0 15px" : "0 15px 15px 0",
            }}
          />

          {/* Options */}
          {category.options.map((option, optionIndex) => (
            <button
              key={optionIndex}
              onClick={() => handleOptionSelect(categoryIndex, optionIndex)}
              className={`absolute w-1/2 h-full flex items-center justify-center text-sm font-alata font-normal transition-colors z-10 px-2 ${
                category.selected === optionIndex ? "text-white" : "text-black"
              }`}
              style={{
                left: optionIndex === 0 ? "0%" : "50%",
              }}
            >
              <span className="text-center leading-tight">{option}</span>
            </button>
          ))}
        </div>
      );
    }
  };

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
              To find your{" "}
              <span className="text-lovefi-text-secondary">true love</span>,
              lets start by describing who do you look for in a partner?
            </h1>
          </div>

          {/* Preferences Selection */}
          <div className="flex-grow space-y-6">
            {preferences.map((category, categoryIndex) => (
              <div key={category.id}>
                {renderToggleButton(category, categoryIndex)}
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <div className="flex-shrink-0 pb-8">
            <button
              onClick={handleContinue}
              className="w-full h-14 rounded-2xl text-white font-alata font-normal text-base transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(90deg, #937AFF 0%, #B666FF 100%)",
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
