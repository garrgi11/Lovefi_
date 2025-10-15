import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import AnimatedPageWrapper from "./AnimatedPageWrapper";

interface Milestone {
  id: string;
  name: string;
  period: string;
  completed: boolean;
  nftMinted: boolean;
  date?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  stake: number;
  submittedBy: string;
  status: "pending" | "completed" | "failed";
  dueDate: string;
}

interface FriendBet {
  id: string;
  friendName: string;
  prediction: string;
  stake: number;
  avatar: string;
}

const CouplesDashboard = () => {
  const navigate = useNavigate();
  const { clearUserData } = useUser();
  const [selectedMode] = useState<"short" | "long">("long");

  const handleResetFlow = () => {
    // Clear all user data and go back to beginning
    clearUserData();
    navigate("/", { replace: true });
  };

  // Mock data - in real app this would come from blockchain/API
  const [jointWalletBalance] = useState(2.41186); // ETH
  const [currentStreak] = useState(9); // days
  const [relationshipDays] = useState(127);

  const milestones: Milestone[] = [
    {
      id: "1",
      name: "1 Week",
      period: "7 days",
      completed: true,
      nftMinted: true,
      date: "2024-01-01",
    },
    {
      id: "2",
      name: "1 Month",
      period: "30 days",
      completed: true,
      nftMinted: true,
      date: "2024-01-24",
    },
    {
      id: "3",
      name: "3 Months",
      period: "90 days",
      completed: true,
      nftMinted: true,
      date: "2024-03-24",
    },
    {
      id: "4",
      name: "6 Months",
      period: "180 days",
      completed: false,
      nftMinted: false,
    },
    {
      id: "5",
      name: "1 Year",
      period: "365 days",
      completed: false,
      nftMinted: false,
    },
    {
      id: "6",
      name: "2 Years",
      period: "730 days",
      completed: false,
      nftMinted: false,
    },
  ];

  const challenges: Challenge[] = [
    {
      id: "1",
      title: "Picnic Date",
      description: "Share a picnic selfie together",
      stake: 0.005,
      submittedBy: "Sarah M.",
      status: "pending",
      dueDate: "2024-01-20",
    },
    {
      id: "2",
      title: "Cook Together",
      description: "Make dinner together and share photo",
      stake: 0.003,
      submittedBy: "Mike R.",
      status: "pending",
      dueDate: "2024-01-22",
    },
  ];

  const friendBets: FriendBet[] = [
    {
      id: "1",
      friendName: "Sarah",
      prediction: "1 Year",
      stake: 0.001,
      avatar: "🙋‍♀️",
    },
    {
      id: "2",
      friendName: "Mike",
      prediction: "6 Months",
      stake: 0.001,
      avatar: "🙋‍♂️",
    },
    {
      id: "3",
      friendName: "Emma",
      prediction: "2 Years",
      stake: 0.002,
      avatar: "👩",
    },
  ];

  const completedMilestones = milestones.filter((m) => m.completed).length;
  const progressPercentage = (completedMilestones / milestones.length) * 100;

  const getMilestoneProgress = () => {
    return milestones.map((milestone) => ({
      name: milestone.name
        .replace(" Strong", "")
        .replace(" Journey", "")
        .replace(" Anniversary", ""),
      completed: milestone.completed,
      id: milestone.id,
    }));
  };

  return (
    <AnimatedPageWrapper direction="left">
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="w-full max-w-[375px] mx-auto h-full">
          {/* Joint Wallet Header */}
          <div className="px-5 pt-12 pb-6 text-center">
            <div className="text-3xl font-alata font-bold text-gray-900 mb-1">
              {jointWalletBalance.toFixed(3)} ETH
            </div>
            <div className="text-sm text-gray-500">Joint Account Balance</div>
          </div>

          {/* Days Together */}
          <div className="px-5 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <div className="text-2xl font-bold text-lovefi-purple mb-1">
                {relationshipDays}
              </div>
              <div className="text-sm text-gray-600 mb-1">Days Together</div>
              <div className="text-xs text-gray-500">
                Keep the streak going! 💕
              </div>
            </div>
          </div>

          {/* Milestone Progress */}
          <div className="px-5 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-alata font-medium text-gray-700 mb-3">
                Milestone Progress
              </h3>
              <div className="flex justify-between items-center gap-1">
                {getMilestoneProgress().map((milestone, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <span className="text-xs text-gray-500 text-center">
                      {milestone.name}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        milestone.completed
                          ? "bg-gradient-to-r from-lovefi-purple to-lovefi-purple-pink"
                          : "bg-gray-100"
                      }`}
                    >
                      {milestone.completed && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cards Section */}
          <div className="px-5 space-y-4 pb-24">
            {/* Grid Layout for Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Milestone Progress Card */}
              <button
                onClick={() => navigate("/milestones")}
                className="bg-white rounded-2xl p-4 text-left hover:shadow-md transition-all border border-gray-100"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="text-sm font-alata font-medium text-gray-700 mb-1">
                    Milestones
                  </div>
                  <div className="text-lg font-bold text-lovefi-purple">
                    {completedMilestones}/{milestones.length}
                  </div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
              </button>

              {/* Active Challenges Card */}
              <button
                onClick={() => navigate("/challenges")}
                className="bg-white rounded-2xl p-4 text-left hover:shadow-md transition-all border border-gray-100"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-sm font-alata font-medium text-gray-700 mb-1">
                    Challenges
                  </div>
                  <div className="text-lg font-bold text-orange-500">
                    {challenges.length}
                  </div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
              </button>
            </div>

            {/* Friends Predictions Card */}
            <button
              onClick={() => navigate("/friends-predictions")}
              className="w-full bg-white rounded-2xl p-4 text-left hover:shadow-md transition-all border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <h3 className="text-gray-900 font-alata font-medium">
                    Friends Predictions
                  </h3>
                </div>
                <span className="text-xs text-gray-500">
                  {friendBets.length} predictions
                </span>
              </div>
              <div className="space-y-2">
                {friendBets.slice(0, 2).map((bet) => (
                  <div
                    key={bet.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="text-gray-900 font-medium">
                      {bet.prediction}
                    </div>
                    <div className="text-xs text-gray-500">{bet.stake} ETH</div>
                  </div>
                ))}
              </div>
            </button>

            {/* Tester Function - Reset Flow */}
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <h4 className="text-sm font-alata font-medium text-red-800 mb-2">
                🧪 Testing Mode
              </h4>
              <p className="text-xs text-red-700 font-alata mb-3">
                Reset all data and return to the beginning of the flow
              </p>
              <button
                onClick={handleResetFlow}
                className="w-full h-10 bg-red-100 hover:bg-red-200 border border-red-300 text-red-800 font-alata rounded-lg text-sm transition-colors"
              >
                🔄 Reset to Beginning
              </button>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPageWrapper>
  );
};

export default CouplesDashboard;
