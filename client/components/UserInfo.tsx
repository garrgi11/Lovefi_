import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import AnimatedPageWrapper from "./AnimatedPageWrapper";

interface UserInfoProps {
  onContinue?: (userInfo: {
    firstName: string;
    lastName: string;
    birthday: string;
  }) => void;
  onBack?: () => void;
}

export default function UserInfo({ onContinue, onBack }: UserInfoProps) {
  const { userData, updateUserData } = useUser();
  const location = useLocation();
  const [firstName, setFirstName] = useState(userData.firstName || "Daniel");
  const [lastName, setLastName] = useState(userData.lastName || "Daniel");
  const [birthday, setBirthday] = useState(userData.birthday || "");
  const [zkProof, setZkProof] = useState(userData.zkProof || "");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Determine back route based on referrer or default flow
  const isFromProfile = location.state?.from === "profile";
  const backRoute = isFromProfile ? "/profile" : "/";

  // Update context when local state changes
  // Remove automatic context updates to prevent infinite loops
  // Data will be saved when user clicks Continue

  const handleContinue = () => {
    if (onContinue) {
      onContinue({ firstName, lastName, birthday, zkProof: zkProof.trim() });
    }
  };

  const handleDateSelect = (date: string) => {
    setBirthday(date);
    setShowDatePicker(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Choose birthday date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
                  fill="#9579FF"
                />
              </svg>
            </Link>
          </div>

          {/* Header Text */}
          <div className="pt-12 pb-8">
            <h1 className="text-lg font-alata font-normal leading-[150%] text-black">
              Nice! Next, what is your{" "}
              <span className="text-lovefi-text-secondary">
                name and birthday?
              </span>
            </h1>
          </div>

          {/* Form Fields */}
          <div className="flex-grow space-y-6">
            {/* First Name Input */}
            <div className="relative">
              <div className="relative">
                <input
                  id="first-name"
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-[58px] border border-lovefi-border rounded-2xl bg-white px-4 text-sm font-alata font-normal text-black focus:outline-none focus:ring-2 focus:ring-lovefi-purple focus:border-transparent"
                  placeholder="Enter your first name"
                  autoComplete="given-name"
                />
                {/* Floating Label */}
                <div className="absolute -top-[9px] left-5 bg-white px-2">
                  <span className="text-xs font-alata font-normal text-black text-opacity-40">
                    First name
                  </span>
                </div>
              </div>
            </div>

            {/* Last Name Input */}
            <div className="relative">
              <div className="relative">
                <input
                  id="last-name"
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-[58px] border border-lovefi-border rounded-2xl bg-white px-4 text-sm font-alata font-normal text-black focus:outline-none focus:ring-2 focus:ring-lovefi-purple focus:border-transparent"
                  placeholder="Enter your last name"
                  autoComplete="family-name"
                />
                {/* Floating Label */}
                <div className="absolute -top-[9px] left-5 bg-white px-2">
                  <span className="text-xs font-alata font-normal text-black text-opacity-40">
                    Last name
                  </span>
                </div>
              </div>
            </div>

            {/* Birthday Picker */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full h-[58px] rounded-2xl bg-lovefi-purple bg-opacity-10 flex items-center px-4 gap-3 transition-colors hover:bg-opacity-20"
              >
                {/* Calendar Icon */}
                <svg
                  width="20"
                  height="22"
                  viewBox="0 0 20 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                >
                  <path
                    d="M1.09265 8.40427H18.9166"
                    stroke="#937AFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.4421 12.3097H14.4513"
                    stroke="#937AFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.0046 12.3097H10.0139"
                    stroke="#937AFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.55787 12.3097H5.56713"
                    stroke="#937AFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.4421 16.1962H14.4513"
                    stroke="#937AFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.0046 16.1962H10.0139"
                    stroke="#937AFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.55787 16.1962H5.56713"
                    stroke="#937AFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.0437 1V4.29078"
                    stroke="#937AFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.96552 1V4.29078"
                    stroke="#937AFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.2383 2.57919H5.77096C2.83427 2.57919 1 4.21513 1 7.22222V16.2719C1 19.3262 2.83427 21 5.77096 21H14.229C17.175 21 19 19.3546 19 16.3475V7.22222C19.0092 4.21513 17.1842 2.57919 14.2383 2.57919Z"
                    stroke="#937AFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Date Text */}
                <span className="text-sm font-alata font-normal text-white">
                  {formatDate(birthday)}
                </span>
              </button>

              {/* Simple Date Picker Dropdown */}
              {showDatePicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-lovefi-border rounded-2xl p-4 shadow-lg z-10">
                  <input
                    id="birthday"
                    name="birthday"
                    type="date"
                    value={birthday}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg font-alata text-sm focus:outline-none focus:ring-2 focus:ring-lovefi-purple"
                    autoComplete="bday"
                  />
                </div>
              )}
            </div>

            {/* zkProof Input */}
            <div className="relative">
              <div className="relative">
                <input
                  id="zk-proof"
                  name="zkProof"
                  type="text"
                  value={zkProof}
                  onChange={(e) => setZkProof(e.target.value)}
                  className="w-full h-[58px] border border-lovefi-border rounded-2xl bg-white px-4 text-sm font-alata font-normal text-black focus:outline-none focus:ring-2 focus:ring-lovefi-purple focus:border-transparent"
                  placeholder="Enter your zkProof (optional)"
                />
                {/* Floating Label */}
                <div className="absolute -top-[9px] left-5 bg-white px-2">
                  <span className="text-xs font-alata font-normal text-black text-opacity-40">
                    zkProof (Optional)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex-shrink-0 pb-8">
            <button
              onClick={handleContinue}
              className="w-full h-14 rounded-2xl text-white font-alata font-normal text-base transition-all hover:opacity-90"
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
