import { useNavigate } from "react-router-dom";
import LocationSelection from "../components/LocationSelection";

export default function LocationSelectionPage() {
  const navigate = useNavigate();

  const handleContinue = () => {
    console.log("Location selection completed");
    // Navigate to sexuality selection
    navigate("/sexuality-selection");
  };

  const handleBack = () => {
    navigate("/gender-selection");
  };

  return <LocationSelection onContinue={handleContinue} onBack={handleBack} />;
}
