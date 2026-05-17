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
    name: string;
    images: string[];
    category?: string;
  };
  createdAt: string;
  isCustomTailoring?: boolean; // Formatted flag
}

const MyOrdersHub = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Picker States from RequestManager
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
      // Parallel execution to pull standard orders and raw custom requests
      const [ordersRes, requestsRes] = await Promise.all([
        API.get("/orders/me"),
        API.get("/tailor-requests/my")
      ]);

      const standardOrders = ordersRes.data.orders || [];
      const tailorRequests = requestsRes.data.data || [];

      // Normalize tailor requests to uniform structural layout for a shared list map
      const normalizedRequests = tailorRequests.map((req: any) => ({
        ...req,
        _id: req._id,
        isCustomTailoring: true,
        createdAt: req.createdAt,
        totalPrice: req.finalPrice || 0,
        refNumber: req._id.substring(req._id.length - 8).toUpperCase()
      }));

      // Combine and sort chronologically (Newest First)
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

  // Status mapping for standard inventory items
  const getStoreStatusConfig = (status: string) => {
    switch (status) {
      case "pending_payment":
        return { label: "Awaiting Confirmation", color: "text-orange-600 bg-orange-50", icon: <Clock size={12} />, step: 1 };
      case "processing":
        return { label: "In Production", color: "text-blue-600 bg-blue-50", icon: <Package size={12} />, step: 2 };
      case "delivered":
        return { label: "On Its Way", color: "text-purple-600 bg-purple-50", icon: <Truck size={12} />, step: 3 };
      case "completed":
        return { label: "Delivered & Signed", color: "text-green-600 bg-green-50", icon: <CheckCircle2 size={12} />, step: 4 };
      default:
        return { label: status, color: "text-gray-600 bg-gray-50", icon: <Package size={12} />, step: 0 };
    }
  };

  // Status mapping for custom tailor bids
  const getTailorStatusStyles = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "pending": return "text-orange-500 bg-orange-50 border-orange-100";
      case "accepted": return "text-blue-600 bg-blue-50 border-blue-100";
      case "in_progress": return "text-purple-600 bg-purple-50 border-purple-100";
      case "completed": return "text-green-600 bg-green-50 border-green-100";
      case "rejected": return "text-red-600 bg-red-50 border-red-100";
      default: return "text-slate-500 bg-slate-50 border-slate-100";
    }
  };

  // Determines the clean sub-header tag based on product categorization
  const getItemCategoryLabel = (item: any) => {
    if (item.isCustomTailoring) {
      return item.styleId ? "Custom Design from Tailor" : "Tailor Request";
    }
    const category = item.productId?.category?.toLowerCase() || "";
    const name = item.productId?.name?.toLowerCase() || "";
    if (category.includes("fabric") || name.includes("fabric")) return "Fabric Order";
    if (category.includes("cap") || name.includes("cap") || name.includes("hat")) return "Traditional Cap";
    return "Ready-To-Wear Store Item";
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-lg" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 bg-gray-100 animate-pulse rounded-[2.5rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pb-24 min-h-screen bg-white">
      {/* AMAZON SYSTEM HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
          Your Orders
        </h1>
        <div className="h-1 w-12 bg-black mt-2 rounded-full" />
      </div>

      {/* TIMELINE LIST STREAMS */}
      <div className="space-y-6">
        {orders.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-slate-100 rounded-[3rem]">
            <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Your shopping list is empty</p>
          </div>
        )}

        {orders.map((item) => {
          const itemTypeLabel = getItemCategoryLabel(item);

          // Render Custom Bespoke Request Elements
          if (item.isCustomTailoring) {
            return (
              <div key={item._id} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="flex gap-5">
                  {item.styleId?.image && (
                    <div className="relative shrink-0 group" onClick={() => setShowImagePreview(item.styleId?.image)}>
                      <img src={item.styleId?.image} className="w-20 h-28 object-cover rounded-[1.5rem] bg-slate-50 cursor-zoom-in border border-slate-100" alt="" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-opacity">
                        <Eye size={16} className="text-white" />
                      </div>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col">
                    <div className="mb-2">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] font-black tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">
                          {itemTypeLabel}
                        </span>
                        <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
                          <Clock size={10} /> {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-black text-slate-900 text-xl leading-tight mb-1">
                        {item.styleId?.title || "Bespoke Custom Fitting"}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 bg-slate-900 rounded-md flex items-center justify-center text-[10px] text-white font-black">
                          {(item.businessId?.name || "T").charAt(0).toUpperCase()}
                        </div>
                        <p className="text-xs text-slate-500 font-bold flex items-center gap-1">
                          {item.businessId?.name || "Master Tailor"} <Verified size={11} className="text-blue-500" />
                        </p>
                      </div>

                      <div className="mb-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${getTailorStatusStyles(item.status)}`}>
                          Status: {item.status?.replace("_", " ")}
                        </span>
                      </div>

                      {item.finalPrice && (
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between mt-3">
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
                            <p className="text-base font-black text-slate-900">₦{item.finalPrice.toLocaleString()}</p>
                          </div>
                          {item.status === "in_progress" || item.status === "completed" ? (
                            <span className="text-[8px] font-black text-green-600 uppercase bg-green-50 px-2 py-1 rounded">Paid</span>
                          ) : (
                            <button 
                              onClick={() => navigate("/request-payment", { state: { request: item } })}
                              className="bg-orange-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md shadow-orange-100"
                            >
                              <CreditCard size={12} /> Pay Now
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => { setSelectedRequest(item); setShowMeasurement(true); }}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                          item.measurementSnapshot ? "bg-slate-50 text-slate-900" : "bg-orange-50 text-orange-600 border border-orange-100"
                        }`}
                      >
                        <Ruler size={14} /> {item.measurementSnapshot ? "Fit Details" : "Add Size Layout"}
                      </button>
                      <button onClick={() => navigate("/chat", { state: { requestId: item._id } })} className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <MessageSquare size={14} /> Live Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Render Ready-to-Wear Items (Fabrics, Caps, etc.)
          const config = getStoreStatusConfig(item.customerStatus);
          return (
            <div key={item._id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="flex gap-5 mb-5">
                <img src={item.productId?.images?.[0]} alt="" className="w-20 h-24 object-cover rounded-2xl border border-slate-100 bg-slate-50" />

                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                      {itemTypeLabel}
                    </span>
                    <p className="text-[10px] font-bold text-slate-300">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    {item.productId?.name || "Premium Standard Purchase"}
                  </h3>

                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Ref Code: {item.refNumber}
                  </p>

                  <div className="pt-1">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${config.color} border-slate-100 inline-flex items-center gap-1`}>
                      {config.icon} {config.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="flex gap-1 mb-5">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={`h-1 flex-1 rounded-full transition-colors duration-700 ${i <= config.step ? 'bg-slate-900' : 'bg-slate-100'}`} 
                  />
                ))}
              </div>

              {/* ACTION STAT FOOTER */}
              <div className="flex justify-between items-center pt-5 border-t border-slate-50">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Items</p>
                    <p className="text-sm font-black text-slate-900">{item.quantity}x</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Paid</p>
                    <p className="text-sm font-black text-slate-900">₦{item.totalPrice.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => navigate('/support')}
                    className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
                  >
                    <MessageCircle size={20} />
                  </button>

                  <button className="p-3 bg-slate-900 text-white rounded-full group-hover:scale-110 transition-transform shadow-md">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- REUSABLE SYSTEM MODALS FROM SOURCE FILES --- */}
      {showImagePreview && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4" onClick={() => setShowImagePreview(null)}>
          <img src={showImagePreview} className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" alt="Preview" />
        </div>
      )}

      {showMeasurement && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Garment Fit Profile</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Locker: {selectedRequest.measurementId?.label || "None"}</p>
              </div>
              <button onClick={() => { setShowMeasurement(false); setShowPicker(false); }} className="p-3 bg-slate-50 rounded-full"><X size={20} /></button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 pb-4">
              {!selectedRequest.measurementSnapshot && !showPicker && (
                <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Ruler size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-400 mb-4">No profile linked to this order file.</p>
                  <button 
                    onClick={() => { fetchAllMeasurements(); setShowPicker(true); }}
                    className="bg-orange-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Select From Locker
                  </button>
                </div>
              )}

              {showPicker && (
                <div className="space-y-3">
                  {allMeasurements.length > 0 ? (
                    allMeasurements.map((m) => (
                      <button
                        key={m._id}
                        disabled={attachingId === m._id}
                        onClick={() => handleAttachMeasurement(m._id)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-500 transition-all"
                      >
                        <div className="text-left">
                          <p className="text-sm font-black text-slate-800">{m.label}</p>
                        </div>
                        {attachingId === m._id ? <Loader2 size={18} className="animate-spin text-orange-500" /> : <CheckCircle2 size={18} className="text-slate-200" />}
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xs font-bold text-slate-400">No dimensions saved.</p>
                    </div>
                  )}
                </div>
              )}

              {selectedRequest.measurementSnapshot && (
                <div className="space-y-6">
                  {['upperBody', 'lowerBody', 'extras'].map((part) => (
                    selectedRequest.measurementSnapshot?.[part] && (
                      <div key={part} className="space-y-2">
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 w-fit px-2 py-0.5 rounded">{part}</p>
                        {Object.entries(selectedRequest.measurementSnapshot[part]).map(([k, v]: any) => (
                          v ? (
                            <div key={k} className="flex justify-between border-b border-slate-50 py-2">
                              <span className="text-xs font-bold text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="font-black text-slate-900">{v}"</span>
                            </div>
                          ) : null
                        ))}
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { setShowMeasurement(false); setShowPicker(false); }} className="w-full mt-4 bg-slate-900 text-white py-4 rounded-3xl font-black uppercase text-xs tracking-widest">
              Dismiss Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersHub;
