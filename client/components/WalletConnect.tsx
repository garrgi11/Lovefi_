import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import AnimatedPageWrapper from "./AnimatedPageWrapper";

interface WalletConnectProps {
  onContinue?: (walletData: { name: string; logo?: string }) => void;
  onBack?: () => void;
}

interface WalletInfo {
  name: string;
  logo?: string;
  type?: "metamask" | "coinbase" | "walletconnect" | "phantom" | "other";
}

// Wallet type configurations
const WALLET_CONFIGS = {
  metamask: {
    name: "Metamask",
    logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjguNSAxNkMxOS4xNjcgMjAuNzUgMTYgMjQgMTYgMjRzLTMuMTY3LTMuMjUtMTIuNS04QzYuNSAxOS43NSA5LjY2NyAyMyAzLjUgMjcuNSA5LjY2NyAyNy41IDEyIDI0IDE2IDI0IDIwIDI0IDI0IDI3LjUgMjguNSAyNy41IDIyLjMzMyAyMyAyNS41IDE5Ljc1IDI4LjUgMTZ6IiBmaWxsPSIjRjY4NTFCIi8+PC9zdmc+",
  },
  coinbase: {
    name: "Coinbase Wallet",
    logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzAwNTJGRiIvPjxyZWN0IHg9IjkiIHk9IjkiIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgcng9IjMiIGZpbGw9IndoaXRlIi8+PC9zdmc+",
  },
  phantom: {
    name: "Phantom",
    logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzRGNDREOCIvPjxwYXRoIGQ9Ik0xMS41IDIyLjVDMTMgMjQgMTUgMjMuNSAxNiAyMmMxLTEuNSAxLjUtMi41IDEuNS0yLjVzMC41IDEgMS41IDIuNWMxIDEuNSAzIDIgNC41IDAuNWMxLjUtMS41IDEuNS00IDAtNS41LTEuNS0xLjUtMy40LTItNC0yLjVzLS44LTEuNS0uOC0xLjVzLS4zIDEtLjggMS41Yy0uNiAwLjUtMi41IDEtNCAyLjUtMS41IDEuNS0xLjUgNC0wIDUuNXoiIGZpbGw9IndoaXRlIi8+PC9zdmc+",
  },
};

export default function WalletConnect({
  onContinue,
  onBack,
}: WalletConnectProps) {
  const { userData, updateUserData } = useUser();
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    name: userData.wallet?.name || "Metamask",
    type: (userData.wallet?.type as any) || "metamask",
    logo: userData.wallet?.logo || WALLET_CONFIGS.metamask.logo,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // Update context when wallet info changes
  useEffect(() => {
    updateUserData({
      wallet: {
        name: walletInfo.name,
        logo: walletInfo.logo,
        type: walletInfo.type,
      },
    });
  }, [walletInfo.name, walletInfo.logo, walletInfo.type, updateUserData]);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    // TODO: Implement actual wallet connection logic here
    // This will connect to third-party API and update logo/name

    // Simulate API call - in real implementation this would:
    // 1. Detect available wallets
    // 2. Connect to selected wallet
    // 3. Get wallet info from third-party API
    // 4. Update state with actual wallet data
    setTimeout(() => {
      setIsConnecting(false);
      // Simulate different wallet types being detected
      const walletType = "metamask"; // This would come from API detection
      const config = WALLET_CONFIGS[walletType];

      setWalletInfo({
        name: config.name,
        type: walletType,
        logo: config.logo, // This would be the actual logo URL from API
      });
    }, 1000);
  };

  // Function to simulate wallet detection (for demo purposes)
  const simulateWalletChange = (walletType: keyof typeof WALLET_CONFIGS) => {
    const config = WALLET_CONFIGS[walletType];
    setWalletInfo({
      name: config.name,
      type: walletType,
      logo: config.logo,
    });
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue(walletInfo);
    }
  };

  return (
    <AnimatedPageWrapper direction="left">
      <div className="h-screen bg-white px-5 py-5 relative overflow-hidden">
        <div className="w-full max-w-[375px] mx-auto h-full flex flex-col">
          {/* Back Button */}
          <div className="flex-shrink-0 pt-4">
            <Link
              to="/"
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
                  fill="#B865FF"
                />
              </svg>
            </Link>
          </div>

          {/* Header Text */}
          <div className="pt-12 pb-4">
            <h1 className="text-lg font-alata font-normal leading-[150%] text-black">
              Its time to find your{" "}
              <span className="text-lovefi-text-secondary">true love!</span>
              <br />
              First, lets connect your wallet
            </h1>
          </div>

          {/* Wallet Input Field */}
          <div className="relative flex-grow pt-2">
            {/* Input Container */}
            <div className="relative">
              <div className="w-full h-[58px] border border-lovefi-border rounded-2xl bg-white flex items-center px-4 gap-3">
                {/* Wallet Logo */}
                <div className="w-6 h-5 flex items-center justify-center">
                  {walletInfo.logo ? (
                    <img
                      src={walletInfo.logo}
                      alt={walletInfo.name}
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <div className="w-6 h-5 bg-gray-300 rounded flex items-center justify-center">
                      <span className="text-[10px] font-alata text-gray-600">
                        logo
                      </span>
                    </div>
                  )}
                </div>

                {/* Wallet Name */}
                <span className="text-sm font-alata font-normal text-black">
                  {walletInfo.name}
                </span>
              </div>

              {/* Floating Label */}
              <div className="absolute -top-[9px] left-5 bg-white px-2">
                <span className="text-xs font-alata font-normal text-black text-opacity-40">
                  Wallet
                </span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex-shrink-0 pb-8">
            <button
              onClick={handleContinue}
              className="w-full h-14 rounded-2xl text-white font-alata font-normal text-base transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(90deg, #8F7CFF 0%, #BB63FF 100%)",
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
