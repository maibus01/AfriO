import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Verified, ExternalLink } from "lucide-react";
import axios from "axios";

const API = "https://afrio-api.onrender.com/api";

export default function Shops() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndShuffleShops = async () => {
      try {
        const res = await axios.get(`${API}/business`);
        const fetchedData = res.data.data || [];

        // Fisher-Yates Shuffle Algorithm to randomize shops on every fresh load
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
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-bounce font-black text-2xl text-slate-200 tracking-tighter">
          AFRIO...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 pb-32">
      
      {/* --- FLOATING NAVIGATION --- */}
      <nav className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white/80 backdrop-blur-md text-slate-900 rounded-full shadow-xl pointer-events-auto active:scale-90 transition-transform"
        >
          <ArrowLeft size={22} />
        </button>
      </nav>

      {/* --- CONTENT CONTAINER --- */}
      <div className="max-w-3xl mx-auto pt-24 px-5">
        
        {/* BRAND HEADER SECTION */}
        <div className="mb-10 text-center md:text-left">
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-2 block">
            Exclusive Network
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">
            Explore Houses
          </h1>
          <p className="text-slate-500 text-sm max-w-md font-medium">
            Browse through master artisans and premium storefronts, shuffled dynamically upon every visit.
          </p>
        </div>

        {/* --- SHOPS GRID / LIST --- */}
        {businesses.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              No brand sellers found at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map((shop) => (
              <div 
                key={shop._id}
                onClick={() => navigate(`/business/${shop._id}/public`)}
                className="flex items-center gap-3 p-5 bg-white border border-slate-100 rounded-3xl cursor-pointer hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-200/40 active:scale-[0.99] transition-all"
              >
                {/* Seller Logo Container (Matches Mini Card Style) */}
                {shop.logo || shop.image ? (
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0">
                    <img 
                      src={shop.logo || shop.image} 
                      className="w-full h-full object-cover" 
                      alt={shop.name}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0">
                    {shop.name ? shop.name.charAt(0).toUpperCase() : "M"}
                  </div>
                )}

                {/* Seller Info Segment */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-900 text-base flex items-center gap-1.5 truncate">
                    {shop.name} 
                    <Verified size={14} className="text-blue-500 shrink-0" />
                  </h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">
                    {shop.category || "Master Artisan"}
                  </p>
                </div>

                {/* Navigation External Icon Link Indicator */}
                <div className="p-2 bg-slate-50 dark:bg-gray-900 rounded-xl text-slate-400 group-hover:text-slate-900 transition-colors shrink-0">
                  <ExternalLink size={16} className="text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
