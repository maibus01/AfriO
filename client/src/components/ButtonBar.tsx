import { useState, useEffect } from "react";
import { Home, ShoppingBag, ClipboardList, User, LayoutDashboard } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const ButtonBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  // Sync user state on navigation to check for admin privileges
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location]);

  const isAdmin = user?.isAdmin === true || user?.role === "admin";

  // Base navigation items available to all users
  const navItems = [
    { name: "Home", path: "/", icon: <Home size={22} /> },
    { name: "Shop", path: "/shop", icon: <ShoppingBag size={22} /> },
    { name: "Orders", path: "/orders-hub", icon: <ClipboardList size={22} /> },
    { name: "Profile", path: "/profile", icon: <User size={22} /> },
  ];

  // Dynamically append the Admin tab if user matches admin flags
  if (isAdmin) {
    navItems.push({ name: "Admin", path: "/admin", icon: <LayoutDashboard size={22} /> });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-black border-t border-slate-200/80 dark:border-neutral-900 pb-safe select-none touch-manipulation [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex items-center justify-around h-16 max-w-7xl mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 transition-all relative"
            >
              {/* Premium Gold Luxury Pill Accent for active tab */}
              <div className={`flex flex-col items-center px-4 py-1 rounded-full transition-all duration-200 ${
                isActive ? "bg-amber-50 dark:bg-amber-950/30" : "bg-transparent"
              }`}>
                <span className={`transition-colors duration-200 ${
                  isActive ? "text-amber-600 dark:text-amber-500" : "text-slate-400 dark:text-neutral-500"
                }`}>
                  {item.icon}
                </span>
              </div>
              
              {/* Text Label */}
              <span className={`text-[9px] mt-1 font-bold tracking-wide uppercase transition-colors duration-200 ${
                isActive ? "text-slate-900 dark:text-amber-400 font-black" : "text-slate-400 dark:text-neutral-600"
              }`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ButtonBar;