import { Home, ShoppingBag, Box, Settings, ClipboardList } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const ButtonBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: <Home size={18} /> },
    { name: "Shop", path: "/shop", icon: <ShoppingBag size={18} /> },
    { name: "Bulk", path: "/bulk", icon: <Box size={18} /> },
    { name: "Services", path: "/services", icon: <Settings size={18} /> },
    { name: "Orders", path: "/orders", icon: <ClipboardList size={18} /> },
  ];

  return (
    <div className="w-full bg-white dark:bg-gray-950 border-b border-slate-100 dark:border-gray-900 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 md:gap-8 h-12">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-sm font-medium whitespace-nowrap
                ${isActive 
                  ? "bg-orange-50 text-orange-600 dark:bg-orange-950/30" 
                  : "text-slate-600 dark:text-gray-400 hover:text-orange-600 hover:bg-slate-50 dark:hover:bg-gray-900"
                }`}
            >
              <span className={isActive ? "text-orange-600" : "text-slate-400"}>
                {item.icon}
              </span>
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ButtonBar;
