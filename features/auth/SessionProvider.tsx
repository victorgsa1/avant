import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

// Placeholder session state — there is no real auth yet. It exists so the
// login → onboarding → app flow is actually walkable, and so the route
// guards in the root layout have something to read. Swapping in a real
// provider later only touches this file.
export type SessionStatus = "signedOut" | "onboarding" | "ready";

type SessionValue = {
  status: SessionStatus;
  /** Any of the login buttons "authenticates" and drops the user into onboarding. */
  signIn: () => void;
  completeOnboarding: () => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("signedOut");

  const signIn = useCallback(() => setStatus("onboarding"), []);
  const completeOnboarding = useCallback(() => setStatus("ready"), []);
  const signOut = useCallback(() => setStatus("signedOut"), []);

  const value = useMemo(
    () => ({ status, signIn, completeOnboarding, signOut }),
    [completeOnboarding, signIn, signOut, status],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used inside a SessionProvider");
  }
  return value;
}
