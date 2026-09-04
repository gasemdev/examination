export type AuthUser = {
  id: number | string;
  email: string;
  username?: string | null;
  name: string;
  roles: string[];
};

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: AuthUser | null) => void;
  fetchMe: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
};
