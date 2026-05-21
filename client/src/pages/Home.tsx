import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ButtonBar from "../components/ButtonBar";

const API = "https://afrio-api.onrender.com/api";

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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API}/products`);
        
        // 1. Safeguard against server errors (404, 500, etc.)
        if (!response.ok) {
          throw new Error(`HTTP network error! Status: ${response.status}`);
        }

        const resData = await response.json();
        
        // 2. Safeguard against unexpected formatting/empty payloads
        const rawProducts = resData?.data || [];
        
        // --- RANDOMIZE PRODUCTS ON LOAD/REFRESH ---
        const randomized = [...rawProducts].sort(() => Math.random() - 0.5);
        
        setProducts(randomized);
      } catch (e) {
        console.error("Home Data Fetch Error:", e);
        setProducts([]); // Clear state gracefully instead of crashing the UI
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 antialiased selection:bg-amber-500 selection:text-black flex flex-col justify-between select-none touch-manipulation [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      {/* --- NATIVE FULL-WIDTH STICKY SEARCH HEADER --- */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-slate-200/60 dark:border-neutral-900 px-4 py-3.5 w-full">
        <div className="relative w-full max-w-7xl mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search premium marketplace..."
            className="w-full bg-slate-100 dark:bg-neutral-900 border border-transparent dark:border-neutral-800/60 h-11 pl-11 pr-4 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 dark:focus:bg-neutral-900 transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
          />
        </div>
      </header>

      {/* GLOBAL BACKGROUND DESIGN ACCENT */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none blur-3xl z-0" />

      {/* MAIN CONTENT AREA */}
      <main className="relative flex-grow max-w-7xl w-full mx-auto px-4 pt-4 pb-24 z-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <section>
          {loading ? (
            /* --- PREMIUM LUXURY BRAND SHIMMER SYSTEM LAYOUT --- */
            <div className="animate-pulse space-y-6">
              <div className="h-3 w-40 bg-slate-200 dark:bg-neutral-900 rounded-md" />
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 md:gap-5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="flex flex-col bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-slate-100 dark:border-neutral-900/60 p-3 space-y-3.5">
                    <div className="aspect-square w-full bg-slate-200 dark:bg-neutral-950 rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-2 w-1/3 bg-amber-500/10 dark:bg-amber-500/5 rounded" />
                      <div className="h-3 w-5/6 bg-slate-200 dark:bg-neutral-800 rounded" />
                      <div className="h-4 w-1/2 bg-slate-300 dark:bg-neutral-800 rounded-md pt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 md:gap-5">
              {filteredProducts.map(p => (
                <div 
                  key={p._id} 
                  onClick={() => navigate(`/product/${p._id}`)} 
                  className="group cursor-pointer flex flex-col h-full bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-slate-200/60 dark:border-neutral-800 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="aspect-square w-full bg-slate-100 dark:bg-neutral-950 overflow-hidden relative">
                    <img 
                      src={p.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      alt={p.name}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-0.5 truncate">
                      {p.businessId?.name || 'Luxee Verified'}
                    </h3>
                    <p className="font-bold text-slate-800 dark:text-neutral-100 line-clamp-1 text-xs mb-1.5">
                      {p.name}
                    </p>
                    <p className="text-slate-900 dark:text-white font-black mt-auto text-sm">
                      ₦{p.price ? p.price.toLocaleString() : "0"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20 border border-dashed border-slate-200 dark:border-neutral-800 rounded-2xl mt-4">
              <p className="text-slate-400 dark:text-neutral-600 font-medium text-sm italic">No luxury items match your search.</p>
            </div>
          )}
        </section>
      </main>

      {/* --- FOOTER BUTTON BAR ANCHOR --- */}
      <footer className="w-full bg-white dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-900 z-20 mt-auto">
        <ButtonBar />
      </footer>

    </div>
  );
}