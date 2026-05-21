import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
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
  const [loading, setLoading] = useState(true);

  const galleryRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    if (!id || id === "undefined") return;
    setLoading(true);
    try {
      const prodRes = await fetch(`${API}/products/${id}`);
      const prodData = await prodRes.json();
      setProduct(prodData.data);

      // Parallel secondary fetches
      await Promise.all([
        fetch(`${API}/products`).then(res => res.json()).then(d => setProducts(d.data || [])),
        fetch(`${API}/styles`).then(res => res.json()).then(d => setStyles(d.data || []))
      ]);
    } catch (error) { 
      console.error(error); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
    resetGalleryState();
  }, [id]);

  const resetGalleryState = () => {
    setCurrentImage(0);
    if (galleryRef.current) galleryRef.current.scrollLeft = 0;
    if (thumbnailsRef.current) thumbnailsRef.current.scrollLeft = 0;
  }

  // Handle image index detection during manual sliding/swiping
  const handleGalleryScroll = () => {
    if (!galleryRef.current) return;
    const width = galleryRef.current.clientWidth;
    const scrollLeft = galleryRef.current.scrollLeft;
    const index = Math.round(scrollLeft / width);

    // Only update and scroll thumbs if index actually changed
    if (index !== currentImage && index >= 0) {
      setCurrentImage(index);
      scrollToActiveThumbnail(index);
    }
  };

  // Allow clicking a thumb to jump the main slider
  const handleThumbClick = (index: number) => {
    setCurrentImage(index);
    if (galleryRef.current) {
      const width = galleryRef.current.clientWidth;
      galleryRef.current.scrollLeft = width * index;
    }
    scrollToActiveThumbnail(index);
  }

  // Ensure the active thumbnail is always visible in its row
  const scrollToActiveThumbnail = (index: number) => {
    if (!thumbnailsRef.current) return;
    const thumbsContainer = thumbnailsRef.current;
    const activeThumb = thumbsContainer.children[index] as HTMLElement;

    if (activeThumb) {
      const containerWidth = thumbsContainer.offsetWidth;
      const activeThumbWidth = activeThumb.offsetWidth;
      const activeThumbLeft = activeThumb.offsetLeft;

      // Calculate scroll position to center the thumbnail
      const desiredScrollLeft = activeThumbLeft - (containerWidth / 2) + (activeThumbWidth / 2);

      thumbsContainer.scrollTo({
        left: desiredScrollLeft,
        behavior: 'smooth'
      });
    }
  }

  const handleBuyNow = () => {
    navigate("/order", {
      state: {
        product,
        quantity,
        notes
      }
    });
  };

  /* --- ATELIER DESIGN SKELETON LAYOUT SYSTEM --- */
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-black flex flex-col justify-start items-center p-4 md:p-8">
        <div className="w-full max-w-7xl space-y-6 mt-16 animate-pulse">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Gallery Shimmer */}
            <div className="w-full md:w-1/2 space-y-3">
              <div className="w-full aspect-square bg-slate-200 dark:bg-neutral-900 rounded-2xl" />
              <div className="flex gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-16 h-16 bg-slate-200 dark:bg-neutral-900 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Content Form Block Shimmer */}
            <div className="flex-1 bg-white dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800/80 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-200 dark:bg-neutral-800 rounded" />
                <div className="h-7 w-3/4 bg-slate-300 dark:bg-neutral-800 rounded-xl" />
                <div className="h-5 w-32 bg-slate-200 dark:bg-neutral-800 rounded-lg" />
              </div>
              <div className="h-14 w-full bg-slate-100 dark:bg-neutral-950 rounded-xl" />
              <div className="h-12 w-full bg-slate-100 dark:bg-neutral-950 rounded-xl" />
              <div className="space-y-2">
                <div className="h-3 w-28 bg-slate-200 dark:bg-neutral-800 rounded" />
                <div className="h-20 w-full bg-slate-100 dark:bg-neutral-950 rounded-xl" />
              </div>
              <div className="h-14 w-full bg-slate-300 dark:bg-neutral-800 rounded-xl" />
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const imagesList = product.images?.length > 0 ? product.images : [product.mainImage || product.images?.[0]];

  return (
    // We wrap the entire content in PhotoProvider so any image can open the modal
    <PhotoProvider
      maskOpacity={0.95}
    >
      <main className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-100 pb-32 select-none touch-manipulation [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* --- NATIVE FLOATING HEADER TOP ACTION BAR --- */}
        <nav className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-slate-900 dark:text-white rounded-xl shadow-sm active:scale-95 transition-transform border border-slate-200/40 dark:border-neutral-800"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button className="p-2.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-slate-900 dark:text-white rounded-xl shadow-sm active:scale-95 transition-transform border border-slate-200/40 dark:border-neutral-800">
              <Share2 size={18} />
            </button>
            <button className="p-2.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-400 dark:text-neutral-500 rounded-xl shadow-sm active:scale-95 transition-transform border border-slate-200/40 dark:border-neutral-800 active:text-red-500">
              <Heart size={18} />
            </button>
          </div>
        </nav>

        {/* --- MAIN APP CONTAINER --- */}
        <div className="max-w-7xl mx-auto md:pt-6 md:px-6">
          <div className="flex flex-col md:flex-row gap-6">

            {/* LEFT SIDE: GALLERY, THUMBS, AND MODAL VIEWERS */}
            <div className="w-full md:w-1/2 relative space-y-3">
              {/* Main Swiper Area - Clicks open Fullscreen Viewer */}
              <div
                ref={galleryRef}
                onScroll={handleGalleryScroll}
                className="w-full aspect-square bg-white dark:bg-neutral-900 flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {imagesList.map((img: string, i: number) => (
                  <div key={i} className="w-full h-full flex-shrink-0 snap-center cursor-pointer">
                    <PhotoView src={img}>
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt={`${product.name} item ${i}`}
                      />
                    </PhotoView>
                  </div>
                ))}
              </div>

              {/* THUMBNAIL CARDS BELOW GALLERY */}
              <div
                ref={thumbnailsRef}
                className="flex gap-2.5 px-4 md:px-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
              >
                {imagesList.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleThumbClick(i)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 shadow-inner ${currentImage === i
                        ? 'border-amber-500 scale-100 opacity-100 shadow-md shadow-amber-900/20'
                        : 'border-slate-100 dark:border-neutral-800/60 opacity-60 hover:opacity-100 hover:scale-102'
                      }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE: PRODUCT DETAILS AND INPUT SHEETS */}
            <div className="flex-1 px-4 md:px-0 mt-3 md:mt-0">
              <div className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800/60 p-5 md:p-8 rounded-2xl shadow-sm">

                <div className="flex flex-col mb-5">
                  <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">
                    {product.category || 'Exclusive Line'}
                  </span>
                  <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight leading-snug">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-2xl font-black text-slate-900 dark:text-amber-400">₦{product.price.toLocaleString()}</p>
                    <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">In Stock</span>
                  </div>
                </div>

                {/* SELLER VERIFIED MINI CARD */}
                <div
                  onClick={() => navigate(`/business/${product.businessId?._id}/public`)}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800/40 rounded-xl mb-6 cursor-pointer"
                >
                  <div className="w-9 h-9 bg-neutral-900 dark:bg-amber-500 rounded-lg flex items-center justify-center text-white dark:text-black font-black text-xs">
                    {product.businessId?.name?.charAt(0) || 'L'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-neutral-100 text-xs flex items-center gap-1">
                      {product.businessId?.name || 'Luxee Vendor'} <Verified size={12} className="text-blue-500 fill-blue-500" />
                    </h4>
                    <p className="text-[9px] text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Verified Merchant</p>
                  </div>
                  <ExternalLink size={14} className="text-slate-300 dark:text-neutral-700" />
                </div>

                {/* ACTION ORDER COUNTERS */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-100 dark:border-neutral-800/40">
                    <span className="ml-2 font-black text-[9px] uppercase tracking-wider text-slate-400 dark:text-neutral-500">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 bg-white dark:bg-neutral-900 rounded-lg shadow-sm flex items-center justify-center text-slate-900 dark:text-white border dark:border-neutral-800 active:scale-90 transition-transform"><Minus size={14} /></button>
                      <span className="font-black text-sm w-4 text-center">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 bg-neutral-900 dark:bg-amber-500 rounded-lg shadow-sm flex items-center justify-center text-white dark:text-black active:scale-90 transition-transform"><Plus size={14} /></button>
                    </div>
                  </div>

                  {/* Notes Fields */}
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest ml-1 mb-1.5 block">Custom Requests</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Sizes, preferences, or delivery references..."
                      className="w-full bg-slate-50 dark:bg-neutral-950 border border-transparent dark:border-neutral-800/60 rounded-xl p-4 text-xs font-medium focus:outline-none focus:border-amber-500 dark:focus:bg-neutral-950 min-h-[80px] text-slate-900 dark:text-white resize-none"
                    />
                  </div>
                </div>

                {/* BUY NOW INTERACTIVE BUTTON */}
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-neutral-900 dark:bg-amber-500 text-white dark:text-black py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <ShoppingBag size={16} />
                  Confirm Order • ₦{(product.price * quantity).toLocaleString()}
                </button>
              </div>

              {/* DESCRIPTION ACCORDION VIEW */}
              <div className="mt-6 px-1">
                <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest mb-2">Overview Details</h3>
                <p className="text-slate-500 dark:text-neutral-400 leading-relaxed text-xs">{product.description || 'No additional description specified for this exclusive luxury piece.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- HORIZONTAL LOOKBOOK / INSPIRATIONS FEED --- */}
        <div className="max-w-7xl mx-auto px-4 mt-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="text-amber-500" size={16} />
              <h2 className="text-lg font-black tracking-tight dark:text-white">Style Inspo</h2>
            </div>
            <button className="text-[9px] font-black uppercase text-slate-400 dark:text-neutral-500 tracking-wider">View All</button>
          </div>

          <div className="flex gap-3.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-6">
            {styles.map((s) => (
              <div
                key={s._id}
                onClick={() => navigate(`/style/${s._id}`)}
                className="min-w-[140px] md:min-w-[200px] aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer border border-transparent dark:border-neutral-800"
              >
                <img src={s.image} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-90" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-xs font-bold leading-tight line-clamp-2 uppercase tracking-wide">{s.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* MORE STOCKS FROM RETAILER */}
          <div className="flex items-center gap-1.5 mb-5 mt-4">
            <ShoppingBag className="text-amber-500" size={16} />
            <h2 className="text-lg font-black tracking-tight dark:text-white">Store Showcase</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {products.slice(0, 6).map((p) => (
              <div
                key={p._id}
                onClick={() => navigate(`/product/${p._id}`)}
                className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-slate-200/60 dark:border-neutral-800 shadow-sm cursor-pointer"
              >
                <div className="aspect-square bg-slate-50 dark:bg-neutral-950 overflow-hidden relative">
                  <img src={p.images?.[0] || p.mainImage} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="font-bold text-slate-800 dark:text-neutral-200 text-xs line-clamp-1 mb-1">{p.name}</p>
                  <p className="text-slate-900 dark:text-white font-black text-sm">₦{p.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </PhotoProvider>
  );
}