import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { Search, ShoppingBag, Layers, ShoppingCart, Flame, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ButtonBar from "../components/ButtonBar";

const API = "https://afrio-api.onrender.com/api";

const APP_CATEGORIES = [
  { value: "clothes", label: "Fashion", initial: "👕", bg: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" },
  { value: "fabric", label: "Fabrics", initial: "🧵", bg: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" },
  { value: "kids_baby", label: "Baby & Kids", initial: "🍼", bg: "bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400" },
  { value: "phones_accessories", label: "Phones", initial: "📱", bg: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400" },
  { value: "electronics", label: "Gadgets", initial: "💻", bg: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" },
  { value: "appliances", label: "Appliances", initial: "🔌", bg: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400" },
  { value: "furniture", label: "Home Decor", initial: "🪑", bg: "bg-amber-700/10 text-amber-700 dark:bg-amber-700/20 dark:text-amber-400" },
  { value: "kitchenware", label: "Kitchen", initial: "🍳", bg: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400" },
  { value: "plumbing", label: "Plumbing", initial: "🔧", bg: "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400" },
  { value: "shoes_bags", label: "Shoes & Bags", initial: "👜", bg: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" },
  { value: "cosmetics_beauty", label: "Beauty", initial: "💄", bg: "bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400" },
  { value: "groceries", label: "Groceries", initial: "🍏", bg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" },
  { value: "automotive", label: "Auto Parts", initial: "🚗", bg: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400" },
  { value: "sports_fitness", label: "Fitness", initial: "🏋️", bg: "bg-lime-500/10 text-lime-600 dark:bg-lime-500/20 dark:text-lime-400" },
  { value: "health_wellness", label: "Health", initial: "💊", bg: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400" },
  { value: "books_stationery", label: "Books", initial: "📚", bg: "bg-yellow-600/10 text-yellow-700 dark:bg-yellow-600/20 dark:text-yellow-400" },
  { value: "jewelry_watches", label: "Watches", initial: "⌚", bg: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400" },
  { value: "construction_hardware", label: "Hardware", initial: "🧱", bg: "bg-stone-500/10 text-stone-600 dark:bg-stone-500/20 dark:text-stone-400" },
  { value: "services", label: "Services", initial: "🛠️", bg: "bg-blue-600/10 text-blue-700 dark:bg-blue-600/20 dark:text-blue-400" },
  { value: "other", label: "Others", initial: "📦", bg: "bg-neutral-500/10 text-neutral-600 dark:bg-neutral-500/20 dark:text-neutral-400" },
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

  const { addToCart } = useCart();
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

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-black text-slate-900 dark:text-slate-100 antialiased selection:bg-amber-500 selection:text-black flex flex-col justify-between select-none touch-manipulation">
      
      {/* --- STICKY APP SEARCH HEADER --- */}
      <header className="sticky top-0 z-50 bg-white dark:bg-neutral-950 border-b border-neutral-200/60 dark:border-neutral-900 px-3.5 py-2.5 w-full">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-2">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Sparkles size={16} className="text-amber-500 fill-amber-500" />
              <h1 className="text-lg font-black tracking-tighter uppercase text-neutral-900 dark:text-white">
                Luxeehub<span className="text-amber-500">.</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/20 px-2.5 py-0.5 rounded-full">
              <Flame size={11} className="text-amber-600 dark:text-amber-400 fill-amber-500" />
              <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-tight">
                Trending Feed
              </span>
            </div>
          </div>

          <div className="relative w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
              <Search className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wholesale deals..."
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-transparent dark:border-neutral-800 h-9 pl-9 pr-4 rounded-lg text-xs font-medium focus:outline-none focus:bg-white focus:border-amber-500 dark:focus:bg-neutral-900 transition-all text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </header>

      {/* --- HORIZONTAL NOON/TEMU STYLE DISK ROW --- */}
      <div className="w-full bg-white dark:bg-neutral-950 border-b border-neutral-200/40 dark:border-neutral-900/40 py-2.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center gap-3.5 px-3 max-w-7xl mx-auto w-max">
          
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex flex-col items-center gap-1 focus:outline-none transition active:scale-95"
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center border text-xs transition-all ${
              selectedCategory === null 
                ? "border-amber-500 bg-amber-500 text-white shadow-sm" 
                : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500"
            }`}>
              <Layers size={14} />
            </div>
            <span className={`text-[10px] font-bold ${selectedCategory === null ? "text-amber-500" : "text-neutral-500 dark:text-neutral-400"}`}>
              All Items
            </span>
          </button>

          {APP_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(isSelected ? null : cat.value)}
                className="flex flex-col items-center gap-1 focus:outline-none transition active:scale-95"
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base border transition-all ${
                  isSelected 
                    ? "border-amber-500 bg-amber-500 text-white scale-105" 
                    : `${cat.bg} border-transparent`
                }`}>
                  {cat.initial}
                </div>
                <span className={`text-[10px] font-medium transition-colors whitespace-nowrap ${
                  isSelected ? "text-amber-500 font-bold" : "text-neutral-600 dark:text-neutral-400"
                }`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- TEMU DENSE PRODUCT FEED GRID --- */}
      <main className="relative flex-grow max-w-7xl w-full mx-auto px-2 pt-2.5 pb-24 z-10 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <section>
          {loading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-white dark:bg-neutral-900 rounded-lg p-2 space-y-2 border border-neutral-200/30">
                    <div className="aspect-square w-full bg-neutral-200 dark:bg-neutral-950 rounded-md" />
                    <div className="h-2 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
                    <div className="h-3 w-1/2 bg-neutral-300 dark:bg-neutral-800 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
              {filteredProducts.map(p => (
                <div 
                  key={p._id} 
                  onClick={() => navigate(`/product/${p._id}`)} 
                  className="group relative cursor-pointer flex flex-col h-full bg-white dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200/40 dark:border-neutral-800/40 shadow-sm active:opacity-90 transition-opacity"
                >
                  {/* Image Block */}
                  <div className="aspect-square w-full bg-neutral-100 dark:bg-neutral-950 overflow-hidden relative">
                    <img 
                      src={p.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"} 
                      className="w-full h-full object-cover" 
                      alt={p.name}
                      loading="lazy"
                    />
                    
                    {/* Temu-style Asymmetric Promo Tag */}
                    <div className="absolute top-1 left-1 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                      Top Sale
                    </div>
                  </div>
                  
                  {/* Item Details */}
                  <div className="p-2 flex flex-col flex-grow">
                    <h2 className="text-neutral-800 dark:text-neutral-200 font-medium line-clamp-2 text-xs leading-tight mb-1">
                      {p.name}
                    </h2>

                    {/* Temu Style Social Urgency Proof Line */}
                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="text-[9px] bg-red-500/10 text-red-500 font-bold px-1 rounded">
                        Deal
                      </span>
                      <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium">
                        99+ sold recently
                      </span>
                    </div>

                    {/* Price & Action Footer Container */}
                    <div className="mt-auto pt-1 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-amber-600 dark:text-amber-500 font-extrabold text-sm leading-none">
                          ₦{p.price ? p.price.toLocaleString() : "0"}
                        </span>
                      </div>

                      {/* Cart Button */}
                      {/* <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Stops routing to detail screen
                          addToCart(p);        // Pushes to global frontend state
                        }}
                        className="p-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-black transition-all active:scale-90 shadow-sm"
                      >
                        <ShoppingCart size={13} className="stroke-[2.5]" />
                      </button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/40 dark:border-neutral-800/60 mt-2">
              <p className="text-neutral-400 dark:text-neutral-500 font-bold text-xs">No flash items match your search selection.</p>
            </div>
          )}
        </section>
      </main>

      {/* --- FOOTER ATTACHED APP BUTTON BAR --- */}
      <footer className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-neutral-950 border-t border-neutral-200/60 dark:border-neutral-900 z-50">
        <ButtonBar />
      </footer>

    </div>
  );
}