import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingBag, Sparkles, ArrowLeft, Share2, Info } from "lucide-react";
import axios from "axios";
import PublicBusinessHero from "../components/PublicBusinessHero";

// Standardized API path lookup matching ProductDetails configuration
const API = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  : "https://afrio-api.onrender.com/api";

export default function PublicSeller() {
  // Destructured with a fallback for routers using ":id" instead of ":businessId"
  const { id, businessId: routeBusinessId } = useParams<{ id?: string; businessId?: string }>();
  const targetBusinessId = routeBusinessId || id;
  
  const navigate = useNavigate();

  const [business, setBusiness] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetBusinessId || targetBusinessId === "undefined") return;

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch core business metadata 
        const b = await axios.get(`${API}/business/${targetBusinessId}/public`);
        
        // Safeguard path extraction if backend passes flat objects vs wrapped datasets
        const businessData = b.data?.data || b.data;
        setBusiness(businessData);
        setLoading(false);

        // Fetch secondary collections concurrently in background threads
        const [prodRes, styleRes] = await Promise.all([
          axios.get(`${API}/products/business/${targetBusinessId}`),
          axios.get(`${API}/styles/business/${targetBusinessId}`)
        ]);

        setProducts(prodRes.data?.data || prodRes.data || []);
        setStyles(styleRes.data?.data || styleRes.data || []);
      } catch (err) {
        console.error("Public seller data loading error:", err);
        setLoading(false);
      }
    };

    loadData();
    window.scrollTo(0, 0);
  }, [targetBusinessId]);

  /* --- BRAND LOGO MATCHED SHIMMER SYSTEM --- */
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-black flex flex-col justify-start items-center animate-pulse">
        <div className="w-full h-64 bg-slate-200 dark:bg-neutral-900 border-b border-slate-100 dark:border-neutral-800" />
        <div className="w-full max-w-6xl mx-auto px-5 py-10 space-y-16">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 dark:bg-amber-500/5 rounded-2xl" />
                <div className="h-6 w-20 bg-slate-200 dark:bg-neutral-900 rounded-lg" />
              </div>
              <div className="h-4 w-16 bg-slate-200 dark:bg-neutral-900 rounded" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="w-full aspect-square bg-slate-200 dark:bg-neutral-900 rounded-[2.5rem]" />
                  <div className="px-2 space-y-2">
                    <div className="h-3 w-full bg-slate-200 dark:bg-neutral-900 rounded" />
                    <div className="h-4 w-24 bg-amber-500/15 dark:bg-amber-500/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!business) {
    return (
      <div className="p-20 text-center font-bold text-slate-700 dark:text-neutral-300">
        Seller profile not found
      </div>
    );
  }

  const hasContent = products.length > 0 || styles.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-100 pb-20 select-none">
      
      {/* HEADER NAV */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white/20 backdrop-blur-xl text-white rounded-full pointer-events-auto shadow-lg border border-white/20 active:scale-95 transition-transform"
        >
          <ArrowLeft size={22} />
        </button>
        <button className="p-3 bg-white/20 backdrop-blur-xl text-white rounded-full pointer-events-auto shadow-lg border border-white/20 active:scale-95 transition-transform">
          <Share2 size={20} />
        </button>
      </div>

      {/* HERO SECTION */}
      <PublicBusinessHero business={business} />

      <div className="max-w-6xl mx-auto px-5 py-10 space-y-16">

        {/* ================= PRODUCTS (BUY FEED) ================= */}
        {products.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 dark:bg-neutral-900 text-amber-600 dark:text-amber-500 rounded-2xl border border-transparent dark:border-neutral-800">
                    <ShoppingBag size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight uppercase">Buy</h2>
               </div>
               <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">{products.length} Items</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {products.map((p) => {
                // FORCE ASSIGNMENT: Logical OR guarantees null, undefined, or strings fallback to 0 safely
                const rawPrice = p?.basePrice || p?.price || 0;
                const displayedPrice = typeof rawPrice === "number" ? rawPrice : parseFloat(rawPrice) || 0;

                return (
                  <div
                    key={p?._id || Math.random().toString()}
                    onClick={() => p?._id && navigate(`/product/${p._id}`)}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-square bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-slate-200/60 dark:border-neutral-800/80 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                      <img
                        src={p?.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"}
                        alt={p?.name || "Product Item"}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>

                    <div className="mt-4 px-2">
                      <h3 className="font-bold text-slate-800 dark:text-neutral-200 text-sm truncate uppercase tracking-tight">
                        {p?.name || "Unnamed Item"}
                      </h3>
                      <p className="text-amber-600 dark:text-amber-500 font-black text-lg mt-0.5">
                        ₦{displayedPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STYLES (LOOKBOOK) ================= */}
        {styles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 dark:bg-neutral-900 text-purple-600 dark:text-purple-500 rounded-2xl border border-transparent dark:border-neutral-800">
                    <Sparkles size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight uppercase">Style Lookbook</h2>
               </div>
               <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">{styles.length} Looks</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {styles.map((s) => (
                <div
                  key={s?._id || Math.random().toString()}
                  onClick={() => s?._id && navigate(`/style/${s._id}`)}
                  className="relative aspect-[3/4] rounded-[3rem] overflow-hidden cursor-pointer group shadow-lg"
                >
                  <img
                    src={s?.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"}
                    alt={s?.title || "Style lookbook item"}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] mb-1">
                      {s?.category || "Couture"}
                    </p>
                    <h3 className="text-white font-bold text-lg leading-tight group-hover:text-amber-200 transition-colors">
                      {s?.title || "Untitled Look"}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-white/50 font-bold uppercase">
                       <Info size={10} /> View details
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!hasContent && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-neutral-800">
              <ShoppingBag className="text-slate-300 dark:text-neutral-700" size={32} />
            </div>
            <p className="text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-widest text-xs">
              This seller hasn't posted any items yet.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}