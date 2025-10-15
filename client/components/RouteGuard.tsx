import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

interface RouteGuardProps {
  children: React.ReactNode;
  requireCouples?: boolean; // Requires couples flow
  requireSingles?: boolean; // Requires singles flow
  redirectTo?: string; // Where to redirect if guard fails
}

export default function RouteGuard({
  children,
  requireCouples = false,
  requireSingles = false,
  redirectTo,
}: RouteGuardProps) {
  const { userData } = useUser();
  const navigate = useNavigate();

  const isInCouplesFlow =
    userData.relationshipStatus?.isInRelationship &&
    userData.relationshipStatus?.nftMinted;

  useEffect(() => {
    // If route requires couples flow but user is single
    if (requireCouples && !isInCouplesFlow) {
      navigate(redirectTo || "/matching", { replace: true });
      return;
    }

    // If route requires singles flow but user is in couples flow
    if (requireSingles && isInCouplesFlow) {
      navigate(redirectTo || "/couples-dashboard", { replace: true });
      return;
    }
  }, [isInCouplesFlow, requireCouples, requireSingles, redirectTo, navigate]);

  // Don't render children if guard conditions are not met
  if (requireCouples && !isInCouplesFlow) {
    return null;
  }

  if (requireSingles && isInCouplesFlow) {
    return null;
  }

  return <>{children}</>;
}
