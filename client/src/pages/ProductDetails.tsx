import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import {
  Heart, ArrowLeft, Share2, Sparkles,
  ShoppingBag, Verified, ExternalLink, Plus, Minus, Layers
} from "lucide-react";

const API = "https://afrio-api.onrender.com/api";

// Map currency codes to their respective native symbol
const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  CNY: "¥",
  GBP: "£"
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core Data States
  const [product, setProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery & Purchase UX States
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [notes, setNotes] = useState("");

  const galleryRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    if (!id || id === "undefined") return;
    setLoading(true);
    try {
      const prodRes = await fetch(`${API}/products/${id}`);
      const prodData = await prodRes.json();
      const currentProduct = prodData.data;
      setProduct(currentProduct);

      // Pre-select first variant if item uses variations
      if (currentProduct?.features?.variants && currentProduct.variants?.length > 0) {
        setSelectedVariant(currentProduct.variants[0]);
      }

      // Initialize quantity correctly based on measurement rules
      if (currentProduct?.features?.measurement && currentProduct.measurement) {
        setQuantity(currentProduct.measurement.minOrder || 1);
      } else {
        setQuantity(1);
      }

      // Parallel secondary lookups
      await Promise.all([
        fetch(`${API}/products`).then(res => res.json()).then(d => setProducts(d.data || [])),
        fetch(`${API}/styles`).then(res => res.json()).then(d => setStyles(d.data || []))
      ]);
    } catch (error) { 
      console.error("Error fetching product data ecosystem:", error); 
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
  };

  const handleGalleryScroll = () => {
    if (!galleryRef.current) return;
    const width = galleryRef.current.clientWidth;
    const scrollLeft = galleryRef.current.scrollLeft;
    const index = Math.round(scrollLeft / width);

    if (index !== currentImage && index >= 0) {
      setCurrentImage(index);
      scrollToActiveThumbnail(index);
    }
  };

  const handleThumbClick = (index: number) => {
    setCurrentImage(index);
    if (galleryRef.current) {
      const width = galleryRef.current.clientWidth;
      galleryRef.current.scrollLeft = width * index;
    }
    scrollToActiveThumbnail(index);
  };

  const scrollToActiveThumbnail = (index: number) => {
    if (!thumbnailsRef.current) return;
    const thumbsContainer = thumbnailsRef.current;
    const activeThumb = thumbsContainer.children[index] as HTMLElement;

    if (activeThumb) {
      const containerWidth = thumbsContainer.offsetWidth;
      const activeThumbWidth = activeThumb.offsetWidth;
      const activeThumbLeft = activeThumb.offsetLeft;
      const desiredScrollLeft = activeThumbLeft - (containerWidth / 2) + (activeThumbWidth / 2);

      thumbsContainer.scrollTo({
        left: desiredScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleVariantChange = (variant: any) => {
    setSelectedVariant(variant);
    // If variant has unique assets, jump slider preview to its first dedicated image asset
    if (variant.images && variant.images.length > 0) {
      const variantImgIndex = imagesList.indexOf(variant.images[0]);
      if (variantImgIndex !== -1) {
        handleThumbClick(variantImgIndex);
      }
    }
  };

  const handleBuyNow = () => {
    navigate("/order", {
      state: {
        product,
        selectedVariant,
        quantity,
        notes,
        calculatedPrice: currentUnitPrice * quantity
      }
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-black flex flex-col justify-start items-center p-4 md:p-8">
        <div className="w-full max-w-7xl space-y-6 mt-16 animate-pulse">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="w-full aspect-square bg-slate-200 dark:bg-neutral-900 rounded-2xl" />
              <div className="flex gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-16 h-16 bg-slate-200 dark:bg-neutral-900 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="flex-1 bg-white dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800/80 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-200 dark:bg-neutral-800 rounded" />
                <div className="h-7 w-3/4 bg-slate-300 dark:bg-neutral-800 rounded-xl" />
                <div className="h-5 w-32 bg-slate-200 dark:bg-neutral-800 rounded-lg" />
              </div>
              <div className="h-14 w-full bg-slate-100 dark:bg-neutral-950 rounded-xl" />
              <div className="h-12 w-full bg-slate-100 dark:bg-neutral-950 rounded-xl" />
              <div className="h-14 w-full bg-slate-300 dark:bg-neutral-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Compile full image list combining parent root images and item variation images safely
  const variantImages = product.variants?.flatMap((v: any) => v.images || []).filter(Boolean) || [];
  const rawImagesList = [...(product.images || []), ...variantImages];
  const imagesList = rawImagesList.length > 0 ? rawImagesList : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"];

  // Currency calculations handler
  const visualCurrency = CURRENCY_SYMBOLS[product.currency] || product.currency || "₦";

  // Dynamic pricing evaluation engine based on architecture toggles
  let currentUnitPrice = product.basePrice || 0;
  if (product.features?.measurement && product.measurement) {
    currentUnitPrice = product.measurement.pricePerUnit || currentUnitPrice;
  } else if (product.features?.variants && selectedVariant) {
    currentUnitPrice = selectedVariant.price || currentUnitPrice;
  }

  // Dynamic stock assessment mapping bounds
  const currentMaxStock = product.features?.variants && selectedVariant 
    ? selectedVariant.stock 
    : (product.stock ?? 0);

  const minAllowedQty = product.features?.measurement && product.measurement 
    ? (product.measurement.minOrder || 1) 
    : 1;

  // Safety extraction metrics for business components
  const businessIdString = typeof product.businessId === "object" ? product.businessId?._id : product.businessId;
  const businessName = product.businessId?.name || "Verified Merchant";

  return (
    <PhotoProvider maskOpacity={0.95}>
      <main className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-100 pb-32 select-none touch-manipulation">

        {/* NATIVE FLOATING NAVIGATION HEADER */}
        <nav className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-slate-900 dark:text-white rounded-xl shadow-sm border border-slate-200/40 dark:border-neutral-800"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button className="p-2.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-slate-900 dark:text-white rounded-xl shadow-sm border border-slate-200/40 dark:border-neutral-800">
              <Share2 size={18} />
            </button>
            <button className="p-2.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-400 dark:text-neutral-500 rounded-xl shadow-sm border border-slate-200/40 dark:border-neutral-800 active:text-red-500">
              <Heart size={18} />
            </button>
          </div>
        </nav>

        {/* APPARATUS CONTAINER */}
        <div className="max-w-7xl mx-auto md:pt-20 md:px-6">
          <div className="flex flex-col md:flex-row gap-6">

            {/* APP GALLERY CANVAS SYSTEM */}
            <div className="w-full md:w-1/2 relative space-y-3">
              <div
                ref={galleryRef}
                onScroll={handleGalleryScroll}
                className="w-full aspect-square bg-white dark:bg-neutral-900 flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {imagesList.map((img: string, i: number) => (
                  <div key={i} className="w-full h-full flex-shrink-0 snap-center cursor-pointer">
                    <PhotoView src={img}>
                      <img src={img} className="w-full h-full object-cover" alt={`${product.name} component ${i}`} />
                    </PhotoView>
                  </div>
                ))}
              </div>

              {/* THUMBNAIL TRACK SLIDER */}
              <div ref={thumbnailsRef} className="flex gap-2.5 px-4 md:px-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth">
                {imagesList.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleThumbClick(i)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      currentImage === i ? 'border-amber-500 scale-100 opacity-100' : 'border-slate-100 dark:border-neutral-800/60 opacity-60'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>

            {/* DETAILS METRICS AND CHECKOUT ACTION BAR */}
            <div className="flex-1 px-4 md:px-0">
              <div className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800/60 p-5 md:p-8 rounded-2xl shadow-sm">
                
                <div className="flex flex-col mb-5">
                  <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">
                    {product.category || 'Exclusive Line'} • <span className="capitalize">{product.condition}</span>
                  </span>
                  <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                    {product.name}
                  </h1>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-2xl font-black text-slate-900 dark:text-amber-400">
                      {visualCurrency}{currentUnitPrice.toLocaleString()}
                      {product.features?.measurement && product.measurement && (
                        <span className="text-xs text-slate-400 font-medium font-sans"> / {product.measurement.unit}</span>
                      )}
                    </p>
                    {currentMaxStock > 0 ? (
                      <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                        {currentMaxStock} Units Available
                      </span>
                    ) : (
                      <span className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Out of Stock</span>
                    )}
                  </div>
                </div>

                {/* VERIFIED RETAILER ROUTING COMPONENT */}
                {businessIdString && (
                  <div
                    onClick={() => navigate(`/business/${businessIdString}/public`)}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800/40 rounded-xl mb-6 cursor-pointer"
                  >
                    <div className="w-9 h-9 bg-neutral-900 dark:bg-amber-500 rounded-lg flex items-center justify-center text-white dark:text-black font-black text-xs">
                      {businessName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-neutral-100 text-xs flex items-center gap-1">
                        {businessName} <Verified size={12} className="text-blue-500 fill-blue-500" />
                      </h4>
                      <p className="text-[9px] text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Verified Merchant</p>
                    </div>
                    <ExternalLink size={14} className="text-slate-300 dark:text-neutral-700" />
                  </div>
                )}

                {/* DYNAMIC PRODUCT ATTRIBUTES & VARIANTS COMPONENT */}
                {product.features?.variants && product.variants && product.variants.length > 0 && (
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-100 dark:border-neutral-800/40 space-y-3">
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-500">
                      <Layers size={12} />
                      <span className="font-black text-[9px] uppercase tracking-wider">Select Style Options</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v: any) => {
                        const variantOptionLabel = Object.values(v.options || {}).join(" - ");
                        const isSelected = selectedVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => handleVariantChange(v)}
                            className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                              isSelected
                                ? "bg-neutral-900 dark:bg-amber-500 text-white dark:text-black border-transparent shadow-sm"
                                : "bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-200 border-slate-200 dark:border-neutral-800 hover:border-slate-400"
                            }`}
                          >
                            {variantOptionLabel || v.sku}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* QUANTITY INPUT SHEET MANAGEMENT BAR */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-100 dark:border-neutral-800/40">
                    <div className="flex flex-col ml-2">
                      <span className="font-black text-[9px] uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                        {product.features?.measurement && product.measurement ? `Order Volume (${product.measurement.unit}s)` : "Quantity"}
                      </span>
                      {product.features?.measurement && product.measurement && (
                        <span className="text-[8px] text-amber-600 dark:text-amber-400 font-bold">Min Order: {product.measurement.minOrder}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setQuantity(Math.max(minAllowedQty, quantity - 1))} 
                        className="w-9 h-9 bg-white dark:bg-neutral-900 rounded-lg shadow-sm flex items-center justify-center text-slate-900 dark:text-white border dark:border-neutral-800 active:scale-95 transition-transform"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-black text-sm w-8 text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(currentMaxStock ? Math.min(currentMaxStock, quantity + 1) : quantity + 1)} 
                        className="w-9 h-9 bg-neutral-900 dark:bg-amber-500 rounded-lg shadow-sm flex items-center justify-center text-white dark:text-black active:scale-95 transition-transform"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* CUSTOM PREFERENCES TEXTAREA */}
                  <div>
                    <label className="text-[9px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest ml-1 mb-1.5 block">Custom Fabric & Tailoring Requests</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify size measurements, tailoring cuts, color confirmations, or delivery specifications..."
                      className="w-full bg-slate-50 dark:bg-neutral-950 border border-transparent dark:border-neutral-800/60 rounded-xl p-4 text-xs font-medium focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white resize-none min-h-[85px]"
                    />
                  </div>
                </div>

                {/* PURCHASE ENGAGEMENT TRIGGER */}
                <button
                  onClick={handleBuyNow}
                  disabled={currentMaxStock <= 0}
                  className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-98 ${
                    currentMaxStock <= 0 
                      ? "bg-slate-200 dark:bg-neutral-800 text-slate-400 dark:text-neutral-600 cursor-not-allowed" 
                      : "bg-neutral-900 dark:bg-amber-500 text-white dark:text-black"
                  }`}
                >
                  <ShoppingBag size={16} />
                  {currentMaxStock <= 0 ? "Out of Stock" : `Confirm Order • ${visualCurrency}${(currentUnitPrice * quantity).toLocaleString()}`}
                </button>
              </div>

              {/* ORIGIN & SPECIFICATION LOGS */}
              {product.features?.origin && product.origin && (
                <div className="mt-4 mx-1 p-3 bg-slate-100/60 dark:bg-neutral-950/40 rounded-xl border border-slate-200/20 flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <div>Origin: <span className="text-slate-900 dark:text-neutral-200 font-black">{product.origin.country}</span></div>
                  <div>Hub: <span className="text-slate-900 dark:text-neutral-200 font-black">{product.origin.city}</span></div>
                </div>
              )}

              {/* PRODUCT SUMMARY DETAILS */}
              <div className="mt-6 px-1">
                <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest mb-2">Overview Details</h3>
                <p className="text-slate-500 dark:text-neutral-400 leading-relaxed text-xs">
                  {product.description?.trim() ? product.description : "No additional description specified for this exclusive luxury piece."}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* FEED SECTIONS (STYLE INSPO & RETAILER SHOWCASE) */}
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
                <img src={s.image} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-90" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-xs font-bold leading-tight line-clamp-2 uppercase tracking-wide">{s.title}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 mb-5 mt-4">
            <ShoppingBag className="text-amber-500" size={16} />
            <h2 className="text-lg font-black tracking-tight dark:text-white">Store Showcase</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {products.slice(0, 6).map((p) => {
              const alternativeCurrency = CURRENCY_SYMBOLS[p.currency] || p.currency || "₦";
              const alternativePrice = p.basePrice || p.measurement?.pricePerUnit || p.variants?.[0]?.price || 0;
              return (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-slate-200/60 dark:border-neutral-800 shadow-sm cursor-pointer"
                >
                  <div className="aspect-square bg-slate-50 dark:bg-neutral-950 overflow-hidden relative">
                    <img src={p.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-slate-800 dark:text-neutral-200 text-xs line-clamp-1 mb-1">{p.name}</p>
                    <p className="text-slate-900 dark:text-white font-black text-sm">{alternativeCurrency}{alternativePrice.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </PhotoProvider>
  );
}
