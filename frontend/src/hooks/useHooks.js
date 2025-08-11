// src/hooks/useHooks.js
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useConfirmNavigation(hasStarted, message = "Are you sure you want to leave? Your quiz progress will be lost.") {
  const location = useLocation();
  const navigate = useNavigate();
  const lastLocation = useRef(location);
  const confirmedNavigation = useRef(false);

  useEffect(() => {
    if (!hasStarted) {
      lastLocation.current = location; // reset when quiz not started
      return;
    }

    if (confirmedNavigation.current) {
      // reset flag and update last location on confirmed navigation
      confirmedNavigation.current = false;
      lastLocation.current = location;
      return;
    }

    if (location !== lastLocation.current) {
      const confirmLeave = window.confirm(message);
      if (confirmLeave) {
        confirmedNavigation.current = true; // allow navigation once confirmed
        lastLocation.current = location;
      } else {
        // block navigation by reverting back to last location
        navigate(lastLocation.current.pathname + lastLocation.current.search, { replace: true });
      }
    }
  }, [location, hasStarted, message, navigate]);
}
