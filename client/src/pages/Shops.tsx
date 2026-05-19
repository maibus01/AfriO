import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Verified, ExternalLink } from "lucide-react";
import API from "../api/User"; // ✅ Uses your custom Axios instance

export default function Shops() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndShuffleShops = async () => {
      try {
        // 💥 Hits the brand new route fetching ALL public businesses across the system
        const res = await API.get("/business/public");
        const fetchedData = res.data.data || [];

        // Fisher-Yates Shuffle Algorithm to randomize shops on every fresh page load
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
    <main className="min-h-screen bg-white pb-20">
      
      {/* FLOATING NAV OVERLAY */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-black/30 backdrop-blur-md text-white rounded-full hover:bg-black/50 transition-all pointer-events-auto"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* CORE DISPLAY BOX CONTAINER */}
      <div className="max-w-3xl mx-auto px-5 pt-24">
        
        {/* HEADER */}
        <div className="mb-10 pl-2">
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-2 block">
            Exclusive Network
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">
            Our Designers
          </h1>
          <p className="text-slate-500 text-sm max-w-sm font-medium">
            Explore authentic profiles from modern master tailors, mixed randomly upon each visit.
          </p>
        </div>

        {/* --- SHOPS BLOCK RENDER --- */}
        {businesses.length === 0 ? (
          <div className="bg-slate-50 border-2 border-slate-100 p-12 rounded-[2.5rem] text-center">
            <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              No designer houses are active right now.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {businesses.map((shop) => (
              <div
                key={shop._id}
                onClick={() => navigate(`/business/${shop._id}/public`)}
                className="p-5 bg-white border-2 border-slate-50 rounded-[2rem] flex items-center gap-4 cursor-pointer hover:border-orange-100 hover:bg-orange-50/30 transition-all shadow-sm"
              >
                {/* Logo Image or Initials Avatar Box */}
                {shop.logo || shop.image ? (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shadow-xl shrink-0">
                    <img 
                      src={shop.logo || shop.image} 
                      className="w-full h-full object-cover" 
                      alt={shop.name}
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-white shadow-xl shrink-0">
                    {shop.name ? shop.name.charAt(0).toUpperCase() : "M"}
                  </div>
                )}

                {/* Info Text Content Segment (Tailor Card UI) */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-lg flex items-center gap-1 truncate">
                    {shop.name} <Verified size={16} className="text-blue-500 shrink-0" />
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                    {shop.category || "Master Tailor Profile"}
                  </p>
                </div>

                {/* External Action Indicator Link */}
                <div className="shrink-0 pr-1 text-slate-200">
                  <ExternalLink size={20} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
