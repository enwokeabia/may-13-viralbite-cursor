import InfluencerSidebar from "./InfluencerSidebar";

export default function InfluencerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <InfluencerSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
} 