import { Home, ShoppingBag, Box, Settings, ClipboardList } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const ButtonBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: <Home size={22} /> },
    { name: "Shop", path: "/shop", icon: <ShoppingBag size={22} /> },
    { name: "Bulk", path: "/bulk", icon: <Box size={22} /> },
    { name: "Services", path: "/services", icon: <Settings size={22} /> },
    { name: "Orders", path: "/orders", icon: <ClipboardList size={22} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-gray-950 border-t border-slate-200 dark:border-gray-800 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 transition-all relative"
            >
              {/* WhatsApp-style pill highlight for active tab */}
              <div className={`flex flex-col items-center px-5 py-1 rounded-full transition-all ${
                isActive ? "bg-orange-100 dark:bg-orange-900/40" : ""
              }`}>
                <span className={`${
                  isActive ? "text-orange-600 dark:text-orange-500" : "text-slate-500 dark:text-gray-400"
                }`}>
                  {item.icon}
                </span>
              </div>
              
              {/* Text Label */}
              <span className={`text-[10px] mt-1 font-medium ${
                isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-gray-500"
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
