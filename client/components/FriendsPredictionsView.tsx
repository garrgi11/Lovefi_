import { useState } from "react";
import { Link } from "react-router-dom";
import AnimatedPageWrapper from "./AnimatedPageWrapper";

interface FriendBet {
  id: string;
  friendName: string;
  prediction: string;
  stake: number;
  avatar: string;
  dateSubmitted: string;
  confidence: "low" | "medium" | "high";
}

interface PredictionOption {
  id: string;
  milestone: string;
  period: string;
  totalStaked: number;
  betCount: number;
}

const FriendsPredictionsView = () => {
  const [friendBets] = useState<FriendBet[]>([
    {
      id: "1",
      friendName: "Sarah Martinez",
      prediction: "1 Year",
      stake: 0.001,
      avatar: "🙋‍♀️",
      dateSubmitted: "2024-01-10",
      confidence: "high",
    },
    {
      id: "2",
      friendName: "Mike Richardson",
      prediction: "6 Months",
      stake: 0.001,
      avatar: "🙋‍♂️",
      dateSubmitted: "2024-01-12",
      confidence: "medium",
    },
    {
      id: "3",
      friendName: "Emma Johnson",
      prediction: "2 Years",
      stake: 0.002,
      avatar: "👩",
      dateSubmitted: "2024-01-11",
      confidence: "high",
    },
    {
      id: "4",
      friendName: "Alex Thompson",
      prediction: "1 Year",
      stake: 0.0015,
      avatar: "👨",
      dateSubmitted: "2024-01-13",
      confidence: "medium",
    },
    {
      id: "5",
      friendName: "Lisa Chen",
      prediction: "6 Months",
      stake: 0.0008,
      avatar: "👩‍💼",
      dateSubmitted: "2024-01-14",
      confidence: "low",
    },
    {
      id: "6",
      friendName: "David Wilson",
      prediction: "2 Years",
      stake: 0.0025,
      avatar: "👨‍💼",
      dateSubmitted: "2024-01-09",
      confidence: "high",
    },
  ]);

  const [selectedTab, setSelectedTab] = useState<"predictions" | "leaderboard">(
    "predictions",
  );

  // Calculate prediction statistics
  const predictionOptions: PredictionOption[] = [
    {
      id: "6months",
      milestone: "6 Months",
      period: "180 days",
      totalStaked: friendBets
        .filter((b) => b.prediction === "6 Months")
        .reduce((sum, b) => sum + b.stake, 0),
      betCount: friendBets.filter((b) => b.prediction === "6 Months").length,
    },
    {
      id: "1year",
      milestone: "1 Year",
      period: "365 days",
      totalStaked: friendBets
        .filter((b) => b.prediction === "1 Year")
        .reduce((sum, b) => sum + b.stake, 0),
      betCount: friendBets.filter((b) => b.prediction === "1 Year").length,
    },
    {
      id: "2years",
      milestone: "2 Years",
      period: "730 days",
      totalStaked: friendBets
        .filter((b) => b.prediction === "2 Years")
        .reduce((sum, b) => sum + b.stake, 0),
      betCount: friendBets.filter((b) => b.prediction === "2 Years").length,
    },
  ];

  const totalStaked = predictionOptions.reduce(
    (sum, option) => sum + option.totalStaked,
    0,
  );
  const totalBets = friendBets.length;

  // Sort friends by stake amount for leaderboard
  const leaderboard = [...friendBets].sort((a, b) => b.stake - a.stake);

  const getConfidenceColor = (confidence: FriendBet["confidence"]) => {
    switch (confidence) {
      case "high":
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-red-100 text-red-700 border-red-200";
    }
  };

  const getConfidenceText = (confidence: FriendBet["confidence"]) => {
    switch (confidence) {
      case "high":
        return "High Confidence";
      case "medium":
        return "Medium Confidence";
      case "low":
        return "Low Confidence";
    }
  };

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
                  Friends Predictions
                </h1>
                <p className="text-sm text-gray-600">
                  See what your friends predict
                </p>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="bg-gradient-to-r from-lovefi-purple-light to-lovefi-purple-pink rounded-2xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-white">
                <div className="text-center">
                  <div className="text-2xl font-alata font-bold">
                    {totalBets}
                  </div>
                  <div className="text-white/90 text-sm">Total Predictions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-alata font-bold">
                    {totalStaked.toFixed(4)}
                  </div>
                  <div className="text-white/90 text-sm">ETH Staked</div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setSelectedTab("predictions")}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-alata font-medium transition-colors ${
                  selectedTab === "predictions"
                    ? "bg-white text-lovefi-purple shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Predictions
              </button>
              <button
                onClick={() => setSelectedTab("leaderboard")}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-alata font-medium transition-colors ${
                  selectedTab === "leaderboard"
                    ? "bg-white text-lovefi-purple shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Leaderboard
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-5 pb-24">
            {selectedTab === "predictions" ? (
              <div className="space-y-6">
                {/* Prediction Options Summary */}
                <div className="space-y-3">
                  {predictionOptions.map((option) => (
                    <div
                      key={option.id}
                      className="bg-white border-2 border-lovefi-border rounded-2xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-alata font-bold text-black">
                          {option.milestone}
                        </h3>
                        <span className="text-sm text-gray-600">
                          {option.period}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-600">
                          {option.betCount} friend
                          {option.betCount !== 1 ? "s" : ""} predict this
                        </div>
                        <div className="text-sm font-medium text-lovefi-purple">
                          {option.totalStaked.toFixed(4)} ETH staked
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-lovefi-purple rounded-full h-2 transition-all duration-300"
                          style={{
                            width: `${totalStaked > 0 ? (option.totalStaked / totalStaked) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Individual Predictions */}
                <div>
                  <h3 className="text-lg font-alata font-bold text-black mb-4">
                    All Predictions
                  </h3>
                  <div className="space-y-3">
                    {friendBets.map((bet) => (
                      <div
                        key={bet.id}
                        className="bg-white border border-gray-200 rounded-2xl p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{bet.avatar}</span>
                            <div>
                              <p className="text-sm text-gray-600">
                                {bet.dateSubmitted}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`px-2 py-1 rounded-lg text-xs border ${getConfidenceColor(bet.confidence)}`}
                          >
                            {getConfidenceText(bet.confidence)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-600 text-sm">
                              Predicts:{" "}
                            </span>
                            <span className="font-medium text-lovefi-purple">
                              {bet.prediction}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">
                              Stake:{" "}
                            </span>
                            <span className="font-medium">{bet.stake} ETH</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Leaderboard Tab */
              <div className="space-y-4">
                <h3 className="text-lg font-alata font-bold text-black">
                  Highest Stakes
                </h3>
                {leaderboard.map((bet, index) => (
                  <div
                    key={bet.id}
                    className="bg-white border border-gray-200 rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0
                            ? "bg-yellow-400 text-yellow-900"
                            : index === 1
                              ? "bg-gray-300 text-gray-700"
                              : index === 2
                                ? "bg-orange-300 text-orange-800"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>

                      {/* Friend Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{bet.avatar}</span>
                        <div>
                          <p className="text-sm text-gray-600">
                            Predicts {bet.prediction}
                          </p>
                        </div>
                      </div>

                      {/* Stake Amount */}
                      <div className="text-right">
                        <div className="font-bold text-lovefi-purple">
                          {bet.stake} ETH
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded ${getConfidenceColor(bet.confidence).replace("border-", "")}`}
                        >
                          {bet.confidence.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedPageWrapper>
  );
};

export default FriendsPredictionsView;
