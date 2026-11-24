import { useContext } from "react";
import { SessionContext } from "../auth/session-context";
export function useAuth() {
  return useContext(SessionContext);
}
