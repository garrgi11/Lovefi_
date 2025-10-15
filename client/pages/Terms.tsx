import { Link } from "react-router-dom";
import LovefiLogo from "../components/LovefiLogo";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header with logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <LovefiLogo size={120} />
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <h1 className="text-2xl font-alata font-semibold text-center mb-8">
            Terms of Use
          </h1>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600 font-alata mb-4">
              This is a placeholder page for Terms of Use.
            </p>
            <p className="text-sm text-gray-500 font-alata">
              Continue prompting to have me fill in the actual terms and
              conditions content.
            </p>
          </div>

          <div className="text-center pt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl text-white font-alata font-normal transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(90deg, #8D7DFF 0%, #C160FF 100%)",
              }}
            >
              Back to Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
