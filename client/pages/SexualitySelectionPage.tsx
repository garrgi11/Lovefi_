import { useNavigate } from "react-router-dom";
import SexualitySelection from "../components/SexualitySelection";

export default function SexualitySelectionPage() {
  const navigate = useNavigate();

  const handleContinue = () => {
    console.log("Sexuality selection completed");
    // Navigate to partner preferences (what's your type)
    navigate("/partner-preferences");
  };

  const handleBack = () => {
    navigate("/location-selection");
  };

  return <SexualitySelection onContinue={handleContinue} onBack={handleBack} />;
}
