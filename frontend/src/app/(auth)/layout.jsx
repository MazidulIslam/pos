import { GuestGuard } from "@/components/auth/GuestGuard";

export default function AuthLayout({ children }) {
  return <GuestGuard>{children}</GuestGuard>;
}
