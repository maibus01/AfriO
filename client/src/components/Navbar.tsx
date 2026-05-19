import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Search, LogOut, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync user state on navigation
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    setIsDropdownOpen(false);
    navigate("/auth");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigates to search results page with query param
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isAdmin = user?.isAdmin === true || user?.role === "admin";

  return (
    <nav className="sticky top-0 z-[100] bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-slate-100 dark:border-gray-900 transition-all">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4">

        {/* BRAND LOGO */}
        <Link to="/" className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1 group shrink-0">
          <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent group-hover:opacity-90">
            Luxee
          </span>
          <span className="text-slate-800 dark:text-slate-200">Hub</span>
          <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></div>
        </Link>

        {/* CENTERED SEARCH BAR */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="hidden sm:flex items-center flex-1 max-w-md mx-auto relative group"
        >
          <input
            type="text"
            placeholder="Search for premium experiences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
          <button 
            type="submit" 
            className="absolute left-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors"
          >
            <Search size={18} />
          </button>
        </form>

        {/* ACTIONS CONTAINER */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">

          {/* MOBILE SEARCH ICON (Only shows when screen is small) */}
          <button 
            onClick={() => navigate('/')} 
            className="sm:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
          >
            <Search size={20} />
          </button>

          {/* BUSINESS BUTTON - Commented out per request */}
          {/* 
          {user && (
            <button 
              onClick={() => navigate('/business')} 
              className="flex items-center gap-1.5 px-2 md:px-3 py-2 text-[12px] md:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <Briefcase size={18} className="text-orange-600" />
              <span className="hidden xs:block">Business</span>
            </button>
          )} 
          */}

          {/* ADMIN ACTION */}
          {isAdmin && (
            <button 
              onClick={() => navigate('/admin')} 
              className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900"
            >
              <LayoutDashboard size={16} />
              <span className="hidden md:block">Admin</span>
            </button>
          )}

          {/* AUTH SECTION */}
          {!user ? (
            <Link 
              to="/auth" 
              className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-full text-xs font-bold hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all"
            >
              Login
            </Link>
          ) : (
            /* ZAIN-STYLE PROFILE DROPDOWN */
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-9 h-9 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-full flex items-center justify-center text-white text-xs font-black ring-2 ring-white dark:ring-gray-950 shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                {user.name?.[0].toUpperCase() || "U"}
              </button>

              {/* Dropdown Menu Container */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-150">
                  
                  {/* Quick User Greeting Header */}
                  <div className="px-4 py-2 border-b border-slate-50 dark:border-gray-800 mb-1">
                    <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{user.name || "User"}</p>
                  </div>

                  {/* Option 1: Profile */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800/60 transition-colors text-left"
                  >
                    <User size={16} className="text-slate-400" />
                    My Profile
                  </button>

                  {/* Option 2: Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>

                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
