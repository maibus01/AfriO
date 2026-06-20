import { useEffect, useState } from "react";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ChevronRight,
  MessageCircle,
  ShoppingBag,
  Ruler,
  MessageSquare,
  Verified,
  Eye,
  X,
  Loader2,
  CreditCard,
  ChevronLeft
} from "lucide-react";
import API from "../api/User";
import { useNavigate } from "react-router-dom";

const MyOrdersHub = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Picker States
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [allMeasurements, setAllMeasurements] = useState<any[]>([]);
  const [attachingId, setAttachingId] = useState<string | null>(null);
  
  // Fullscreen Image Lightbox States
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const navigate = useNavigate();

  useEffect(() => {
    Object.defineProperty(window, 'crypto', { value: { getRandomValues: (arr: any) => arr } });
    fetchEverything();
  }, []);

  const fetchEverything = async () => {
    try {
      const [ordersRes, requestsRes] = await Promise.all([
        API.get("/orders/me"),
        API.get("/tailor-requests/my")
      ]);

      const standardOrders = ordersRes.data.orders || ordersRes.data.data || ordersRes.data || [];
      const tailorRequests = requestsRes.data.data || requestsRes.data || [];

      const normalizedRequests = tailorRequests.map((req: any) => ({
        ...req,
        _id: req._id,
        isCustomTailoring: true,
        createdAt: req.createdAt,
        totalPrice: req.finalPrice || 0,
        refNumber: req.refNumber || req._id.substring(req._id.length - 8).toUpperCase()
      }));

      const combined = [...standardOrders, ...normalizedRequests].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(combined);
    } catch (err) {
      console.error("Error aggregating order history:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMeasurements = async () => {
    try {
      const res = await API.get("/measurements");
      setAllMeasurements(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttachMeasurement = async (measurementId: string) => {
    if (!selectedRequest) return;
    try {
      setAttachingId(measurementId);
      await API.patch(`/tailor-requests/${selectedRequest._id}/add-measurement`, { measurementId });
      await fetchEverything();
      setShowPicker(false);
      setShowMeasurement(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error("Attach measurement error:", err);
    } finally {
      setAttachingId(null);
    }
  };

  const handleWhatsAppSupport = (item: any, variantName?: string) => {
    const phone = "2349027456061";
    const refText = item.refNumber || item._id?.slice(-6).toUpperCase();
    const itemName = item.isCustomTailoring 
      ? (item.styleId?.title || "Bespoke Design") 
      : `${item.productId?.name || "Catalog Item"} ${variantName ? `(${variantName})` : ""}`;
    
    const message = encodeURIComponent(
      `✨ *AFRIO CUSTOMER SUPPORT*\n\nHello, I need assistance regarding my order/request:\n• *Item:* ${itemName}\n• *Reference Code:* #${refText}\n• *Date:* ${new Date(item.createdAt).toLocaleDateString()}`
    );
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${message}`, "_blank");
  };

  const getStoreStatusConfig = (status: string) => {
    switch (status) {
      case "pending_payment":
        return { label: "Awaiting Confirmation", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-500/20", icon: <Clock size={12} />, step: 1 };
      case "processing":
        return { label: "In Production", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-500/20", icon: <Package size={12} />, step: 2 };
      case "delivered":
        return { label: "On Its Way", color: "text-purple-600 bg-purple-50 dark:bg-purple-950/20 border-purple-500/20", icon: <Truck size={12} />, step: 3 };
      case "completed":
        return { label: "Delivered", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/20", icon: <CheckCircle2 size={12} />, step: 4 };
      default:
        return { label: status, color: "text-slate-600 bg-slate-50 border-slate-200", icon: <Package size={12} />, step: 0 };
    }
  };

  const getTailorStatusStyles = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "pending": return "text-amber-600 bg-amber-50 border-amber-200";
      case "accepted": return "text-blue-600 bg-blue-50 border-blue-200";
      case "in_progress": return "text-purple-600 bg-purple-50 border-purple-200";
      case "completed": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "rejected": return "text-rose-600 bg-rose-50 border-rose-200";
      default: return "text-slate-500 bg-slate-50 border-slate-200";
    }
  };

  const getItemCategoryLabel = (item: any) => {
    if (item.isCustomTailoring) return "Bespoke Design";
    const category = item.productId?.category?.toLowerCase() || "";
    const name = item.productId?.name?.toLowerCase() || "";
    if (category.includes("fabric") || name.includes("fabric")) return "Fabric Order";
    if (category.includes("cap") || name.includes("cap") || name.includes("hat")) return "Traditional Cap";
    return "Ready-To-Wear Store Item";
  };

  const triggerLightbox = (images: string | string[]) => {
    if (!images) return;
    const itemsArray = Array.isArray(images) ? images.filter(Boolean) : [images];
    if (itemsArray.length === 0) return;
    setLightboxImages(itemsArray);
    setActiveImageIndex(0);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-black flex flex-col justify-start items-center p-4">
        <div className="w-full max-w-xl space-y-4 mt-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-neutral-800/60">
            <div className="space-y-2">
              <div className="h-6 w-44 bg-slate-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
              <div className="h-3 w-48 bg-slate-100 dark:bg-neutral-800/60 rounded animate-pulse" />
            </div>
            <div className="h-8 w-8 bg-slate-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 border border-slate-200 rounded-xl p-4 space-y-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-20 bg-slate-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 bg-slate-200 rounded" />
                  <div className="h-3 w-1/4 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 min-h-screen bg-slate-50 dark:bg-black select-none">
      {/* BRAND SYSTEM HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Order Management
          </h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">Track variants and design history</p>
        </div>
        <div className="h-8 w-8 bg-black dark:bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center text-xs text-amber-500 font-mono font-bold">A</div>
      </div>

      {/* STREAM LIST BLOCK */}
      <div className="space-y-4">
        {orders.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-sm">
            <ShoppingBag size={32} className="mx-auto text-slate-300 dark:text-neutral-700 mb-3" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your history ledger is empty</p>
          </div>
        )}

        {orders.map((item) => {
          const itemTypeLabel = getItemCategoryLabel(item);

          // ----------------------------------------------------
          // RENDERING STYLE A: BESPOKE / TAILOR CONFIG LIST
          // ----------------------------------------------------
          if (item.isCustomTailoring) {
            return (
              <div key={item._id} className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800/60 rounded-xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-neutral-700 transition-all">
                <div className="flex gap-4">
                  {item.styleId?.image && (
                    <div className="relative shrink-0 group cursor-pointer" onClick={() => triggerLightbox(item.styleId?.image)}>
                      <img src={item.styleId?.image} className="w-16 h-20 object-cover rounded-lg bg-slate-50 border border-slate-200 dark:border-neutral-800" alt="" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                        <Eye size={14} className="text-white" />
                      </div>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className="text-[9px] font-extrabold tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded uppercase">
                          {itemTypeLabel}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                          <Clock size={10} /> {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-neutral-100 text-sm truncate">
                        {item.styleId?.title || "Custom Fitting Session"}
                      </h3>

                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-4 h-4 bg-slate-900 rounded flex items-center justify-center text-[8px] text-white font-black">
                          {(item.businessId?.name || "T").charAt(0).toUpperCase()}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-bold flex items-center gap-0.5">
                          {item.businessId?.name || "Master Tailor"} <Verified size={10} className="text-blue-500 inline" />
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800/40">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getTailorStatusStyles(item.status)}`}>
                        {item.status?.replace("_", " ")}
                      </span>
                      {item.finalPrice && (
                        <p className="text-xs font-black text-slate-900 dark:text-white">₦{item.finalPrice.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800/40">
                  <button 
                    onClick={() => { setSelectedRequest(item); setShowMeasurement(true); }}
                    className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border ${
                      item.measurementSnapshot 
                        ? "bg-slate-50 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-neutral-700" 
                        : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900"
                    }`}
                  >
                    <Ruler size={12} /> {item.measurementSnapshot ? "Fit Profile" : "Provide Size"}
                  </button>
                  
                  {item.finalPrice && !(item.status === "in_progress" || item.status === "completed") ? (
                    <button 
                      onClick={() => navigate("/request-payment", { state: { request: item } })}
                      className="bg-amber-500 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <CreditCard size={12} /> Pay Balance
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleWhatsAppSupport(item)} 
                      className="bg-slate-900 dark:bg-neutral-800 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare size={12} /> Support Chat
                    </button>
                  )}
                </div>
              </div>
            );
          }

          // ----------------------------------------------------
          // RENDERING STYLE B: READY-TO-WEAR RETAIL ITEMS
          // ----------------------------------------------------
          const config = getStoreStatusConfig(item.customerStatus);
          const masterProductImage = item.productId?.images?.[0] || item.productId?.image || "";
          const totalItemsCount = item.items?.length || 1;

          return (
            <div key={item._id} className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800/60 rounded-xl p-4 shadow-sm space-y-4">
              
              {/* ORDER GROUP TOP METADATA BAR */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-neutral-800/60">
                <div>
                  <span className="text-[9px] font-extrabold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-1.5 py-0.5 rounded uppercase mr-2">
                    {itemTypeLabel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">REF: #{item.refNumber}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>

              {/* REAL STATUS WORKFLOW MAPPER */}
              <div className="bg-slate-50 dark:bg-neutral-950 p-3 rounded-xl border border-slate-100 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Order Journey Map</p>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${config.color} flex items-center gap-1`}>
                    {config.icon} {config.label}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((stepNumber) => (
                    <div key={stepNumber} className="flex-1">
                      <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                        stepNumber <= config.step ? 'bg-amber-500 shadow-sm shadow-amber-500/50' : 'bg-slate-200 dark:bg-neutral-800'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* DYNAMIC VARIANT CARDS LIST - WITH DEDICATED INDIVIDUAL IMAGES */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ordered Variants ({totalItemsCount})</p>
                
                {item.items && item.items.length > 0 ? (
                  item.items.map((subItem: any, index: number) => {
                    // Match the distinct image for this specific SKU variant, fallback to master catalog asset
                    const variantVisualSource = subItem.variantId?.image || subItem.image || masterProductImage;

                    return (
                      <div key={subItem._id || index} className="flex gap-3 bg-slate-50/70 dark:bg-neutral-800/30 p-3 rounded-xl border border-slate-100 dark:border-neutral-800/40 items-center">
                        {variantVisualSource && (
                          <div 
                            className="relative shrink-0 group cursor-pointer" 
                            onClick={() => triggerLightbox(variantVisualSource)}
                            title="Click to view full screen"
                          >
                            <img 
                              src={variantVisualSource} 
                              alt="Variant context" 
                              className="w-14 h-16 object-cover rounded-lg border border-slate-200 dark:border-neutral-700 bg-white" 
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                              <Eye size={12} className="text-white" />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-neutral-100 truncate">
                            {item.productId?.name || "Catalog Product Item"}
                          </h4>
                          <p className="text-[11px] font-medium text-slate-500 dark:text-neutral-400 mt-0.5">
                            SKU Variant: <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{subItem.sku || subItem.variantId?.name || "Standard Size"}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Unit Price: ₦{(subItem.unitPrice || 0).toLocaleString()}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-neutral-800 px-2 py-1 rounded-md">
                            x{subItem.quantity || 1}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  /* LEGACY BACKWARD COMPATIBLE FALLBACK RENDERING ROW */
                  <div className="flex gap-3 bg-slate-50/70 dark:bg-neutral-800/30 p-3 rounded-xl border border-slate-100 dark:border-neutral-800/40 items-center">
                    {masterProductImage && (
                      <div className="relative shrink-0 group cursor-pointer" onClick={() => triggerLightbox(masterProductImage)}>
                        <img src={masterProductImage} alt="Base model asset" className="w-14 h-16 object-cover rounded-lg border border-slate-200 dark:border-neutral-700 bg-white" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity"><Eye size={12} className="text-white" /></div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-neutral-100 truncate">{item.productId?.name || "Catalog Purchase"}</h4>
                      <p className="text-[11px] text-slate-400 italic mt-0.5">Standard Base Setup Configuration</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-neutral-800 px-2 py-1 rounded-md">x{item.quantity || 1}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER TOTAL BALANCE CONTROL ACTION MODULE */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-neutral-800/40">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Aggregate Gross Total</p>
                  <p className="text-sm font-black text-slate-900 dark:text-amber-500">₦{(item.totalPrice || 0).toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleWhatsAppSupport(item)}
                    className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                    title="Open Helpdesk Line"
                  >
                    <MessageCircle size={16} />
                  </button>
                  
                  <button 
                    onClick={() => item.productId?._id && navigate(`/product/${item.productId._id}`)}
                    disabled={!item.productId?._id}
                    className="p-2 bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 disabled:opacity-40"
                    title="View Base Details Page"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* --- FLOATING LIGHTBOX FULLSCREEN PREVIEW --- */}
      {lightboxImages.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-4 select-none">
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white text-xs font-bold font-mono">
            <span>PREVIEWING TARGET ASSET</span>
            <button 
              className="text-white bg-neutral-900 border border-neutral-800 p-2.5 rounded-full transition-transform active:scale-95"
              onClick={() => setLightboxImages([])}
            >
              <X size={16} />
            </button>
          </div>

          <div className="relative w-full max-w-lg h-[70vh] flex items-center justify-center">
            {lightboxImages.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => (prev === 0 ? lightboxImages.length - 1 : prev - 1));
                }}
                className="absolute left-2 z-10 bg-neutral-900/80 border border-neutral-800 text-white p-3 rounded-full"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            <img 
              src={lightboxImages[activeImageIndex]} 
              className="rounded-xl object-contain max-w-full max-h-[70vh] shadow-2xl transition-all duration-300" 
              alt="Expanded preview workspace" 
            />

            {lightboxImages.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => (prev === lightboxImages.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-2 z-10 bg-neutral-900/80 border border-neutral-800 text-white p-3 rounded-full"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- PREUSABLE TAILOR SIZE DETAILS SHEET MODAL --- */}
      {showMeasurement && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[999] p-4">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 border border-slate-200 dark:border-neutral-800 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Garment Size Specs</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Locker Profile: {selectedRequest.measurementId?.label || "Unassigned"}</p>
              </div>
              <button onClick={() => { setShowMeasurement(false); setShowPicker(false); }} className="p-2 bg-slate-50 dark:bg-neutral-800 rounded-full"><X size={14} /></button>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 pb-2">
              {!selectedRequest.measurementSnapshot && !showPicker && (
                <div className="text-center py-8 bg-slate-50 dark:bg-neutral-800/40 rounded-xl border border-dashed border-slate-200 dark:border-neutral-700">
                  <Ruler size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-[11px] font-medium text-slate-400 mb-3">No dimensions linked to this order yet.</p>
                  <button 
                    onClick={() => { fetchAllMeasurements(); setShowPicker(true); }}
                    className="bg-amber-500 text-white px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest"
                  >
                    Load From Locker
                  </button>
                </div>
              )}

              {showPicker && (
                <div className="space-y-1.5">
                  {allMeasurements.length > 0 ? (
                    allMeasurements.map((m) => (
                      <button
                        key={m._id}
                        disabled={attachingId === m._id}
                        onClick={() => handleAttachMeasurement(m._id)}
                        className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-800/60 rounded-xl border border-slate-100 dark:border-transparent hover:border-amber-500 transition-all"
                      >
                        <span className="text-xs font-bold text-slate-800 dark:text-neutral-200">{m.label}</span>
                        {attachingId === m._id ? <Loader2 size={14} className="animate-spin text-amber-500" /> : <CheckCircle2 size={14} className="text-slate-300" />}
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-xs text-slate-400 py-4">No dimension vectors found.</p>
                  )}
                </div>
              )}

              {selectedRequest.measurementSnapshot && (
                <div className="space-y-4">
                  {['upperBody', 'lowerBody', 'extras'].map((part) => (
                    selectedRequest.measurementSnapshot?.[part] && (
                      <div key={part} className="space-y-1">
                        <p className="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 w-fit px-1.5 py-0.5 rounded uppercase tracking-wider">{part}</p>
                        {Object.entries(selectedRequest.measurementSnapshot[part]).map(([k, v]: any) => (
                          v ? (
                            <div key={k} className="flex justify-between border-b border-slate-100 dark:border-neutral-800/40 py-1.5 text-xs">
                              <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="font-bold text-slate-900 dark:text-neutral-200">{v}"</span>
                            </div>
                          ) : null
                        ))}
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
            
            <button onClick={() => { setShowMeasurement(false); setShowPicker(false); }} className="w-full mt-4 bg-slate-900 dark:bg-neutral-800 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">
              Close Sheet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersHub;