import { Sidebar } from "@/components/layouts/Sidebar";
import { Header } from "@/components/layouts/Header";
import { MainContent } from "@/components/layouts/MainContent";
import { SidebarProvider } from "@/components/layouts/SidebarContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import LicenseBanner from "@/components/common/LicenseBanner";

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <LicenseBanner />
            <Header />
            <MainContent>{children}</MainContent>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
