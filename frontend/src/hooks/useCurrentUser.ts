import { useCallback, useEffect, useState } from "react";

export interface CurrentUser {
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const baseUrl = import.meta.env.DEV ? "http://127.0.0.1:5000" : "";

  const fetchUser = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/dashboard/dashboard`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          setUser(null);
          return;
        }
        throw new Error("Failed to fetch current user");
      }

      const data = await res.json();
      setUser(data?.user_info ?? null);
    } catch (e) {
      console.error(e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, isLoading, refresh: fetchUser };
}

