import { useEffect, useState } from "react";
import { Search, Sparkles, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const API = "https://afrio-api.onrender.com/api";

// ================= TYPES =================
interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  category?: string;
  businessId?: {
    _id: string;
    name: string;
  };
}

interface Style {
  _id: string;
  title: string;
  image: string;
  category?: string;
}

export default function HomePage() {
  const [tab, setTab] = useState<"products" | "styles">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  // 1. FETCH DATA & HANDLE TAB NAVIGATION
  useEffect(() => {
    // If user came from "Browse Styles" button in Profile
    if (location.state && (location.state as any).targetTab) {
      setTab((location.state as any).targetTab);
      // Clear state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [pRes, sRes] = await Promise.all([
          fetch(`${API}/products`).then((r) => r.json()),
          fetch(`${API}/styles`).then((r) => r.json()),
        ]);
        setProducts(pRes.data || []);
        setStyles(sRes.data || []);
      } catch (e) {
        console.error("Home Data Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.state]);

  // 2. FILTER LOGIC
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredStyles = styles.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-950 pb-20">
      
      {/* --- HERO SECTION --- */}
      <section className="px-6 pt-16 pb-12 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
          <Sparkles size={14} /> The Future of African Tailoring
        </div>
        <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[0.9]">
          Design Your <span className="text-orange-600 italic font-serif">Identity.</span>
        </h2>
        
        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'products' ? "Search fabrics & ready-to-wear..." : "Search bespoke styles & trends..."}
            className="w-full bg-white dark:bg-gray-900 border-none h-20 pl-16 pr-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 dark:shadow-none text-lg font-medium focus:ring-4 focus:ring-orange-500/10 transition-all outline-none transition-all"
          />
        </div>
      </section>

      {/* --- TAB NAVIGATION --- */}
      <nav className="flex justify-center mb-12 sticky top-5 z-30">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-2 rounded-[2.5rem] flex gap-2 shadow-xl shadow-slate-200/40 border border-white/50 dark:border-gray-800">
          <button 
            onClick={() => setTab("products")}
            className={`flex items-center gap-2 px-10 py-4 rounded-[2.2rem] text-xs font-black uppercase tracking-widest transition-all ${
              tab === 'products' 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShoppingBag size={16} /> Marketplace
          </button>
          <button 
            onClick={() => setTab("styles")}
            className={`flex items-center gap-2 px-10 py-4 rounded-[2.2rem] text-xs font-black uppercase tracking-widest transition-all ${
              tab === 'styles' 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles size={16} /> Inspiration
          </button>
        </div>
      </nav>

      {/* --- GRID CONTENT --- */}
      <section className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="flex flex-col items-center py-32 space-y-4">
            <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Curating for you</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {tab === "products" 
              ? filteredProducts.map(p => (
                  <div key={p._id} onClick={() => navigate(`/product/${p._id}`)} className="group cursor-pointer">
                    <div className="aspect-[4/5] bg-white dark:bg-gray-900 rounded-[2.8rem] overflow-hidden border border-slate-100 dark:border-gray-800 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                      <img 
                        src={p.images?.[0]} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={p.name}
                      />
                    </div>
                    <div className="mt-4 px-3">
                      <h3 className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">{p.businessId?.name || 'AfriO Member'}</h3>
                      <p className="font-bold text-slate-900 dark:text-white truncate text-base leading-tight">{p.name}</p>
                      <p className="text-slate-400 font-bold mt-1 text-sm">₦{p.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              : filteredStyles.map(s => (
                  <div 
                    key={s._id} 
                    onClick={() => navigate(`/style/${s._id}`)} 
                    className="relative aspect-[3/4] rounded-[3rem] overflow-hidden cursor-pointer group shadow-xl shadow-slate-200/50 dark:shadow-none"
                  >
                    <img 
                      src={s.image} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      alt={s.title}
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
                    
                    <div className="absolute bottom-7 left-7 right-7">
                       <p className="text-[9px] text-orange-400 font-black uppercase mb-2 tracking-[0.2em]">{s.category || 'Bespoke'}</p>
                       <h3 className="text-white font-bold text-xl leading-tight mb-4">{s.title}</h3>
                       <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                          Request Custom <ArrowRight size={14} />
                       </div>
                    </div>
                  </div>
                ))
            }
          </div>
        )}

        {!loading && (tab === "products" ? filteredProducts : filteredStyles).length === 0 && (
          <div className="text-center py-40">
            <p className="text-slate-300 font-bold italic text-xl">No matches found for "{search}"</p>
          </div>
        )}
      </section>
    </main>
  );
}