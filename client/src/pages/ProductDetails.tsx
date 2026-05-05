import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Heart, ArrowLeft, Share2, Sparkles, 
  ShoppingBag, Verified, ExternalLink, Plus, Minus,
} from "lucide-react";

const API = "https://afrio-api.onrender.com/api";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
  const [product, setProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    if (!id || id === "undefined") return;
    try {
      const prodRes = await fetch(`${API}/products/${id}`);
      const prodData = await prodRes.json();
      setProduct(prodData.data);
      
      // Secondary fetches
      fetch(`${API}/products`).then(res => res.json()).then(d => setProducts(d.data || []));
      fetch(`${API}/styles`).then(res => res.json()).then(d => setStyles(d.data || []));
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleBuyNow = () => {
    // Navigate to the Order Page with details
    navigate("/order", { 
      state: { 
        product, 
        quantity, 
        notes 
      } 
    });
  };

  if (!product) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="animate-bounce font-black text-2xl text-slate-200 tracking-tighter">AFRIO...</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50/50 pb-32">
      {/* --- NAVIGATION OVERLAY --- */}
      <nav className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white/80 backdrop-blur-md text-slate-900 rounded-full shadow-xl pointer-events-auto active:scale-90 transition-transform"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex gap-2 pointer-events-auto">
          <button className="p-3 bg-white/80 backdrop-blur-md text-slate-900 rounded-full shadow-xl active:scale-90 transition-transform"><Share2 size={20} /></button>
          <button className="p-3 bg-white/80 backdrop-blur-md text-slate-900 rounded-full shadow-xl active:scale-90 transition-transform text-red-500"><Heart size={20} /></button>
        </div>
      </nav>

      {/* --- MAIN LAYOUT CONTAINER --- */}
      <div className="max-w-7xl mx-auto md:pt-10 md:px-10">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* LEFT: GALLERY SECTION */}
          <div className="w-full md:w-1/2 space-y-4">
            <div className="relative aspect-square md:rounded-[3rem] overflow-hidden bg-white shadow-2xl shadow-black/5">
              <img 
                src={product.images?.[currentImage] || product.mainImage} 
                className="w-full h-full object-cover transition-all duration-700" 
                alt={product.name}
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/20 backdrop-blur-lg text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                View {currentImage + 1} / {product.images?.length || 1}
              </div>
            </div>
            
            {/* THUMBNAILS */}
            <div className="flex gap-3 px-5 md:px-0 overflow-x-auto no-scrollbar">
              {product.images?.map((img: any, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentImage(i)}
                  className={`relative min-w-[70px] h-[70px] rounded-2xl overflow-hidden border-2 transition-all ${currentImage === i ? 'border-orange-500 scale-95' : 'border-transparent opacity-60'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: PRODUCT CONFIGURATION */}
          <div className="flex-1 px-5 md:px-0">
            <div className="bg-white md:border border-slate-100 p-8 md:rounded-[3rem] md:shadow-xl md:shadow-slate-200/50">
              <div className="flex flex-col mb-6">
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-2">New Collection</span>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">{product.name}</h1>
                <div className="flex items-center gap-3">
                   <p className="text-3xl font-black text-slate-900">₦{product.price.toLocaleString()}</p>
                   <span className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-1 rounded-md uppercase">In Stock</span>
                </div>
              </div>

              {/* SELLER MINI CARD */}
              <div 
                onClick={() => navigate(`/business/${product.businessId?._id}/public`)}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl mb-8 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xs">
                  {product.businessId?.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                    {product.businessId?.name} <Verified size={12} className="text-blue-500" />
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Artisan</p>
                </div>
                <ExternalLink size={16} className="text-slate-300" />
              </div>

              {/* ORDER INPUTS */}
              <div className="space-y-6 mb-10">
                {/* Quantity */}
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-2xl">
                  <span className="ml-4 font-black text-[10px] uppercase text-slate-400">Order Quantity</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-900 active:scale-90 transition-transform"><Minus size={18} /></button>
                    <span className="font-black text-lg">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 bg-slate-900 rounded-xl shadow-sm flex items-center justify-center text-white active:scale-90 transition-transform"><Plus size={18} /></button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Notes to Seller</label>
                   <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter size (e.g., L), color, or custom instructions..."
                    className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-medium focus:ring-2 focus:ring-orange-500/10 min-h-[100px] resize-none"
                   />
                </div>
              </div>

              {/* BUY ACTION */}
              <button 
                onClick={handleBuyNow}
                className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-slate-300 transition-all hover:bg-orange-600 active:scale-95"
              >
                <ShoppingBag size={22} />
                Confirm Order ₦{(product.price * quantity).toLocaleString()}
              </button>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-8 px-4 md:px-8">
               <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-4">Product Details</h3>
               <p className="text-slate-500 leading-relaxed text-sm">{product.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- RECOMMENDATIONS --- */}
      <div className="max-w-7xl mx-auto px-5 mt-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="text-orange-500" size={20} />
            <h2 className="text-2xl font-black tracking-tighter">Style Inspo</h2>
          </div>
          <button className="text-[10px] font-black uppercase text-slate-400 border-b-2 border-slate-100 pb-1">View All</button>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-10">
          {styles.map((s) => (
            <div 
              key={s._id} 
              onClick={() => navigate(`/style/${s._id}`)}
              className="min-w-[180px] md:min-w-[220px] aspect-[3/4] rounded-[2.5rem] overflow-hidden relative group cursor-pointer shadow-lg shadow-black/5"
            >
              <img src={s.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white text-sm font-black leading-tight tracking-tight uppercase">{s.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-8">
          <ShoppingBag className="text-orange-500" size={20} />
          <h2 className="text-2xl font-black tracking-tighter">Others from this Shop</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {products.slice(0, 10).map((p) => (
            <div 
              key={p._id} 
              onClick={() => navigate(`/product/${p._id}`)}
              className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer p-2"
            >
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-50">
                <img src={p.images?.[0]} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-1 truncate">{p.name}</p>
                <p className="text-slate-900 font-black text-lg">₦{p.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}