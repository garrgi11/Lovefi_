import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import AnimatedPageWrapper from "./AnimatedPageWrapper";

interface SexualitySelectionProps {
  onContinue?: () => void;
  onBack?: () => void;
}

const sexualityOptions = [
  { id: "straight", label: "Straight", icon: "💕" },
  { id: "gay", label: "Gay", icon: "🌈" },
  { id: "lesbian", label: "Lesbian", icon: "💜" },
  { id: "other", label: "Other", icon: "✨" },
];

export default function SexualitySelection({
  onContinue,
  onBack,
}: SexualitySelectionProps) {
  const { userData, updateUserData } = useUser();
  const location = useLocation();

  const [selectedSexuality, setSelectedSexuality] = useState(
    userData.sexuality || "",
  );
  const [customSexuality, setCustomSexuality] = useState(
    userData.customSexuality || "",
  );
  const [showCustomInput, setShowCustomInput] = useState(
    userData.sexuality === "other",
  );

  // Determine back route based on referrer or default flow
  const isFromProfile = location.state?.from === "profile";
  const backRoute = isFromProfile ? "/profile" : "/location-selection";

  const handleSexualitySelect = (sexuality: string) => {
    setSelectedSexuality(sexuality);
    if (sexuality === "other") {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      setCustomSexuality("");
    }
  };

  const handleContinue = () => {
    // Save sexuality data to context
    updateUserData({
      sexuality: selectedSexuality,
      customSexuality: selectedSexuality === "other" ? customSexuality : "",
    });

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

  const canContinue =
    selectedSexuality &&
    (selectedSexuality !== "other" ||
      (selectedSexuality === "other" && customSexuality.trim()));

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
              Perfect, {getDisplayName()}! What's your{" "}
              <span className="text-lovefi-text-secondary">
                sexual orientation?
              </span>
            </h1>
          </div>

          {/* Sexuality Options */}
          <div className="flex-grow space-y-4">
            {sexualityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSexualitySelect(option.id)}
                className={`w-full h-[64px] rounded-2xl border-2 transition-all duration-200 flex items-center px-6 gap-4 ${
                  selectedSexuality === option.id
                    ? "border-lovefi-purple bg-lovefi-purple bg-opacity-10"
                    : "border-lovefi-border bg-white hover:border-lovefi-purple hover:bg-lovefi-purple hover:bg-opacity-5"
                }`}
              >
                <span className="text-2xl">{option.icon}</span>
                <span className="text-base font-alata font-normal text-black">
                  {option.label}
                </span>
                {selectedSexuality === option.id && (
                  <div className="ml-auto">
                    <div className="w-6 h-6 rounded-full bg-lovefi-purple flex items-center justify-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.3536 4.35355C13.5488 4.15829 13.5488 3.84171 13.3536 3.64645C13.1583 3.45118 12.8417 3.45118 12.6464 3.64645L6.5 9.79289L3.35355 6.64645C3.15829 6.45118 2.84171 6.45118 2.64645 6.64645C2.45118 6.84171 2.45118 7.15829 2.64645 7.35355L6.14645 10.8536C6.34171 11.0488 6.65829 11.0488 6.85355 10.8536L13.3536 4.35355Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}

            {/* Custom Input for "Other" */}
            {showCustomInput && (
              <div className="mt-6">
                <div className="relative">
                  <input
                    type="text"
                    value={customSexuality}
                    onChange={(e) => setCustomSexuality(e.target.value)}
                    placeholder="Please specify your orientation"
                    className="w-full h-[58px] border border-lovefi-border rounded-2xl bg-white px-4 text-base font-alata font-normal text-black focus:outline-none focus:ring-2 focus:ring-lovefi-purple focus:border-transparent"
                    maxLength={50}
                  />
                  {/* Floating Label */}
                  <div className="absolute -top-[9px] left-5 bg-white px-2">
                    <span className="text-xs font-alata font-normal text-black text-opacity-40">
                      Your orientation
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Continue Button */}
          <div className="flex-shrink-0 pb-8 pt-8">
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className={`w-full h-14 rounded-2xl text-white font-alata font-normal text-base transition-all ${
                canContinue
                  ? "hover:opacity-90 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
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
