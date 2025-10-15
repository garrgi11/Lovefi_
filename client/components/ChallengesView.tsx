import { useState } from "react";
import { Link } from "react-router-dom";
import AnimatedPageWrapper from "./AnimatedPageWrapper";

interface Challenge {
  id: string;
  title: string;
  description: string;
  stake: number;
  submittedBy: string;
  submittedByAvatar: string;
  status: "pending" | "completed" | "failed" | "submitted";
  dueDate: string;
  proofUrl?: string;
  reward: number;
}

const ChallengesView = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "1",
      title: "Picnic Date",
      description:
        "Share a picnic selfie together in a park or outdoor setting",
      stake: 0.005,
      submittedBy: "Sarah M.",
      submittedByAvatar: "🙋‍♀️",
      status: "pending",
      dueDate: "2024-01-20",
      reward: 0.005,
    },
    {
      id: "2",
      title: "Cook Together",
      description:
        "Make dinner together and share a photo of the cooking process",
      stake: 0.003,
      submittedBy: "Mike R.",
      submittedByAvatar: "🙋‍♂️",
      status: "pending",
      dueDate: "2024-01-22",
      reward: 0.003,
    },
    {
      id: "3",
      title: "Sunrise Watch",
      description: "Watch the sunrise together and capture the moment",
      stake: 0.002,
      submittedBy: "Emma L.",
      submittedByAvatar: "👩",
      status: "submitted",
      dueDate: "2024-01-15",
      reward: 0.002,
      proofUrl: "https://example.com/sunrise-photo",
    },
    {
      id: "4",
      title: "Museum Visit",
      description: "Visit a local museum or art gallery together",
      stake: 0.004,
      submittedBy: "Alex T.",
      submittedByAvatar: "👨",
      status: "completed",
      dueDate: "2024-01-10",
      reward: 0.004,
    },
  ]);

  const [selectedTab, setSelectedTab] = useState<"active" | "completed">(
    "active",
  );
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submittingProof, setSubmittingProof] = useState<string | null>(null);

  const activeChallenges = challenges.filter(
    (c) => c.status === "pending" || c.status === "submitted",
  );
  const completedChallenges = challenges.filter(
    (c) => c.status === "completed" || c.status === "failed",
  );

  const handleProofSubmission = async (challengeId: string) => {
    if (!proofFile) return;

    setSubmittingProof(challengeId);

    // Simulate upload process
    setTimeout(() => {
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId
            ? {
                ...c,
                status: "submitted" as const,
                proofUrl: "https://example.com/proof",
              }
            : c,
        ),
      );
      setSubmittingProof(null);
      setProofFile(null);
    }, 2000);
  };

  const getStatusColor = (status: Challenge["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "submitted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: Challenge["status"]) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "submitted":
        return "Awaiting Review";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      default:
        return "Unknown";
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
                  Challenges
                </h1>
                <p className="text-sm text-gray-600">
                  Complete tasks set by friends
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setSelectedTab("active")}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-alata font-medium transition-colors ${
                  selectedTab === "active"
                    ? "bg-white text-lovefi-purple shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Active ({activeChallenges.length})
              </button>
              <button
                onClick={() => setSelectedTab("completed")}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-alata font-medium transition-colors ${
                  selectedTab === "completed"
                    ? "bg-white text-lovefi-purple shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Completed ({completedChallenges.length})
              </button>
            </div>
          </div>

          {/* Challenges List */}
          <div className="px-5 space-y-4 pb-24">
            {(selectedTab === "active"
              ? activeChallenges
              : completedChallenges
            ).map((challenge) => (
              <div
                key={challenge.id}
                className="bg-white border-2 border-lovefi-border rounded-2xl p-4"
              >
                {/* Challenge Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {challenge.submittedByAvatar}
                    </span>
                    <div>
                      <h3 className="text-lg font-alata font-bold text-black">
                        {challenge.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        by {challenge.submittedBy}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(challenge.status)}`}
                  >
                    {getStatusText(challenge.status)}
                  </div>
                </div>

                {/* Challenge Description */}
                <p className="text-sm text-gray-700 mb-4">
                  {challenge.description}
                </p>

                {/* Challenge Details */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Stake: </span>
                    <span className="font-medium text-lovefi-purple">
                      {challenge.stake} ETH
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Due: </span>
                    <span className="font-medium">{challenge.dueDate}</span>
                  </div>
                </div>

                {/* Challenge Actions */}
                {challenge.status === "pending" && (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setProofFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                        id={`proof-${challenge.id}`}
                      />
                      <label
                        htmlFor={`proof-${challenge.id}`}
                        className="cursor-pointer text-lovefi-purple font-medium"
                      >
                        📷 Upload Proof Photo
                      </label>
                      {proofFile && (
                        <p className="text-sm text-gray-600 mt-2">
                          {proofFile.name}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleProofSubmission(challenge.id)}
                      disabled={!proofFile || submittingProof === challenge.id}
                      className="w-full py-3 bg-lovefi-purple text-white rounded-lg font-alata font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingProof === challenge.id
                        ? "Submitting..."
                        : "Submit Proof"}
                    </button>
                  </div>
                )}

                {challenge.status === "submitted" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      ⏳ Proof submitted! Waiting for community approval.
                    </p>
                  </div>
                )}

                {challenge.status === "completed" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700">
                      ✅ Challenge completed! You earned {challenge.reward} ETH.
                    </p>
                  </div>
                )}

                {challenge.status === "failed" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">
                      ❌ Challenge not completed. Stake went to community pool.
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Empty State */}
            {(selectedTab === "active" ? activeChallenges : completedChallenges)
              .length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">
                  {selectedTab === "active" ? "🎯" : "🏆"}
                </div>
                <h3 className="text-lg font-alata font-bold text-gray-600 mb-2">
                  {selectedTab === "active"
                    ? "No Active Challenges"
                    : "No Completed Challenges"}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedTab === "active"
                    ? "Friends can create challenges for you to complete together!"
                    : "Complete challenges to see them here."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedPageWrapper>
  );
};

export default ChallengesView;
