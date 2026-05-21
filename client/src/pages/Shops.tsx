import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Verified, ArrowUpRight } from "lucide-react";
import API from "../api/User";

export default function Shops() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndShuffleShops = async () => {
      try {
        const res = await API.get("/business/public");
        const fetchedData = res.data.data || [];

        // Fisher-Yates Shuffle Algorithm to randomize shops on every single fresh refresh
        const shuffled = [...fetchedData];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setBusinesses(shuffled);
      } catch (err) {
        console.error("SHOPS FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndShuffleShops();
    window.scrollTo(0, 0);
  }, []);

  // MATCHES THE DESIGN SKELETON LAYOUT SYSTEM USED IN THE PROFILE MODULE
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-black flex flex-col justify-start items-center p-4 md:p-8">
        <div className="w-full max-w-4xl space-y-6 mt-16">
          {/* Header Loading Placeholder */}
          <div className="space-y-3 border-b border-slate-200/60 dark:border-neutral-800/60 pb-8">
            <div className="h-3 w-32 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-10 w-2/3 md:w-1/2 bg-slate-300 dark:bg-neutral-800 rounded-xl animate-pulse" />
            <div className="h-4 w-3/4 md:w-1/3 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
          {/* Responsive Cards Grid Layout Shimmer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/60 dark:border-neutral-800/80 p-1 animate-pulse space-y-4">
                <div className="h-44 w-full bg-slate-200 dark:bg-neutral-800/80 rounded-t-xl" />
                <div className="px-4 pb-4 space-y-2">
                  <div className="h-4 w-1/3 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-3 w-full bg-slate-100 dark:bg-neutral-800/60 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-100 pb-24 select-none">
      
      {/* FIXED NAV OVERLAY */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-slate-900 dark:text-white rounded-full shadow-lg border border-slate-200/40 dark:border-neutral-800/80 hover:scale-105 transition-all pointer-events-auto active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* CORE DISPLAY BOX CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24">
        
        {/* MEDIUM STYLE HERO HEADER */}
        <div className="mb-10 text-center md:text-left border-b border-slate-200/60 dark:border-neutral-800/60 pb-8">
          <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.25em] mb-2 block">
            The Lookbook Directory
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tighter leading-none mb-3 uppercase">
            Curated Atelier Houses
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 text-xs md:text-sm max-w-xl font-bold tracking-tight leading-relaxed">
            Discover modern master creators, custom tailors, and premium labels. Shuffled dynamically on every visit.
          </p>
        </div>

        {/* --- SHOPS BLOCK RENDER --- */}
        {businesses.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800/80 p-16 rounded-2xl text-center shadow-sm">
            <div className="w-14 h-14 bg-slate-50 dark:bg-neutral-800 text-slate-300 dark:text-neutral-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={24} />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
              No designer houses are active right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {businesses.map((shop) => (
              <div
                key={shop._id}
                onClick={() => navigate(`/business/${shop._id}/public`)}
                className="group bg-white dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800/80 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:border-slate-300 dark:hover:border-neutral-700 transition-all duration-300 flex flex-col relative"
              >
                {/* 1. COVER PHOTO BANNER */}
                <div className="w-full h-44 bg-slate-100 dark:bg-neutral-800 relative overflow-hidden shrink-0">
                  <img 
                    src={shop.coverImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Category Pill Floating on Banner */}
                  <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-white dark:bg-black text-slate-900 dark:text-white shadow-sm">
                    {shop.category || "Couture House"}
                  </span>
                </div>

                {/* 2. BODY CONTENT AREA */}
                <div className="p-5 pt-0 relative flex flex-col flex-1">
                  
                  {/* OVERLAPPING AVATAR BLOCK */}
                  <div className="-mt-8 mb-3 flex items-end justify-between relative z-10">
                    {shop.logo || shop.image ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 p-1 shadow-md ring-4 ring-white dark:ring-neutral-900 shrink-0 border border-slate-100 dark:border-neutral-800">
                        <img 
                          src={shop.logo || shop.image} 
                          className="w-full h-full object-cover rounded-lg" 
                          alt={shop.name}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-slate-950 dark:bg-neutral-800 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-md ring-4 ring-white dark:ring-neutral-900 shrink-0 border border-slate-800 dark:border-neutral-700">
                        {shop.name ? shop.name.charAt(0).toUpperCase() : "M"}
                      </div>
                    )}

                    {/* Action Jump Arrow */}
                    <div className="w-8 h-8 bg-slate-50 dark:bg-neutral-800 text-slate-400 dark:text-neutral-500 group-hover:bg-slate-950 dark:group-hover:bg-amber-500 group-hover:text-slate-950 rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm border border-slate-200/40 dark:border-neutral-700/50 mb-0.5">
                      <ArrowUpRight size={14} />
                    </div>
                  </div>

                  {/* BRAND DETAILS & DESCRIPTION */}
                  <div className="space-y-1.5 flex-1 flex flex-col justify-start">
                    <h2 className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-1.5 transition-colors uppercase">
                      {shop.name} 
                      <Verified size={14} className="text-blue-500 shrink-0" />
                    </h2>
                    
                    <p className="text-slate-500 dark:text-neutral-400 text-xs font-bold tracking-tight leading-relaxed line-clamp-2">
                      {shop.description || "An exclusive luxury fashion house showcasing tailored premium artistry, elegant couture, and masterfully crafted clothing garments."}
                    </p>
                  </div>

                  {/* INTERACTIVE METADATA FOOTER */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800/60 flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-slate-600 dark:text-neutral-400">Verified Seller</span>
                    </div>
                    <span className="text-slate-300 dark:text-neutral-600 font-bold normal-case tracking-normal">View lookbook</span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}