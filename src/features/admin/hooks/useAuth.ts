import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginInput } from "../../booking/types/auth.types";
import { authService } from "@/service/auth";

export const currentAdminQueryKey = ["auth", "me"] as const;

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (user) => {
      queryClient.setQueryData(currentAdminQueryKey, user);
    },
  }); 
};

export const useCurrentAdmin = () =>
  useQuery({
    queryKey: currentAdminQueryKey,
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 60_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: currentAdminQueryKey,
      });
    },
  });
};
