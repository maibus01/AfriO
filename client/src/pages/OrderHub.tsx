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
  CreditCard
} from "lucide-react";
import API from "../api/User";
import { useNavigate } from "react-router-dom";

interface OrderData {
  _id: string;
  refNumber: string;
  customerStatus: "pending_payment" | "processing" | "delivered" | "completed";
  quantity: number;
  totalPrice: number;
  productId: {
    _id: string;
    name: string;
    images: string[];
    category?: string;
  };
  createdAt: string;
  isCustomTailoring?: boolean;
}

const MyOrdersHub = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Picker States
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [allMeasurements, setAllMeasurements] = useState<any[]>([]);
  const [attachingId, setAttachingId] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);

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

      const standardOrders = ordersRes.data.orders || [];
      const tailorRequests = requestsRes.data.data || [];

      const normalizedRequests = tailorRequests.map((req: any) => ({
        ...req,
        _id: req._id,
        isCustomTailoring: true,
        createdAt: req.createdAt,
        totalPrice: req.finalPrice || 0,
        refNumber: req._id.substring(req._id.length - 8).toUpperCase()
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

  // WhatsApp Routing Handler
  const handleWhatsAppSupport = (item: any) => {
    const phone = "2349027456061";
    const refText = item.refNumber || item._id?.slice(-6).toUpperCase();
    const itemName = item.isCustomTailoring ? (item.styleId?.title || "Bespoke Design") : (item.productId?.name || "Catalog Item");
    
    const message = encodeURIComponent(
      `✨ *LUXEEHUB CUSTOMER SUPPORT*\n\nHello, I need assistance regarding my order/request:\n• *Item:* ${itemName}\n• *Reference Code:* #${refText}\n• *Date:* ${new Date(item.createdAt).toLocaleDateString()}`
    );
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${message}`, "_blank");
  };

  const getStoreStatusConfig = (status: string) => {
    switch (status) {
      case "pending_payment":
        return { label: "Awaiting Confirmation", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-100/50", icon: <Clock size={12} />, step: 1 };
      case "processing":
        return { label: "In Production", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-100/50", icon: <Package size={12} />, step: 2 };
      case "delivered":
        return { label: "On Its Way", color: "text-purple-600 bg-purple-50 dark:bg-purple-950/20 border-purple-100/50", icon: <Truck size={12} />, step: 3 };
      case "completed":
        return { label: "Delivered", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100/50", icon: <CheckCircle2 size={12} />, step: 4 };
      default:
        return { label: status, color: "text-slate-600 bg-slate-50 border-slate-100", icon: <Package size={12} />, step: 0 };
    }
  };

  const getTailorStatusStyles = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "pending": return "text-amber-600 bg-amber-50 border-amber-100/70";
      case "accepted": return "text-blue-600 bg-blue-50 border-blue-100/70";
      case "in_progress": return "text-purple-600 bg-purple-50 border-purple-100/70";
      case "completed": return "text-emerald-600 bg-emerald-50 border-emerald-100/70";
      case "rejected": return "text-rose-600 bg-rose-50 border-rose-100/70";
      default: return "text-slate-500 bg-slate-50 border-slate-100";
    }
  };

  const getItemCategoryLabel = (item: any) => {
    if (item.isCustomTailoring) {
      return item.styleId ? "Bespoke Design" : "Tailor Request";
    }
    const category = item.productId?.category?.toLowerCase() || "";
    const name = item.productId?.name?.toLowerCase() || "";
    if (category.includes("fabric") || name.includes("fabric")) return "Fabric Order";
    if (category.includes("cap") || name.includes("cap") || name.includes("hat")) return "Traditional Cap";
    return "Ready-To-Wear Store Item";
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-black flex flex-col justify-start items-center p-4">
        <div className="w-full max-w-xl space-y-4 mt-4">
          
          {/* Header Management Skeleton Block */}
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-neutral-800/60 pb-4">
            <div className="space-y-2">
              <div className="h-6 w-44 bg-slate-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
              <div className="h-3 w-48 bg-slate-100 dark:bg-neutral-800/60 rounded animate-pulse" />
            </div>
            <div className="h-8 w-8 bg-slate-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
          </div>

          {/* Combined Order Feed Stream Shimmer */}
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800/80 rounded-xl p-4 space-y-4 shadow-sm animate-pulse"
            >
              <div className="flex gap-4 items-start">
                {/* Clickable Mock Thumbnail Image */}
                <div className="w-16 h-20 bg-slate-200 dark:bg-neutral-800 rounded-lg shrink-0" />
                
                {/* Content Descriptor Lines */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex justify-between items-center">
                    <div className="h-3.5 w-24 bg-slate-200 dark:bg-neutral-800 rounded" />
                    <div className="h-3 w-16 bg-slate-100 dark:bg-neutral-800/60 rounded" />
                  </div>
                  <div className="h-4 w-3/4 bg-slate-300 dark:bg-neutral-800 rounded" />
                  <div className="h-3 w-20 bg-slate-100 dark:bg-neutral-800/60 rounded" />
                  <div className="h-4 w-28 bg-slate-200 dark:bg-neutral-800 rounded" />
                </div>
              </div>

              {/* Progress Line / Metrics Indicator Space */}
              <div className="h-1 w-full bg-slate-100 dark:bg-neutral-800/60 rounded-full" />

              {/* Lower Functional Area Layout Sync */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-neutral-800/40">
                <div className="space-y-1">
                  <div className="h-2 w-8 bg-slate-100 dark:bg-neutral-800/60 rounded" />
                  <div className="h-3 w-16 bg-slate-200 dark:bg-neutral-800 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-neutral-800 rounded-lg" />
                  <div className="w-8 h-8 bg-slate-100 dark:bg-neutral-800 rounded-lg" />
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
          <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">Track and manage your bookings</p>
        </div>
        <div className="h-8 w-8 bg-black dark:bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center text-xs text-amber-500 font-mono font-bold">L</div>
      </div>

      {/* STREAM LIST BLOCK */}
      <div className="space-y-3">
        {orders.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-2xl shadow-sm">
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
              <div key={item._id} className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800/60 rounded-xl p-4 shadow-sm hover:border-slate-200 transition-all">
                <div className="flex gap-4">
                  {item.styleId?.image && (
                    <div className="relative shrink-0 group cursor-pointer" onClick={() => setShowImagePreview(item.styleId?.image)}>
                      <img src={item.styleId?.image} className="w-16 h-20 object-cover rounded-lg bg-slate-50 border border-slate-100 dark:border-neutral-800 group-hover:brightness-90 transition-all" alt="" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                        <Eye size={12} className="text-white" />
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

                    <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-50 dark:border-neutral-800/40">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getTailorStatusStyles(item.status)}`}>
                        {item.status?.replace("_", " ")}
                      </span>
                      
                      {item.finalPrice ? (
                        <p className="text-xs font-black text-slate-900 dark:text-white">
                          ₦{item.finalPrice.toLocaleString()}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* LOWER INTERACTIVE OPERATIONS SECTION */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-50 dark:border-neutral-800/40">
                  <button 
                    onClick={() => { setSelectedRequest(item); setShowMeasurement(true); }}
                    className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border ${
                      item.measurementSnapshot 
                        ? "bg-slate-50 dark:bg-neutral-800/50 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-neutral-700" 
                        : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100/50"
                    }`}
                  >
                    <Ruler size={12} /> {item.measurementSnapshot ? "Fit Profile" : "Provide Size"}
                  </button>
                  
                  {item.finalPrice && !(item.status === "in_progress" || item.status === "completed") ? (
                    <button 
                      onClick={() => navigate("/request-payment", { state: { request: item } })}
                      className="bg-amber-500 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm shadow-amber-500/10"
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
          return (
            <div key={item._id} className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800/60 rounded-xl p-4 shadow-sm hover:border-slate-200 transition-all">
              <div className="flex gap-4 items-start mb-3">
                {item.productId?.images?.[0] && (
                  <div className="relative shrink-0 group cursor-pointer" onClick={() => setShowImagePreview(item.productId.images[0])}>
                    <img src={item.productId.images[0]} alt="" className="w-16 h-18 object-cover rounded-lg border border-slate-100 dark:border-neutral-800 bg-slate-50 group-hover:brightness-95 transition-all" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                      <Eye size={12} className="text-white" />
                    </div>
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] font-extrabold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-1.5 py-0.5 rounded uppercase">
                      {itemTypeLabel}
                    </span>
                    <p className="text-[9px] font-medium text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100 truncate">
                    {item.productId?.name || "Premium Catalog Purchase"}
                  </h3>

                  <p className="text-[9px] font-mono text-slate-400 tracking-tight">
                    REF: #{item.refNumber}
                  </p>

                  <div className="pt-1">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${config.color} inline-flex items-center gap-1`}>
                      {config.icon} {config.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* CLEAN HORIZONTAL MINIMAL METRIC PROGRESS BAR */}
              <div className="flex gap-1 py-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${i <= config.step ? 'bg-slate-900 dark:bg-amber-500' : 'bg-slate-100 dark:bg-neutral-800'}`} 
                  />
                ))}
              </div>

              {/* COMPACT DATA ACCOUNT BLOCK FOOTER */}
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-50 dark:border-neutral-800/40">
                <div className="flex gap-4">
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Qty</p>
                    <p className="text-xs font-black text-slate-800 dark:text-neutral-200">{item.quantity}x</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Total Ledger</p>
                    <p className="text-xs font-black text-slate-800 dark:text-neutral-200">₦{item.totalPrice.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* WhatsApp Support Direct Hook */}
                  <button 
                    onClick={() => handleWhatsAppSupport(item)}
                    className="p-2 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle size={16} className="hover:scale-110 transition-transform" />
                  </button>
                  
                  {/* Redirect Straight to Active Catalog Product View */}
                  <button 
                    onClick={() => {
                      if (item.productId?._id) {
                        navigate(`/product/${item.productId._id}`);
                      }
                    }}
                    disabled={!item.productId?._id}
                    className="p-2 bg-slate-50 dark:bg-neutral-800 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700 transition-all disabled:opacity-40"
                    title="View Product Page"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- PREUSABLE SYSTEM SHEET MODALS --- */}
      {showImagePreview && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4" onClick={() => setShowImagePreview(null)}>
          <div className="relative max-w-full max-h-[80vh]">
            <button 
              className="absolute -top-10 right-0 text-white bg-neutral-900/80 p-2 rounded-full border border-neutral-800"
              onClick={() => setShowImagePreview(null)}
            >
              <X size={16} />
            </button>
            <img src={showImagePreview} className="rounded-xl object-contain shadow-2xl max-w-full max-h-[75vh]" alt="Preview" />
          </div>
        </div>
      )}

      {showMeasurement && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[999] p-4">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 overflow-hidden border border-slate-100 dark:border-neutral-800 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Garment Size Specs</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Locker Profile: {selectedRequest.measurementId?.label || "Unassigned"}</p>
              </div>
              <button onClick={() => { setShowMeasurement(false); setShowPicker(false); }} className="p-2 bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 rounded-full"><X size={14} /></button>
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