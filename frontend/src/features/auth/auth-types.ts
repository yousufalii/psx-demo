export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  emailVerifiedAt: string | null;
}

export interface AuthResponse {
  user: AuthUser;
}
