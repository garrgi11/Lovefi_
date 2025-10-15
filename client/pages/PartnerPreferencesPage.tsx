import { useNavigate } from "react-router-dom";
import PartnerPreferences from "../components/PartnerPreferences";

export default function PartnerPreferencesPage() {
  const navigate = useNavigate();

  const handleContinue = () => {
    console.log("Partner preferences completed");
    // Navigate to personal interests
    navigate("/personal-interests");
  };

  const handleBack = () => {
    navigate("/location-selection");
  };

  return <PartnerPreferences onContinue={handleContinue} onBack={handleBack} />;
}
