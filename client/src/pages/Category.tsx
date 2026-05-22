import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ButtonBar from "../components/ButtonBar";

const API = "https://afrio-api.onrender.com/api";

// Precise data mapping for your 20 backend enum values with beautiful matching product imagery
const APP_CATEGORIES = [
  { value: "clothes", label: "Fashion", img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=150&auto=format&fit=crop&q=80" },
  { value: "fabric", label: "Fabrics", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=150&auto=format&fit=crop&q=80" },
  { value: "kids_baby", label: "Baby", img: "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=150&auto=format&fit=crop&q=80" },
  { value: "phones_accessories", label: "Phones", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&auto=format&fit=crop&q=80" },
  { value: "electronics", label: "Gadgets", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150&auto=format&fit=crop&q=80" },
  { value: "appliances", label: "Appliances", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150&auto=format&fit=crop&q=80" },
  { value: "furniture", label: "Home", img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=150&auto=format&fit=crop&q=80" },
  { value: "kitchenware", label: "Kitchen", img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=150&auto=format&fit=crop&q=80" },
  { value: "plumbing", label: "Plumbing", img: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=150&auto=format&fit=crop&q=80" },
  { value: "shoes_bags", label: "Bags", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=150&auto=format&fit=crop&q=80" },
  { value: "cosmetics_beauty", label: "Beauty", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150&auto=format&fit=crop&q=80" },
  { value: "groceries", label: "Grocery", img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80" },
  { value: "automotive", label: "Auto", img: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=150&auto=format&fit=crop&q=80" },
  { value: "sports_fitness", label: "Fitness", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=80" },
  { value: "health_wellness", label: "Health", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=150&auto=format&fit=crop&q=80" },
  { value: "books_stationery", label: "Books", img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=150&auto=format&fit=crop&q=80" },
  { value: "jewelry_watches", label: "Watches", img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=150&auto=format&fit=crop&q=80" },
  { value: "construction_hardware", label: "Hardware", img: "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?w=150&auto=format&fit=crop&q=80" },
  { value: "services", label: "Services", img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&auto=format&fit=crop&q=80" },
  { value: "other", label: "Others", img: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=150&auto=format&fit=crop&q=80" },
];

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API}/products`);
        if (!response.ok) throw new Error(`HTTP network error! Status: ${response.status}`);
        const resData = await response.json();
        const rawProducts = resData?.data || [];
        const randomized = [...rawProducts].sort(() => Math.random() - 0.5);
        setProducts(randomized);
      } catch (e) {
        console.error("Home Data Fetch Error:", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter computation handles both search query and quick category selector simultaneously
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 antialiased selection:bg-amber-500 selection:text-black flex flex-col justify-between select-none touch-manipulation">
      
      {/* --- NATIVE APP STICKY HEADER --- */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-slate-200/60 dark:border-neutral-900 px-4 py-3 w-full">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-2.5">
          
          {/* Brand Row */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              AFRIO<span className="text-amber-500">.</span>
            </h1>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Native Search Input */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items, brands, departments..."
              className="w-full bg-slate-100 dark:bg-neutral-900 border border-transparent dark:border-neutral-800/60 h-10 pl-10 pr-4 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-amber-500 dark:focus:bg-neutral-900 transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </header>

      {/* --- HORIZONTAL NOON-STYLE CATEGORY DISK ROW --- */}
      <div className="w-full bg-white dark:bg-neutral-950 border-b border-slate-100 dark:border-neutral-900/40 py-3.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center gap-4 px-4 max-w-7xl mx-auto w-max">
          
          {/* "All" Toggle Bubble */}
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex flex-col items-center gap-1.5 focus:outline-none transition active:scale-95"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 font-bold text-xs transition-all ${
              selectedCategory === null 
                ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm" 
                : "border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 text-slate-400"
            }`}>
              All
            </div>
            <span className={`text-[10px] font-bold tracking-tight ${selectedCategory === null ? "text-amber-600 dark:text-amber-400" : "text-slate-500"}`}>
              Discover
            </span>
          </button>

          {/* Dynamic Map over the 20 Core App Enums */}
          {APP_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(isSelected ? null : cat.value)}
                className="flex flex-col items-center gap-1.5 focus:outline-none transition active:scale-95"
              >
                <div className={`w-14 h-14 rounded-full overflow-hidden border-2 p-0.5 transition-all bg-white dark:bg-neutral-900 ${
                  isSelected 
                    ? "border-amber-500 shadow-md ring-4 ring-amber-500/5 scale-105" 
                    : "border-slate-200/80 dark:border-neutral-800"
                }`}>
                  <img 
                    src={cat.img} 
                    alt={cat.label} 
                    className="w-full h-full object-cover rounded-full" 
                  />
                </div>
                <span className={`text-[10px] font-bold tracking-tight transition-colors whitespace-nowrap ${
                  isSelected ? "text-amber-500 font-extrabold" : "text-slate-600 dark:text-neutral-400"
                }`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BACKGROUND GLOW ACCENT */}
      <div className="absolute top-36 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[240px] bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none blur-3xl z-0" />

      {/* MAIN CONTENT AREA */}
      <main className="relative flex-grow max-w-7xl w-full mx-auto px-3.5 pt-4 pb-24 z-10 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <section>
          {loading ? (
            /* --- REALISTIC APP SHIMMER SKELETON --- */
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 md:gap-4">
                {[1, 2, 3, 4, 5, 6, 8, 9, 10].map((i) => (
                  <div key={i} className="flex flex-col bg-white dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-900/60 p-2.5 space-y-3">
                    <div className="aspect-square w-full bg-slate-200 dark:bg-neutral-950 rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-2 w-1/3 bg-slate-200 dark:bg-neutral-800 rounded" />
                      <div className="h-2.5 w-5/6 bg-slate-200 dark:bg-neutral-800 rounded" />
                      <div className="h-3 w-1/2 bg-slate-300 dark:bg-neutral-800 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* --- HIGH QUALITY CLEAN SQUARE GRID SYSTEM --- */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 md:gap-4">
              {filteredProducts.map(p => (
                <div 
                  key={p._id} 
                  onClick={() => navigate(`/product/${p._id}`)} 
                  className="group cursor-pointer flex flex-col h-full bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-slate-200/50 dark:border-neutral-800/70 shadow-sm active:scale-[0.98] transition-transform duration-200"
                >
                  <div className="aspect-square w-full bg-slate-100 dark:bg-neutral-950 overflow-hidden relative">
                    <img 
                      src={p.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"} 
                      className="w-full h-full object-cover" 
                      alt={p.name}
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="p-2.5 flex flex-col flex-grow">
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-0.5 truncate">
                      {p.businessId?.name || 'Verified Merchant'}
                    </span>
                    <h2 className="font-semibold text-slate-800 dark:text-neutral-200 line-clamp-1 text-xs mb-1">
                      {p.name}
                    </h2>
                    <div className="mt-auto pt-1 flex items-baseline justify-between">
                      <span className="text-slate-900 dark:text-white font-black text-sm">
                        ₦{p.price ? p.price.toLocaleString() : "0"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/40 dark:border-neutral-800/60 shadow-sm">
              <p className="text-slate-400 dark:text-neutral-500 font-semibold text-xs">No products found inside this layout.</p>
            </div>
          )}
        </section>
      </main>

      {/* --- NATIVE FOOTER BOT BAR --- */}
      <footer className="fixed bottom-0 left-0 right-0 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-slate-200/60 dark:border-neutral-900 z-50">
        <ButtonBar />
      </footer>

    </div>
  );
}