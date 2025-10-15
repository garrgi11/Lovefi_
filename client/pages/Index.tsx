import { useNavigate } from "react-router-dom";
import SignUp from "../components/SignUp";

export default function Index() {
  const navigate = useNavigate();

  const handleWalletConnect = (walletData: {
    name: string;
    logo?: string;
    type?: string;
  }) => {
    console.log("Wallet connected:", walletData);
    // Navigate to the next step in the onboarding flow
    navigate("/user-info");
  };

  return <SignUp onWalletConnect={handleWalletConnect} />;
}
