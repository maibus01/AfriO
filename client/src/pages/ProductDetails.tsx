import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import {
  Heart, ArrowLeft, Share2, 
  Verified, ExternalLink, Plus, Minus, Layers,
  MessageSquare, ShoppingCart, ShieldCheck, Truck, Zap
} from "lucide-react";
import VariantSelector from "./VariantSelector";

const API = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  : "https://afrio-api.onrender.com/api";

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  CNY: "¥",
  GBP: "£"
};

interface Measurement {
  minOrder?: number;
  pricePerUnit?: number;
  unit?: string;
}

interface Variant {
  _id: string;
  sku?: string;
  stock?: number;
  price?: number;
  images?: string[];
  options?: Record<string, string>;
}

interface Origin {
  country: string;
  city: string;
}

interface Product {
  _id: string;
  name: string;
  basePrice: number;
  currency: string;
  category?: string;
  condition?: string;
  stock?: number;
  images?: string[];
  description?: string;
  businessId?: string | { _id: string; name: string };
  features?: {
    measurement?: boolean;
  };
  measurement?: Measurement;
  variants?: Variant[];
  origin?: Origin;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Core Data States
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Gallery & Purchase UX States
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [isLiked, setIsLiked] = useState<boolean>(false);

  // Matrix Wholesale States (Alibaba Style)
  const [selectedMatrixOrders, setSelectedMatrixOrders] = useState<Array<{ variant: Variant; qty: number }>>([]);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState<boolean>(false);

  const galleryRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const resetGalleryState = useCallback(() => {
    setCurrentImage(0);
    if (galleryRef.current) galleryRef.current.scrollLeft = 0;
    if (thumbnailsRef.current) thumbnailsRef.current.scrollLeft = 0;
  }, []);

