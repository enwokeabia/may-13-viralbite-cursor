import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-row bg-white">
      <AdminSidebar />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {children}
      </div>
    </main>
  );
} 