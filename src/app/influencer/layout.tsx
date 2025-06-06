import InfluencerSidebar from "./InfluencerSidebar";
import MobileNav from "../components/MobileNav";

export default function InfluencerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="min-h-screen flex bg-gray-50">
        <InfluencerSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
      <MobileNav />
    </>
  );
} 