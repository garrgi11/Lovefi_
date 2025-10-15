import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import AnimatedPageWrapper from "../components/AnimatedPageWrapper";

export default function RelationshipNFTPage() {
  const { userData, updateUserData } = useUser();
  const navigate = useNavigate();
  const [isMinting, setIsMinting] = useState(false);
  const [mintComplete, setMintComplete] = useState(false);
  const [mintProgress, setMintProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(true);
  const [confettiVisible, setConfettiVisible] = useState(false);

  const relationshipStatus = userData.relationshipStatus;
  const partnerProfile = userData.messages?.find(
    (profile) => profile.id === relationshipStatus?.partnerId,
  );

  useEffect(() => {
    // Redirect if no relationship or already minted
    if (!relationshipStatus?.isInRelationship) {
      navigate("/messages");
      return;
    }

    // Trigger celebration on page load
    setConfettiVisible(true);
    setTimeout(() => {
      setShowCelebration(false);
    }, 1000);

    // Hide confetti after celebration
    setTimeout(() => {
      setConfettiVisible(false);
    }, 4000);
  }, [relationshipStatus, navigate]);

  const handleMintNFT = async () => {
    setIsMinting(true);
    setMintProgress(0);

    // Simulate minting process with progress
    const progressInterval = setInterval(() => {
      setMintProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Simulate minting delay
    setTimeout(() => {
      setIsMinting(false);
      setMintComplete(true);

      // Trigger celebration confetti
      setConfettiVisible(true);
      setTimeout(() => setConfettiVisible(false), 4000);

      // Update user data with NFT status
      updateUserData({
        relationshipStatus: {
          ...relationshipStatus!,
          nftMinted: true,
          nftTokenId: `LOVE-${Date.now()}`,
          nftMintDate: new Date().toISOString(),
        },
      });
    }, 3000);
  };

  const handleExitForTesting = () => {
    // Emergency exit for testing - clears relationship status
    updateUserData({
      relationshipStatus: {
        isInRelationship: false,
      },
    });
    navigate("/matching");
  };

  if (!relationshipStatus?.isInRelationship || !partnerProfile) {
    return null;
  }

  return (
    <AnimatedPageWrapper>
      <div
        className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 relative max-w-sm mx-auto overflow-hidden"
        style={{
          transform: showCelebration ? "scale(0.8)" : "scale(1)",
          animation: showCelebration
            ? "celebrationScale 1s ease-out forwards"
            : "none",
        }}
      >
        {/* Confetti Animation */}
        {confettiVisible && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              >
                <div
                  className={`w-2 h-2 ${
                    [
                      "bg-pink-400",
                      "bg-purple-400",
                      "bg-yellow-400",
                      "bg-blue-400",
                      "bg-green-400",
                    ][Math.floor(Math.random() * 5)]
                  } ${Math.random() > 0.5 ? "rounded-full" : "rotate-45"}`}
                />
              </div>
            ))}
          </div>
        )}
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center relative">
          <div className="animate-bounce">
            <h1 className="text-4xl font-[Alata] bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              🎉 Relationship Confirmed! 🎉
            </h1>
          </div>
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="text-2xl animate-pulse">💕</span>
            <p className="text-gray-700 font-[Alata] text-lg font-medium">
              Time to celebrate & mint your NFT!
            </p>
            <span className="text-2xl animate-pulse">💕</span>
          </div>
          <div className="flex justify-center gap-1 mt-2">
            {["🎊", "💎", "🥳", "💎", "🎊"].map((emoji, i) => (
              <span
                key={i}
                className="text-xl animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>

        {/* Relationship Info Card */}
        <div className="mx-8 mb-8 bg-white rounded-[24px] p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="flex justify-center items-center mb-4">
              {/* User's photo placeholder */}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-[Alata] text-lg">You</span>
              </div>

              {/* Heart icon */}
              <div className="mx-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="text-red-500"
                >
                  <path
                    fill="currentColor"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </div>

              {/* Partner's photo */}
              <div className="w-16 h-16 rounded-full overflow-hidden ml-4">
                <img
                  src={partnerProfile.photos[0]}
                  alt={partnerProfile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <h2 className="text-xl font-[Alata] text-black mb-2">
              You & {partnerProfile.name}
            </h2>
            <p className="text-purple-600 font-[Alata] text-sm mb-4">
              Stake: {relationshipStatus.stakeAmount} ETH
            </p>
            <p className="text-gray-500 font-[Alata] text-xs">
              Committed since{" "}
              {new Date(relationshipStatus.startDate!).toLocaleDateString()}
            </p>
          </div>

          {!mintComplete && !isMinting && (
            <div className="text-center">
              <h3 className="text-lg font-[Alata] text-black mb-3">
                Create Your Relationship NFT
              </h3>
              <p className="text-gray-600 font-[Alata] text-sm mb-6">
                This NFT represents your committed relationship on the
                blockchain. It will hold your staked ETH and can only be
                dissolved by mutual agreement.
              </p>

              <button
                onClick={handleMintNFT}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-[Alata] rounded-[15px] hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Mint Relationship NFT
              </button>
            </div>
          )}

          {isMinting && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    className="text-white"
                  >
                    <path
                      fill="currentColor"
                      d="M20 2L2 7l3 3v10c0 10.55 6.84 20.74 15 23 8.16-2.26 15-12.45 15-23V10l3-3L20 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-[Alata] text-black mb-2">
                  Minting Your NFT...
                </h3>
                <p className="text-gray-600 font-[Alata] text-sm mb-4">
                  Creating your relationship certificate on the blockchain
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${mintProgress}%` }}
                ></div>
              </div>
              <p className="text-sm font-[Alata] text-gray-500">
                {Math.round(mintProgress)}% Complete
              </p>
            </div>
          )}

          {mintComplete && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse shadow-lg">
                  <div className="text-4xl">🎉</div>
                </div>
                <div className="animate-bounce mb-4">
                  <h3 className="text-2xl font-[Alata] bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    🎊 NFT Minted Successfully! 🎊
                  </h3>
                </div>
                <p className="text-gray-700 font-[Alata] text-lg mb-4 font-medium">
                  🎉 Your relationship is now secured on the blockchain! 🎉
                </p>
                <div className="flex justify-center gap-1 mb-6">
                  {["🎊", "💍", "💎", "💍", "🎊"].map((emoji, i) => (
                    <span
                      key={i}
                      className="text-2xl animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-[Alata] text-gray-500 bg-gray-100 rounded-lg p-2 mb-6">
                  Token ID: {relationshipStatus.nftTokenId}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-3">
                  <p className="text-green-800 font-[Alata] text-sm font-medium">
                    🔒 Relationship locked & secured!
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-lg p-3">
                  <p className="text-blue-800 font-[Alata] text-sm font-medium">
                    💎 {relationshipStatus.stakeAmount} ETH in joint wallet
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-3">
                  <p className="text-purple-800 font-[Alata] text-sm font-medium">
                    🏆 Milestone journey begins now!
                  </p>
                </div>
              </div>

              {/* Dashboard Navigation Button */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/couples-dashboard")}
                  className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-[Alata] text-lg font-medium rounded-[15px] hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                >
                  💕 Enter Your Love Dashboard
                </button>

                <p className="text-xs text-gray-500 font-[Alata]">
                  Track milestones, manage challenges & build your future
                  together
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Exit for Testing */}
        <div className="mx-8 mb-8">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="text-sm font-[Alata] text-orange-800 mb-2">
              🚧 Testing Mode
            </h4>
            <p className="text-xs text-orange-700 font-[Alata] mb-3">
              Emergency exit to return to dating mode (for testing only)
            </p>
            <button
              onClick={handleExitForTesting}
              className="w-full h-10 bg-orange-100 hover:bg-orange-200 border border-orange-300 text-orange-800 font-[Alata] rounded-lg text-sm transition-colors"
            >
              Exit Relationship (Testing)
            </button>
          </div>
        </div>
      </div>
    </AnimatedPageWrapper>
  );
}
