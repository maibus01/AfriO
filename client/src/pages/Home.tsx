import { useEffect, useState } from "react";
import { Search, Sparkles, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import ButtonBar from "../components/ButtonBar";

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

  useEffect(() => {
    if (location.state && (location.state as any).targetTab) {
      setTab((location.state as any).targetTab);
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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredStyles = styles.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-slate-50 antialiased selection:bg-orange-500 selection:text-white flex flex-col justify-between">
      
      {/* GLOBAL BACKGROUND DESIGN ACCENTS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-orange-500/5 via-transparent to-transparent pointer-events-none blur-3xl z-0" />

      {/* MAIN CONTAINER */}
      <main className="relative flex-grow max-w-7xl w-full mx-auto px-4 pt-12 pb-16 z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-orange-200/30">
            <Sparkles size={12} className="animate-pulse" /> The Future of African Tailoring
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-[1.1] md:leading-[0.95]">
            Design Your <span className="text-orange-600 italic font-serif font-normal block sm:inline">Identity.</span>
          </h1>

          {/* Search Bar Wrapper */}
          <div className="relative group max-w-xl mx-auto mt-8">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === 'products' ? "Search fabrics..." : "Search styles..."}
              className="w-full bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800/80 h-14 md:h-16 pl-14 pr-6 rounded-2xl shadow-md shadow-slate-200/40 dark:shadow-none text-sm md:text-base font-medium focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
            />
          </div>
        </section>

        {/* --- STICKY TAB NAVIGATION --- */}
        <nav className="flex justify-center mb-12 sticky top-4 z-40">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-1.5 rounded-2xl flex gap-1.5 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/50 dark:border-gray-800">
            <button 
              onClick={() => setTab("products")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                tab === 'products' 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <ShoppingBag size={14} /> 
              <span>Marketplace</span>
            </button>
            <button 
              onClick={() => setTab("styles")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                tab === 'styles' 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Sparkles size={14} /> 
              <span>Inspiration</span>
            </button>
          </div>
        </nav>

        {/* --- GRID CONTENT --- */}
        <section>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Curating for you</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {tab === "products" 
                ? filteredProducts.map(p => (
                    <div 
                      key={p._id} 
                      onClick={() => navigate(`/product/${p._id}`)} 
                      className="group cursor-pointer flex flex-col h-full"
                    >
                      <div className="aspect-[4/5] w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-gray-800 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                        <img 
                          src={p.images?.[0]} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          alt={p.name}
                          loading="lazy"
                        />
                      </div>
                      <div className="mt-3 px-1 flex flex-col flex-grow">
                        <h3 className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1 truncate">
                          {p.businessId?.name || 'AfriO Member'}
                        </h3>
                        <p className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 text-sm md:text-base mb-0.5">
                          {p.name}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 font-extrabold mt-auto text-xs">
                          ₦{p.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                : filteredStyles.map(s => (
                    <div 
                      key={s._id} 
                      onClick={() => navigate(`/style/${s._id}`)} 
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group shadow-md transition-all duration-300 group-hover:-translate-y-1"
                    >
                      <img 
                        src={s.image} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                        alt={s.title}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent transition-opacity duration-300 opacity-90 group-hover:opacity-95" />

                      {/* Style Card Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
                         <p className="text-[8px] text-orange-400 font-black uppercase mb-1 tracking-widest">{s.category || 'Bespoke'}</p>
                         <h3 className="text-white font-bold text-sm md:text-lg leading-snug mb-3 line-clamp-2">{s.title}</h3>
                         <div className="flex items-center gap-1.5 text-white/70 text-[9px] font-black uppercase tracking-widest group-hover:text-white transition-colors">
                           Custom <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                         </div>
                      </div>
                    </div>
                  ))
              }
            </div>
          )}

          {!loading && (tab === "products" ? filteredProducts : filteredStyles).length === 0 && (
            <div className="text-center py-24 border border-dashed border-slate-200 dark:border-gray-800 rounded-3xl">
              <p className="text-slate-400 dark:text-slate-600 font-medium italic">No matches found for your search.</p>
            </div>
          )}
        </section>
      </main>

      {/* --- HOME-ONLY BOTTOM NAVBAR --- */}
      <footer className="w-full bg-white dark:bg-gray-900 border-t border-slate-200/60 dark:border-gray-800/80 z-20 mt-auto">
        <ButtonBar />
      </footer>

    </div>
  );
}
