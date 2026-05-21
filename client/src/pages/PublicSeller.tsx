import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingBag, Sparkles, ArrowLeft, Share2, Info } from "lucide-react";
import axios from "axios";
import PublicBusinessHero from "../components/PublicBusinessHero";

const API = "https://afrio-api.onrender.com/api";

export default function PublicSeller() {
  const { businessId } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!businessId) return;
      try {
        // Load business first so the UI shows up
        const b = await axios.get(`${API}/business/${businessId}/public`);
        setBusiness(b.data.data);
        setLoading(false);

        // Load content in the background
        axios.get(`${API}/products/business/${businessId}`).then(res => setProducts(res.data.data || []));
        axios.get(`${API}/styles/business/${businessId}`).then(res => setStyles(res.data.data || []));
      } catch (err) {
        console.log("Public seller error:", err);
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo(0, 0);
  }, [businessId]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-slate-200 animate-pulse tracking-widest text-3xl">
      AFRIO
    </div>
  );
  
  if (!business) return <div className="p-20 text-center font-bold">Seller not found</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      {/* HEADER NAV */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/20 backdrop-blur-xl text-white rounded-full pointer-events-auto shadow-lg border border-white/20">
          <ArrowLeft size={22} />
        </button>
        <button className="p-3 bg-white/20 backdrop-blur-xl text-white rounded-full pointer-events-auto shadow-lg border border-white/20">
          <Share2 size={20} />
        </button>
      </div>

      {/* HERO SECTION */}
      <PublicBusinessHero business={business} />

      <div className="max-w-6xl mx-auto px-5 py-10 space-y-16">

        {/* ================= PRODUCTS (READY TO WEAR) ================= */}
        {products.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-100 text-orange-600 rounded-2xl">
                    <ShoppingBag size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Buy</h2>
               </div>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{products.length} Items</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {products.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                    <img
                      src={p.images?.[0]}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  <div className="mt-4 px-2">
                    <h3 className="font-bold text-slate-800 text-sm truncate uppercase tracking-tight">
                      {p.name}
                    </h3>
                    <p className="text-orange-600 font-black text-lg mt-0.5">
                      ₦{p.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STYLES (LOOKBOOK) ================= */}
        {styles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 text-purple-600 rounded-2xl">
                    <Sparkles size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Style Lookbook</h2>
               </div>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{styles.length} Looks</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {styles.map((s) => (
                <div
                  key={s._id}
                  onClick={() => navigate(`/style/${s._id}`)}
                  className="relative aspect-[3/4] rounded-[3rem] overflow-hidden cursor-pointer group shadow-lg"
                >
                  <img
                    src={s.image}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[10px] text-orange-400 font-black uppercase tracking-[0.2em] mb-1">
                      {s.category || "Couture"}
                    </p>
                    <h3 className="text-white font-bold text-lg leading-tight group-hover:text-orange-200 transition-colors">
                      {s.title}
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
        {products.length === 0 && styles.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">This seller hasn't posted any items yet.</p>
          </div>
        )}

      </div>
    </div>
  );
}