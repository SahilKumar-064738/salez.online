import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { loginUser, signupUser, fetchMe, logoutUser, AuthUser } from "@/services/auth";
import { useLocation } from "wouter";

export function useAuth() {
  return useQuery<AuthUser | null>({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useLogin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => loginUser(email, password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast({ title: "Welcome back!", description: "Redirecting to dashboard…" });
      setTimeout(() => setLocation("/dashboard"), 800);
    },
    onError: (e: Error) => {
      toast({ variant: "destructive", title: "Login failed", description: e.message });
    },
  });
}

export function useSignup() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: (data: { name: string; companyName: string; email: string; password: string }) => signupUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast({ title: "Account created!", description: "Redirecting to dashboard…" });
      setTimeout(() => setLocation("/dashboard"), 800);
    },
    onError: (e: Error) => {
      toast({ variant: "destructive", title: "Signup failed", description: e.message });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast({ title: "Logged out", description: "See you next time!" });
      setLocation("/auth/login");
    },
  });
}
