import RestaurantSidebar from "./RestaurantSidebar";

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-row bg-white">
      <RestaurantSidebar />
      <div className="flex-1 flex flex-col items-center justify-center">
        {children}
      </div>
    </main>
  );
} 