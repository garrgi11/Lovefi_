import { Link } from "react-router-dom";
import LovefiLogo from "./LovefiLogo";
import AnimatedPageWrapper from "./AnimatedPageWrapper";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

interface SignUpProps {
  onWalletConnect?: (walletData: {
    name: string;
    logo?: string;
    type?: string;
  }) => void;
}

export default function SignUp({ onWalletConnect }: SignUpProps) {
  return (
    <AnimatedPageWrapper direction="right">
      <div className="h-screen bg-white flex flex-col items-center px-6 sm:px-10 py-8 overflow-hidden">
        <div className="w-full max-w-[295px] flex flex-col items-center h-full justify-between">
          {/* Top Section with Logo */}
          <div className="flex flex-col items-center pt-4">
            {/* Logo Section */}
            <div className="mb-8">
              <LovefiLogo size={200} className="sm:scale-110" />
            </div>

            {/* Heading */}
            <h2 className="text-lg font-alata font-normal text-center text-black mb-4">
              Connect your wallet to continue
            </h2>
            <p className="text-sm font-alata text-center text-gray-600 mb-8">
              Connect your preferred wallet to sign up and start finding your
              true love
            </p>
          </div>

          {/* Middle Section with Wallet Connect */}
          <div className="w-full space-y-4 flex-grow flex flex-col justify-center">
            {/* Dynamic Widget for Wallet Connection */}
            <div className="w-full flex justify-center">
              <DynamicWidget />
            </div>

            {/* Info Text */}
            <div className="w-full pt-4">
              <p className="text-xs font-alata text-center text-gray-500 leading-relaxed">
                Your wallet will be used to verify your identity and secure your
                account. We don't store your private keys.
              </p>
            </div>
          </div>

          {/* Bottom Section with Footer Links */}
          <div className="flex items-center justify-center gap-6 text-sm pb-4">
            <Link
              to="/terms"
              className="text-lovefi-text-secondary font-alata hover:opacity-80 transition-opacity"
            >
              Terms of use
            </Link>
            <Link
              to="/privacy"
              className="text-lovefi-text-secondary font-alata hover:opacity-80 transition-opacity"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </AnimatedPageWrapper>
  );
}
