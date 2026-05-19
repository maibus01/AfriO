import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Star, MapPin, ArrowRight } from "lucide-react";
import axios from "axios";

const API = "https://afrio-api.onrender.com/api";

export default function Shops() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndShuffleShops = async () => {
      try {
        // Fetch your global list of businesses
        const res = await axios.get(`${API}/business`);
        const fetchedData = res.data.data || [];

        // Fisher-Yates Shuffle Algorithm to randomize shops on every load
        const shuffled = [...fetchedData];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setBusinesses(shuffled);
      } catch (err) {
        console.error("Error loading shops:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndShuffleShops();
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950/50 py-16 px-5 max-w-7xl mx-auto">
        <div className="h-8 bg-slate-200 dark:bg-gray-800 rounded-lg w-48 mb-4 animate-pulse" />
        <div className="h-4 bg-slate-100 dark:bg-gray-900 rounded-lg w-72 mb-12 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950/50 pb-24">
      
      {/* HEADER HERO BANNER */}
      <div className="bg-white dark:bg-gray-900 border-b border-slate-100 dark:border-gray-800 py-12 px-5 mb-12">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-black tracking-widest text-orange-600 uppercase block mb-2">
            Discover Creators
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">LuxeeHub</span> Shops
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base max-w-xl">
            Meet extraordinary local designers and premium storefronts, shuffled dynamically every time you look.
          </p>
        </div>
      </div>

      {/* SHOPS GRID */}
      <div className="max-w-7xl mx-auto px-5">
        {businesses.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No businesses found matching this query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {businesses.map((shop) => (
              <div
                key={shop._id}
                onClick={() => navigate(`/business/${shop._id}/public`)}
                className="group bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-gray-800/80 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col relative"
              >
                {/* Shop Banner Header */}
                <div className="h-32 w-full bg-slate-100 dark:bg-gray-800 relative overflow-hidden">
                  <img
                    src={shop.coverImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop"}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Content Details Block */}
                <div className="p-6 pt-0 relative flex-1 flex flex-col">
                  
                  {/* Floating Left Logo Layout */}
                  <div className="-mt-10 mb-4 flex items-end justify-between">
                    <div className="w-20 h-20 bg-white dark:bg-gray-950 p-1.5 rounded-2xl shadow-md ring-4 ring-white dark:ring-gray-900 overflow-hidden">
                      <img
                        src={shop.logo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"}
                        className="w-full h-full object-cover rounded-xl"
                        alt={shop.name}
                      />
                    </div>
                    
                    {/* Premium Label Badge */}
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 border border-orange-100/50 dark:border-transparent">
                      {shop.category || "Designer"}
                    </span>
                  </div>

                  {/* Text Descriptors */}
                  <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {shop.name}
                  </h3>

                  <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-1 line-clamp-2 min-h-[2rem]">
                    {shop.description || "No luxury bio provided yet by this exclusive partner house."}
                  </p>

                  <div className="mt-6 pt-4 border-t border-slate-50 dark:border-gray-800/60 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 w-full static bottom-0">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-slate-300" />
                      <span>{shop.address || "Global"}</span>
                    </div>
                    
                    {/* Beautiful Hover Action Button Trigger */}
                    <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform">
                      View Shop <ArrowRight size={14} />
                    </span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