  useEffect(() => {
    if (!id || id === "undefined") return;

    const controller = new AbortController();
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const prodRes = await fetch(`${API}/products/${id}`, { signal: controller.signal });
        const prodData = await prodRes.json();
        const currentProduct: Product = prodData.data;
        
        setProduct(currentProduct);

        if (currentProduct?.measurement?.minOrder) {
          setQuantity(currentProduct.measurement.minOrder);
        } else {
          setQuantity(1);
        }
      } catch (error: any) { 
        if (error.name !== "AbortError") {
          console.error("Error fetching product details:", error); 
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
    resetGalleryState();

    return () => {
      controller.abort();
    };
  }, [id, resetGalleryState]);

  // Gallery Mechanics
  const imagesList = useMemo<string[]>(() => {
    if (!product) return ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"];
    const variantImages = product.variants?.flatMap((v) => v.images || []).filter(Boolean) as string[] || [];
    const rawImagesList = [...(product.images || []), ...variantImages];
    return rawImagesList.length > 0 ? rawImagesList : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"];
  }, [product]);

  const scrollToActiveThumbnail = (index: number) => {
    if (!thumbnailsRef.current) return;
    const thumbsContainer = thumbnailsRef.current;
    const activeThumb = thumbsContainer.children[index] as HTMLElement;

    if (activeThumb) {
      const containerWidth = thumbsContainer.offsetWidth;
      const activeThumbWidth = activeThumb.offsetWidth;
      const activeThumbLeft = activeThumb.offsetLeft;
      const desiredScrollLeft = activeThumbLeft - (containerWidth / 2) + (activeThumbWidth / 2);

      thumbsContainer.scrollTo({ left: desiredScrollLeft, behavior: 'smooth' });
    }
  };

  const handleGalleryScroll = () => {
    if (!galleryRef.current) return;
    const width = galleryRef.current.clientWidth;
    const scrollLeft = galleryRef.current.scrollLeft;
    const index = Math.round(scrollLeft / width);

    if (index !== currentImage && index >= 0 && index < imagesList.length) {
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

  // Wholesale Engine calculations
  const currentUnitPrice = useMemo<number>(() => {
    if (!product) return 0;
    const price = product.measurement?.pricePerUnit || product.basePrice;
    if (quantity >= 500) return price * 0.95; // 5% bulk discount
    return price;
  }, [product, quantity]);

  const totalCalculatedPrice = useMemo<number>(() => {
    return currentUnitPrice * quantity;
  }, [currentUnitPrice, quantity]);

  const currentMaxStock = useMemo<number>(() => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return product?.stock ?? 0;
  }, [product]);

  const minAllowedQty = useMemo<number>(() => {
    if (product?.features?.measurement && product.measurement) {
      return product.measurement.minOrder || 1;
    }
    return 1;
  }, [product]);

  const handleStartOrder = () => {
    if (!product) return;
    navigate("/order", {
      state: {
        product,
        matrixOrders: selectedMatrixOrders.length > 0 ? selectedMatrixOrders : null,
        quantity,
        notes,
        calculatedPrice: totalCalculatedPrice,
        checkoutType: "direct_order"
      }
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-neutral-100 dark:bg-black flex flex-col justify-start items-center p-4">
        <div className="w-full max-w-7xl space-y-6 mt-16 animate-pulse">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="w-full aspect-square bg-neutral-200 dark:bg-neutral-900 rounded-2xl" />
            </div>
            <div className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl p-6 space-y-6">
              <div className="h-7 w-3/4 bg-neutral-300 dark:bg-neutral-800 rounded-xl" />
              <div className="h-14 w-full bg-neutral-100 dark:bg-neutral-950 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const visualCurrency = CURRENCY_SYMBOLS[product.currency] || product.currency || "₦";
  const businessIdString = typeof product.businessId === "object" ? product.businessId?._id : product.businessId;
  const businessName = typeof product.businessId === "object" ? product.businessId?.name : "Verified Supplier";

  return (
    <PhotoProvider maskOpacity={0.95}>
      <main className="min-h-screen bg-neutral-100 dark:bg-black text-slate-900 dark:text-neutral-100 pb-40 select-none touch-manipulation">

        {/* FLOATING TOP BAR NAVIGATION */}
        <nav className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-40 pointer-events-none">
          <button
            onClick={() => navigate(-1)}
            className="pointer-events-auto p-2.5 bg-neutral-900/60 dark:bg-neutral-900/90 backdrop-blur-md text-white rounded-full shadow-md border border-white/10 active:scale-95 transition-transform"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2 pointer-events-auto">
            <button className="p-2.5 bg-neutral-900/60 dark:bg-neutral-900/90 backdrop-blur-md text-white rounded-full shadow-md border border-white/10 active:scale-95 transition-transform">
              <Share2 size={18} />
            </button>
            <button 
              onClick={() => setIsLiked(!isLiked)} 
              className={`p-2.5 bg-neutral-900/60 dark:bg-neutral-900/90 backdrop-blur-md rounded-full shadow-md border border-white/10 transition-colors active:scale-95 ${isLiked ? 'text-amber-500' : 'text-white'}`}
            >
              <Heart size={18} className={isLiked ? "fill-amber-500 text-amber-500" : ""} />
            </button>
          </div>
        </nav>

        {/* MAIN BODY CONTAINER */}
        <div className="max-w-7xl mx-auto md:pt-16 md:px-4">
          <div className="flex flex-col md:flex-row gap-4">

            {/* PRODUCT IMAGES GALLERY */}
            <div className="w-full md:w-5/12 relative bg-white dark:bg-neutral-900 md:rounded-2xl overflow-hidden shadow-sm self-start">
              <div
                ref={galleryRef}
                onScroll={handleGalleryScroll}
                className="w-full aspect-square flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {imagesList.map((img: string, i: number) => (
                  <div key={i} className="w-full h-full flex-shrink-0 snap-center cursor-pointer">
                    <PhotoView src={img}>
                      <img src={img} className="w-full h-full object-contain bg-white dark:bg-neutral-900" alt="" />
                    </PhotoView>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                {currentImage + 1} / {imagesList.length}
              </div>

              <div ref={thumbnailsRef} className="hidden md:flex gap-2 p-4 overflow-x-auto border-t border-neutral-100 dark:border-neutral-800/60 scroll-smooth">
                {imagesList.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleThumbClick(i)}
                    className={`w-14 h-14 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                      currentImage === i ? 'border-amber-500 opacity-100' : 'border-transparent opacity-50'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>

            {/* PRODUCT SPECS & ACTIONS RIGHT PANEL */}
            <div className="flex-1 space-y-3">
              
              {/* BRANDING & PRICE CONTAINER */}
              <div className="bg-white dark:bg-neutral-900 p-4 md:p-6 md:rounded-2xl shadow-xs border-b md:border border-neutral-200/40 dark:border-neutral-800/60">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-sm inline-block">
                    {product.category || 'Wholesale Hub'} • {product.condition || 'New'}
                  </span>
                  <h1 className="text-base md:text-xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
                    {product.name}
                  </h1>
                </div>

                <div className="mt-4 p-3 bg-gradient-to-r from-amber-50/60 to-amber-100/20 dark:from-neutral-950 dark:to-neutral-950 rounded-xl border border-amber-100/40 dark:border-neutral-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-500">
                      {visualCurrency}{currentUnitPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      /{product.measurement?.unit || 'Piece'}
                    </span>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-amber-200/20 flex justify-between text-[11px] font-medium text-slate-500 dark:text-neutral-400">
                    <div>MOQ: <span className="text-slate-900 dark:text-white font-bold">{minAllowedQty} {product.measurement?.unit || 'Units'}</span></div>
                    <div>Availability: <span className={currentMaxStock > 0 ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>{currentMaxStock > 0 ? `${currentMaxStock} Pieces` : 'Out of Stock'}</span></div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-neutral-400 pt-2">
                  <div className="flex items-center gap-2">
                    <img src="https://flagcdn.com/16x12/ng.png" className="w-3.5 h-2.5 rounded-xs inline-block" alt="" />
                    <Truck size={14} className="text-slate-400" />
                    <span>Shipping metrics calculated at transaction generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Trade Assurance safeguards your orders</span>
                  </div>
                </div>
              </div>

              {/* SUPPLIER INFO */}
              {businessIdString && (
                <div
                  onClick={() => navigate(`/business/${businessIdString}/public`)}
                  className="bg-white dark:bg-neutral-900 p-4 md:rounded-2xl shadow-xs flex items-center justify-between border-y md:border border-neutral-200/40 dark:border-neutral-800/40 cursor-pointer hover:opacity-95 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-600 text-white rounded-lg flex items-center justify-center font-black text-sm shadow-inner">
                      {businessName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-neutral-100 text-xs flex items-center gap-1">
                        {businessName} <Verified size={13} className="text-amber-500 fill-amber-500" />
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">Verified Supplier</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-400" />
                </div>
              )}

              {/* VARIATION SELECTOR */}
              {product.variants && product.variants.length > 0 && (
                <VariantSelector
                  variants={product.variants || []}
                  measurement={product.measurement}
                  basePrice={product.basePrice}
                  currencySymbol={visualCurrency}
                  defaultImage={imagesList[0]}
                  isOpen={isVariantModalOpen}
                  setIsOpen={setIsVariantModalOpen}
                  onConfirm={(orders) => {
                    setSelectedMatrixOrders(orders);
                    const totalQty = orders.reduce((sum, o) => sum + o.qty, 0);
                    if (totalQty > 0) setQuantity(totalQty);
                  }}
                />
              )}

              {/* MANUAL QUANTITY CONTROLLER (SHOWS IF NO VARIANTS Exist) */}
            

              {/* SOURCING REQUIREMENTS */}
              <div className="bg-white dark:bg-neutral-900 p-4 md:rounded-2xl shadow-xs border-y md:border border-neutral-200/40 dark:border-neutral-800/60">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Sourcing Requirements</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specify custom branding parameters, tailoring configurations, or special delivery logistics..."
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white resize-none min-h-[75px] transition-colors"
                />
              </div>

              {/* ORIGIN REGIONS */}
              {product.origin && (
                <div className="p-3 bg-white dark:bg-neutral-900 md:rounded-2xl border-y md:border border-neutral-200/40 dark:border-neutral-800/60 flex gap-6 text-[11px] text-slate-500">
                  <div>Export Region: <span className="text-slate-900 dark:text-neutral-200 font-bold">{product.origin.country}</span></div>
                  <div>Distribution Hub: <span className="text-slate-900 dark:text-neutral-200 font-bold">{product.origin.city}</span></div>
                </div>
              )}

              {/* SPECIFICATIONS */}
              <div className="bg-white dark:bg-neutral-900 p-4 md:rounded-2xl shadow-xs border-y md:border border-neutral-200/40 dark:border-neutral-800/60">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide mb-2">Product Specifications</h3>
                <p className="text-slate-600 dark:text-neutral-400 leading-relaxed text-xs">
                  {product.description?.trim() ? product.description : "No additional specifications declared for this B2B wholesale item."}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* BOTTOM FIXED APP ACTION BAR */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 z-30 flex items-center justify-between gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          {/* <button className="flex flex-col items-center justify-center text-slate-600 dark:text-neutral-400 active:scale-95 transition-transform px-2">
            <MessageSquare size={20} className="text-slate-700 dark:text-neutral-300" />
            <span className="text-[10px] mt-0.5 font-medium whitespace-nowrap">Chat Now</span>
          </button> */}

          <div className="flex-1 grid grid-cols-2 gap-2">
            {/* <button
              disabled={currentMaxStock <= 0}
              onClick={() => setIsVariantModalOpen(true)}
              className="w-full h-11 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 border border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/30 dark:bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={14} />
              <span>Add to Cart</span>
            </button> */}

            <button
              onClick={() => {
                if (product.variants && product.variants.length > 0 && selectedMatrixOrders.length === 0) {
                  setIsVariantModalOpen(true);
                } else {
                  handleStartOrder();
                }
              }}
              disabled={currentMaxStock <= 0 || quantity < minAllowedQty}
              className="w-full h-11 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-500/20 disabled:from-neutral-300 disabled:to-neutral-300 dark:disabled:from-neutral-800 dark:disabled:to-neutral-800 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              <Zap size={14} className="fill-white" />
              <span>{selectedMatrixOrders.length > 0 ? `Start Order (${quantity})` : 'Start Order'}</span>
            </button>
          </div>
        </div>

      </main>
    </PhotoProvider>
  );
}