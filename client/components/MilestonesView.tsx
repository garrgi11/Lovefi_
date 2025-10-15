import { useState } from "react";
import { Link } from "react-router-dom";
import AnimatedPageWrapper from "./AnimatedPageWrapper";

interface Milestone {
  id: string;
  name: string;
  period: string;
  description: string;
  completed: boolean;
  nftMinted: boolean;
  date?: string;
  requiredDays: number;
  nftReward: string;
}

const MilestonesView = () => {
  const [relationshipDays] = useState(127);

  const milestones: Milestone[] = [
    {
      id: "1",
      name: "First Week",
      period: "7 days",
      description: "Celebrating your first week together on the blockchain!",
      completed: true,
      nftMinted: true,
      date: "2024-01-01",
      requiredDays: 7,
      nftReward: "🌱 New Love NFT",
    },
    {
      id: "2",
      name: "One Month Strong",
      period: "30 days",
      description: "A month of shared memories and growing stronger together.",
      completed: true,
      nftMinted: true,
      date: "2024-01-24",
      requiredDays: 30,
      nftReward: "🌸 Blooming Love NFT",
    },
    {
      id: "3",
      name: "Quarter Year",
      period: "3 months",
      description: "Three months of love, trust, and beautiful moments.",
      completed: true,
      nftMinted: true,
      date: "2024-03-24",
      requiredDays: 90,
      nftReward: "🌳 Growing Love NFT",
    },
    {
      id: "4",
      name: "Half Year Journey",
      period: "6 months",
      description: "Six months of deepening connection and shared dreams.",
      completed: false,
      nftMinted: false,
      requiredDays: 180,
      nftReward: "💎 Committed Love NFT",
    },
    {
      id: "5",
      name: "One Year Anniversary",
      period: "1 year",
      description:
        "A full year of love, growth, and building your future together.",
      completed: false,
      nftMinted: false,
      requiredDays: 365,
      nftReward: "👑 Eternal Love NFT",
    },
    {
      id: "6",
      name: "Two Years Strong",
      period: "2 years",
      description: "Two years of unbreakable bond and endless possibilities.",
      completed: false,
      nftMinted: false,
      requiredDays: 730,
      nftReward: "🏰 Fortress Love NFT",
    },
  ];

  const getProgressToNext = () => {
    const nextMilestone = milestones.find((m) => !m.completed);
    if (!nextMilestone) return 100;

    const progress = (relationshipDays / nextMilestone.requiredDays) * 100;
    return Math.min(progress, 100);
  };

  const getDaysToNext = () => {
    const nextMilestone = milestones.find((m) => !m.completed);
    if (!nextMilestone) return 0;

    return Math.max(0, nextMilestone.requiredDays - relationshipDays);
  };

  const nextMilestone = milestones.find((m) => !m.completed);
  const progressToNext = getProgressToNext();
  const daysToNext = getDaysToNext();

  return (
    <AnimatedPageWrapper direction="left">
      <div className="min-h-screen bg-white">
        <div className="w-full max-w-[375px] mx-auto">
          {/* Header */}
          <div className="px-5 pt-12 pb-6">
            <div className="flex items-center gap-4 mb-6">
              <Link
                to="/couples-dashboard"
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
              <div>
                <h1 className="text-2xl font-alata font-bold text-black">
                  Milestones
                </h1>
                <p className="text-sm text-gray-600">Track your love journey</p>
              </div>
            </div>

            {/* Next Milestone Progress */}
            {nextMilestone && (
              <div className="bg-gradient-to-r from-lovefi-purple-light to-lovefi-purple-pink rounded-2xl p-4 mb-6">
                <div className="text-white mb-3">
                  <div className="text-lg font-alata font-bold">
                    Next: {nextMilestone.name}
                  </div>
                  <div className="text-white/90 text-sm">
                    {nextMilestone.description}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-white/90 text-sm mb-1">
                    <span>{relationshipDays} days</span>
                    <span>{nextMilestone.requiredDays} days</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-white rounded-full h-3 transition-all duration-500"
                      style={{ width: `${progressToNext}%` }}
                    />
                  </div>
                </div>

                <div className="text-white/90 text-sm">
                  {daysToNext > 0 ? (
                    <span>🗓️ {daysToNext} days to go!</span>
                  ) : (
                    <span>🎉 Ready to mint your NFT!</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Milestones List */}
          <div className="px-5 space-y-4 pb-24">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`relative p-4 rounded-2xl border-2 transition-all ${
                  milestone.completed
                    ? "bg-green-50 border-green-200"
                    : milestone.id === nextMilestone?.id
                      ? "bg-lovefi-purple bg-opacity-5 border-lovefi-purple"
                      : "bg-gray-50 border-gray-200"
                }`}
              >
                {/* Milestone Number */}
                <div className="absolute -left-3 top-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      milestone.completed
                        ? "bg-green-500 text-white"
                        : milestone.id === nextMilestone?.id
                          ? "bg-lovefi-purple text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {milestone.completed ? "✓" : index + 1}
                  </div>
                </div>

                {/* Milestone Content */}
                <div className="ml-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-alata font-bold text-black">
                        {milestone.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {milestone.period}
                      </p>
                    </div>
                    {milestone.completed && milestone.nftMinted && (
                      <div className="text-right">
                        <div className="text-sm text-green-600 font-medium">
                          NFT Minted
                        </div>
                        <div className="text-xs text-gray-500">
                          {milestone.date}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mb-3">
                    {milestone.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-lovefi-purple font-medium">
                      {milestone.nftReward}
                    </div>
                    <div className="text-sm text-gray-500">
                      {milestone.requiredDays} days required
                    </div>
                  </div>

                  {/* Action Button */}
                  {milestone.completed && milestone.nftMinted && (
                    <button className="mt-3 px-4 py-2 bg-green-500 text-white text-sm rounded-lg font-medium">
                      View NFT
                    </button>
                  )}

                  {milestone.completed && !milestone.nftMinted && (
                    <button className="mt-3 px-4 py-2 bg-lovefi-purple text-white text-sm rounded-lg font-medium">
                      Mint NFT
                    </button>
                  )}

                  {!milestone.completed &&
                    milestone.id === nextMilestone?.id &&
                    daysToNext === 0 && (
                      <button className="mt-3 px-4 py-2 bg-lovefi-purple text-white text-sm rounded-lg font-medium">
                        Confirm Milestone
                      </button>
                    )}
                </div>

                {/* Connection Line */}
                {index < milestones.length - 1 && (
                  <div className="absolute -bottom-4 left-1 w-0.5 h-8 bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedPageWrapper>
  );
};

export default MilestonesView;
