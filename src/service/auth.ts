import type {
  AdminUser,
  AuthResponse,
  LoginInput,
  LogoutResponse,
} from "@/features/booking/types/auth.types";
import { api } from "@/lib/axios";

export const authService = {
  login: async (input: LoginInput): Promise<AdminUser> => {
    await api.post<AuthResponse>("/auth/login", input);
    const response = await api.get<AuthResponse>("/auth/me");
    return response.data.user;
  },

  getCurrentUser: async (): Promise<AdminUser> => {
    const response = await api.get<AuthResponse>("/auth/me");
    return response.data.user;
  },

  logout: async (): Promise<void> => {
    await api.post<LogoutResponse>("/auth/logout");
  },
};