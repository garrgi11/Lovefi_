import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import AnimatedPageWrapper from "./AnimatedPageWrapper";

interface GenderSelectionProps {
  onContinue?: () => void;
  onBack?: () => void;
}

type GenderOption = "woman" | "man" | "non-binary" | "other";

export default function GenderSelection({
  onContinue,
  onBack,
}: GenderSelectionProps) {
  const { userData, updateUserData } = useUser();
  const [selectedGender, setSelectedGender] = useState<GenderOption | null>(
    userData.gender || null,
  );

  const handleGenderSelect = (gender: GenderOption) => {
    setSelectedGender(gender);
    updateUserData({ gender });
  };

  const handleContinue = () => {
    if (selectedGender && onContinue) {
      onContinue();
    }
  };

  const getDisplayName = () => {
    if (userData.firstName) {
      return userData.firstName;
    }
    return "[Name]";
  };

  return (
    <AnimatedPageWrapper direction="left">
      <div className="h-screen bg-white px-5 py-5 relative overflow-hidden">
        <div className="w-full max-w-[375px] mx-auto h-full flex flex-col">
          {/* Back Button */}
          <div className="flex-shrink-0 pt-4">
            <Link
              to="/user-info"
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
              Great! Nice to meet you, {getDisplayName()}. Who are{" "}
              <span className="text-lovefi-text-secondary">you?</span>
            </h1>
          </div>

          {/* Gender Options */}
          <div className="flex-grow space-y-4">
            {/* Woman Option */}
            <button
              onClick={() => handleGenderSelect("woman")}
              className={`w-full h-[58px] rounded-2xl flex items-center justify-between px-5 transition-all ${
                selectedGender === "woman"
                  ? "bg-lovefi-purple text-white"
                  : "bg-white border border-lovefi-border text-black hover:bg-gray-50"
              }`}
            >
              <span className="text-base font-alata font-normal">Woman</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.16667 10L8.33333 14.1667L16.6667 5.83334"
                  stroke={selectedGender === "woman" ? "white" : "#ADAFBB"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Man Option */}
            <button
              onClick={() => handleGenderSelect("man")}
              className={`w-full h-[58px] rounded-2xl flex items-center justify-between px-5 transition-all ${
                selectedGender === "man"
                  ? "bg-lovefi-purple text-white"
                  : "bg-white border border-lovefi-border text-black hover:bg-gray-50"
              }`}
            >
              <span className="text-base font-alata font-normal">Man</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.16667 10L8.33333 14.1667L16.6667 5.83334"
                  stroke={selectedGender === "man" ? "white" : "#ADAFBB"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Non-binary Option */}
            <button
              onClick={() => handleGenderSelect("non-binary")}
              className={`w-full h-[58px] rounded-2xl flex items-center justify-between px-5 transition-all ${
                selectedGender === "non-binary"
                  ? "bg-lovefi-purple text-white"
                  : "bg-white border border-lovefi-border text-black hover:bg-gray-50"
              }`}
            >
              <span className="text-base font-alata font-normal">
                Non-binary
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.16667 10L8.33333 14.1667L16.6667 5.83334"
                  stroke={selectedGender === "non-binary" ? "white" : "#ADAFBB"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Continue Button */}
          <div className="flex-shrink-0 pb-8">
            <button
              onClick={handleContinue}
              disabled={!selectedGender}
              className="w-full h-14 rounded-2xl text-white font-alata font-normal text-base transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background: "linear-gradient(90deg, #8F7CFF 0%, #BE62FF 100%)",
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
