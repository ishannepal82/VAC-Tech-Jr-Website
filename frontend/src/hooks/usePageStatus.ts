import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function usePageStatus(defaultErrorMessage: string) {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleError = useCallback(
    (error: unknown, fallbackMessage?: string) => {
      const parsedMessage =
        fallbackMessage ??
        (error instanceof Error && error.message) ??
        defaultErrorMessage;

      toast.error(parsedMessage);
      navigate("/error", { replace: true, state: { message: parsedMessage } });
    },
    [defaultErrorMessage, navigate]
  );

  return {
    isLoading,
    setLoading: setIsLoading,
    handleError,
  };
}

