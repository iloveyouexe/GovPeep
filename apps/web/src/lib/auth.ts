import { createContext, useContext } from "react";
import type { PublicConfig, User } from "@govpeep/contracts";
export const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  error: string;
  config: PublicConfig | null;
  refresh: () => void;
}>({
  user: null,
  loading: true,
  error: "",
  config: null,
  refresh: () => {},
});
export const useAuth = () => useContext(AuthContext);
