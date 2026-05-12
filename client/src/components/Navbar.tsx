import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Search, LogOut, LayoutDashboard, Briefcase } from "lucide-react";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/auth");
  };

  // HELPER LOGIC: Check if admin
  // Change 'user.isAdmin' to 'user.role === "admin"' if your database uses roles
  const isAdmin = user?.isAdmin === true || user?.role === "admin";

  return (
    <nav className="sticky top-0 z-[100] bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl border-b border-slate-100 dark:border-gray-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        
        {/* BRAND LOGO */}
        <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-1">
          <span className="text-orange-600">Luxee</span>Hub
          <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-2"></div>
        </Link>

        {/* ACTIONS CONTAINER */}
        <div className="flex items-center gap-1 md:gap-3">
          
          {/* SEARCH (Always visible) */}
          <button 
            onClick={() => navigate('/')} 
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
          >
            <Search size={20} />
          </button>

          {/* BUSINESS - Visible to all logged-in users on all screens */}
          {user && (
            <button 
              onClick={() => navigate('/business')} 
              className="flex items-center gap-1.5 px-2 md:px-3 py-2 text-[12px] md:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <Briefcase size={18} className="text-orange-600" />
              <span className="hidden xs:block">Business</span>
            </button>
          )}

          {/* ADMIN - Strictly for admins */}
          {isAdmin && (
            <button 
              onClick={() => navigate('/admin')} 
              className="flex items-center gap-1.5 px-2 md:px-3 py-2 text-[12px] md:text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all border border-blue-100"
            >
              <LayoutDashboard size={18} />
              <span className="hidden xs:block">Admin</span>
            </button>
          )}

          {/* AUTH SECTION */}
          {!user ? (
            <Link 
              to="/auth" 
              className="ml-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-all"
            >
              Login
            </Link>
          ) : (
            <div className="flex items-center gap-2 md:gap-4 ml-2 border-l pl-2 border-slate-200">
              {/* Profile Avatar */}
              <button 
                onClick={() => navigate('/profile')}
                className="w-8 h-8 md:w-9 md:h-9 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-black ring-2 ring-white shadow-sm"
              >
                {user.name?.[0].toUpperCase() || "U"}
              </button>

              {/* Logout */}
              <button 
                onClick={handleLogout}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;