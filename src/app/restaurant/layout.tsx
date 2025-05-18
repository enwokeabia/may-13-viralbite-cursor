import RestaurantSidebar from "./RestaurantSidebar";
import RestaurantHeader from "./RestaurantHeader";
import RestaurantMobileNav from "./RestaurantMobileNav";

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for md+ screens */}
      <aside className="hidden md:block md:w-64 bg-white border-r min-h-screen fixed top-0 left-0 z-40 pt-16">
        <RestaurantSidebar />
      </aside>
      <div className="flex-1 flex flex-col md:ml-64">
        <RestaurantHeader />
        <main className="pt-16 pb-20">
          {children}
        </main>
        <RestaurantMobileNav />
      </div>
    </div>
  );
} 