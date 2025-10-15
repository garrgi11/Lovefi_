import React, { useState } from "react";

interface StakeProposalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  recipientName: string;
}

export default function StakeProposal({
  isOpen,
  onClose,
  onSubmit,
  recipientName,
}: StakeProposalProps) {
  const [stakeAmount, setStakeAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    const amount = parseFloat(stakeAmount);
    if (amount && amount > 0) {
      setIsSubmitting(true);
      onSubmit(amount);
      setStakeAmount("");
      setIsSubmitting(false);
      onClose();
    }
  };

  const handleClose = () => {
    setStakeAmount("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-16">
      <div
        className="bg-white rounded-[20px] p-6 w-full max-w-sm mx-auto shadow-2xl"
        style={{
          animation: isOpen ? "scaleIn 0.3s ease-out forwards" : "none",
          transform: "scale(0.8)",
          transformOrigin: "center",
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 34 34"
              fill="none"
              className="text-white"
            >
              <g clipPath="url(#clip0_20_209)">
                <path
                  d="M17 1.41663V32.5833M24.0833 7.08329H13.4583C12.1433 7.08329 10.8821 7.60569 9.95226 8.53555C9.02239 9.46542 8.5 10.7266 8.5 12.0416C8.5 13.3567 9.02239 14.6178 9.95226 15.5477C10.8821 16.4776 12.1433 17 13.4583 17H20.5417C21.8567 17 23.1179 17.5224 24.0477 18.4522C24.9776 19.3821 25.5 20.6433 25.5 21.9583C25.5 23.2733 24.9776 24.5345 24.0477 25.4644C23.1179 26.3942 21.8567 26.9166 20.5417 26.9166H8.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_20_209">
                  <rect width="34" height="34" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <h2 className="text-2xl font-[Alata] text-black mb-2">
            Stake Your Commitment
          </h2>
          <p className="text-gray-600 font-[Alata] text-sm">
            How much ETH are you willing to stake for an exclusive relationship
            with {recipientName}?
          </p>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-[Alata] text-black mb-2">
            Stake Amount (ETH)
          </label>
          <div className="relative">
            <div className="absolute left-4 top-3.5 text-gray-400 font-[Alata]">
              Ξ
            </div>
            <input
              type="number"
              placeholder="0.00"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="w-full h-12 pl-8 pr-4 border border-[#E8E6EA] rounded-[15px] bg-white text-lg font-[Alata] placeholder-gray-400 focus:outline-none focus:border-lovefi-purple"
              step="0.001"
              min="0"
            />
          </div>
          <p className="text-xs text-gray-500 font-[Alata] mt-2">
            This ETH amount will be held in escrow until both parties agree to
            the relationship terms.
          </p>
        </div>

        {/* Preset Amounts */}
        <div className="mb-8">
          <p className="text-sm font-[Alata] text-black mb-3">Quick amounts:</p>
          <div className="grid grid-cols-3 gap-2">
            {[0.01, 0.05, 0.1].map((amount) => (
              <button
                key={amount}
                onClick={() => setStakeAmount(amount.toString())}
                className="h-10 border border-[#E8E6EA] rounded-[10px] bg-white text-sm font-[Alata] text-black hover:border-lovefi-purple hover:bg-purple-50 transition-colors"
              >
                {amount} ETH
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 h-12 border border-[#E8E6EA] rounded-[15px] bg-white text-black font-[Alata] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !stakeAmount || parseFloat(stakeAmount) <= 0 || isSubmitting
            }
            className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-[Alata] rounded-[15px] hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Proposing..." : "Propose Stake"}
          </button>
        </div>
      </div>
    </div>
  );
}
