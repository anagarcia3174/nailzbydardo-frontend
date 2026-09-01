export interface LoginRequest {
  email: string;
  password: string;
}

export interface MeResponse {
  authenticated: boolean;
}
