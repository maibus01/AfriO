import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Verified, ArrowUpRight } from "lucide-react";
import API from "../api/User"; // ✅ Uses your custom Axios instance

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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="font-black text-4xl text-orange-500 animate-bounce">
          LUXEE
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/40 pb-24">
      
      {/* FLOATING NAV OVERLAY */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white/80 backdrop-blur-md text-slate-900 rounded-full shadow-lg hover:bg-white transition-all pointer-events-auto active:scale-95"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      {/* CORE DISPLAY BOX CONTAINER */}
      <div className="max-w-4xl mx-auto px-5 pt-24">
        
        {/* MEDIUM STYLE HERO HEADER */}
        <div className="mb-14 text-center md:text-left border-b border-slate-100 pb-8">
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-2 block">
            The Lookbook Directory
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">
            Curated Atelier Houses
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-xl font-medium leading-relaxed">
            Discover modern master creators, custom tailors, and premium labels. Shuffled dynamically on every visit.
          </p>
        </div>

        {/* --- SHOPS BLOCK RENDER --- */}
        {businesses.length === 0 ? (
          <div className="bg-white border border-slate-100 p-12 rounded-[2.5rem] text-center shadow-xl shadow-slate-100">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              No designer houses are active right now.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {businesses.map((shop) => (
              <div
                key={shop._id}
                onClick={() => navigate(`/business/${shop._id}/public`)}
                className="group bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(234,88,12,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col"
              >
                {/* 1. COVER PHOTO BANNER */}
                <div className="w-full h-48 md:h-64 bg-slate-100 relative overflow-hidden">
                  <img 
                    src={shop.coverImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Category Pill Floating on Banner */}
                  <span className="absolute top-6 right-6 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-900 shadow-sm">
                    {shop.category || "Couture House"}
                  </span>
                </div>

                {/* 2. BODY CONTENT AREA */}
                <div className="p-6 md:p-8 pt-0 relative flex flex-col flex-1">
                  
                  {/* OVERLAPPING AVATAR BLOCK */}
                  <div className="-mt-10 mb-4 flex items-end justify-between relative z-10">
                    {shop.logo || shop.image ? (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white p-1.5 shadow-xl ring-4 ring-white shrink-0">
                        <img 
                          src={shop.logo || shop.image} 
                          className="w-full h-full object-cover rounded-xl" 
                          alt={shop.name}
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-xl ring-4 ring-white shrink-0">
                        {shop.name ? shop.name.charAt(0).toUpperCase() : "M"}
                      </div>
                    )}

                    {/* Clean Medium-style Jump Arrow */}
                    <div className="w-10 h-10 bg-slate-50 text-slate-400 group-hover:bg-orange-600 group-hover:text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-sm mb-1">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>

                  {/* BRAND DETAILS & DESCRIPTION */}
                  <div className="space-y-2 max-w-2xl">
                    <h2 className="font-black text-slate-900 text-xl md:text-2xl tracking-tighter flex items-center gap-2 group-hover:text-orange-600 transition-colors">
                      {shop.name} 
                      <Verified size={18} className="text-blue-500 shrink-0" />
                    </h2>
                    
                    <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed line-clamp-3">
                      {shop.description || "An exclusive luxury fashion house showcasing tailored premium artistry, elegant couture, and masterfully crafted clothing garments."}
                    </p>
                  </div>

                  {/* INTERACTIVE METADATA FOOTER */}
                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wide">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="uppercase font-black text-slate-500">Verified Seller</span>
                    </div>
                    <span className="text-slate-300 font-normal">Click to discover lookbook</span>
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
