import MatchingScreen from "../components/MatchingScreen";
import BottomNavigation from "../components/BottomNavigation";

export default function MatchingPage() {
  return (
    <div className="w-full min-h-screen bg-white">
      <MatchingScreen />

      {/* Navigation as part of normal flow - user scrolls to access */}
      <div className="bg-white border-t-4 border-gray-400 shadow-xl py-6 px-4 mt-8">
        <div className="grid grid-cols-3 gap-0 max-w-sm mx-auto">
          <button
            onClick={() => (window.location.href = "/matching")}
            className="flex flex-col items-center justify-center py-4 px-2 rounded-lg text-purple-600 bg-purple-100"
          >
            <div className="text-3xl mb-2">♥</div>
            <span className="text-sm font-medium">Matching</span>
          </button>
          <button
            onClick={() => (window.location.href = "/messages")}
            className="flex flex-col items-center justify-center py-4 px-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            <div className="text-3xl mb-2">💬</div>
            <span className="text-sm font-medium">Messages</span>
          </button>
          <button
            onClick={() => (window.location.href = "/profile")}
            className="flex flex-col items-center justify-center py-4 px-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            <div className="text-3xl mb-2">👤</div>
            <span className="text-sm font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
