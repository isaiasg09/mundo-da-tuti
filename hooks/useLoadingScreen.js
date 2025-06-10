import { useEffect, useState } from "react";

export function useLoadingScreen(duration = 1500) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration]);

  return isLoading;
}
