import { useNavigate } from "react-router-dom";
import UserInfo from "../components/UserInfo";
import { useUser } from "../contexts/UserContext";

export default function UserInfoPage() {
  const navigate = useNavigate();
  const { updateUserData } = useUser();

  const handleContinue = (userInfo: {
    firstName: string;
    lastName: string;
    birthday: string;
  }) => {
    console.log("User info collected:", userInfo);
    // Save user info to context
    updateUserData(userInfo);

    // Navigate to gender selection
    navigate("/gender-selection");
  };

  const handleBack = () => {
    navigate("/wallet-connect");
  };

  return <UserInfo onContinue={handleContinue} onBack={handleBack} />;
}
