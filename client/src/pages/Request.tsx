import { useState, useEffect } from "react";
import { 
  X, ShoppingBag, Clock, MessageSquare, Ruler, Verified, Eye, ArrowUpRight, CheckCircle2, Loader2, CreditCard, Banknote 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/User";

const RequestManager = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);

  // --- ATTACHMENT & PAYMENT STATE ---
  const [showPicker, setShowPicker] = useState(false);
  const [allMeasurements, setAllMeasurements] = useState<any[]>([]);
  const [attachingId, setAttachingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/tailor-requests/my");
      setRequests(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
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
      await fetchRequests();
      setShowPicker(false);
      setShowMeasurement(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error("Attach error:", err);
      alert("Failed to attach measurement. Please try again.");
    } finally {
      setAttachingId(null);
    }
  };

  const getStatusStyles = (status: string) => {
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="font-black text-slate-300 animate-pulse uppercase tracking-widest">AFRIO ORDERS...</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-6 max-w-2xl mx-auto pb-24">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">My Requests</h2>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Track your custom tailoring</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <ShoppingBag className="mx-auto text-slate-200 mb-4" size={48} />
          <p className="font-bold text-slate-400">No active requests</p>
          <button onClick={() => navigate("/")} className="mt-4 text-orange-600 font-black text-xs uppercase tracking-widest">Browse Styles</button>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => (
            <div key={req._id} className="bg-white border border-slate-100 rounded-[2.5rem] p-5 shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="flex gap-5">
                <div className="relative shrink-0 group" onClick={() => setShowImagePreview(req.styleId?.image)}>
                  <img src={req.styleId?.image} className="w-24 h-32 object-cover rounded-[1.8rem] bg-slate-100 cursor-zoom-in" alt="" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 rounded-[1.8rem] transition-opacity">
                    <Eye size={20} className="text-white" />
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="mb-2">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getStatusStyles(req.status)}`}>
                        {req.status?.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
                        <Clock size={10} /> {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 onClick={() => navigate(`/style/${req.styleId?._id}`)} className="font-black text-slate-900 text-lg cursor-pointer hover:text-orange-600 transition-colors leading-none mb-2">
                      {req.styleId?.title || "Custom Order"}
                    </h3>

                    <div onClick={() => navigate(`/business/${req.businessId?._id || req.businessId}/public`)} className="flex items-center gap-2 cursor-pointer group/shop inline-flex mb-3">
                      <div className="w-5 h-5 bg-slate-900 rounded-md flex items-center justify-center text-[10px] text-white font-black">
                        {(req.businessId?.name || "T").charAt(0).toUpperCase()}
                      </div>
                      <p className="text-xs text-slate-500 font-bold group-hover/shop:text-slate-900 transition-colors flex items-center gap-1">
                        {req.businessId?.name || "Master Tailor"} <Verified size={12} className="text-blue-500" />
                      </p>
                    </div>

                    {/* --- PRICE & PAYMENT BOX --- */}
                    {req.finalPrice && (
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
                          <p className="text-base font-black text-slate-900">₦{req.finalPrice.toLocaleString()}</p>
                        </div>
                        {req.status === "in_progress" || req.status === "completed" ? (
                          <div className="flex flex-col items-end">
                            <CheckCircle2 size={16} className="text-green-500" />
                            <span className="text-[8px] font-black text-green-600 uppercase">Paid</span>
                          </div>
                        ) : (
                          <button 
                            disabled={payingId === req._id}
                            onClick={() =>
  navigate("/request-payment", {
    state: { request: req }
  })
}
                            className="bg-orange-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-200"
                          >
                            {payingId === req._id ? <Loader2 size={12} className="animate-spin" /> : <><CreditCard size={12} /> Pay Now</>}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setSelectedRequest(req); setShowMeasurement(true); }}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                        req.measurementSnapshot ? "bg-slate-50 text-slate-900" : "bg-orange-50 text-orange-600 animate-pulse border border-orange-200"
                      }`}
                    >
                      <Ruler size={14} /> {req.measurementSnapshot ? "Details" : "Add Size"}
                    </button>
                    <button onClick={() => navigate("/chat", { state: { requestId: req._id } })} className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      <MessageSquare size={14} /> Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODALS --- */}
      {showImagePreview && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4" onClick={() => setShowImagePreview(null)}>
          <img src={showImagePreview} className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
        </div>
      )}

      {/* MEASUREMENT DRAWER */}
      {showMeasurement && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 animate-in slide-in-from-bottom duration-300 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Garment Fit</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Locker: {selectedRequest.measurementId?.label || "None attached"}</p>
              </div>
              <button onClick={() => { setShowMeasurement(false); setShowPicker(false); }} className="p-3 bg-slate-50 rounded-full"><X size={20} /></button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 pb-4">
              {!selectedRequest.measurementSnapshot && !showPicker && (
                <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Ruler size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-400 mb-4">No measurements attached to this order.</p>
                  <button 
                    onClick={() => { fetchAllMeasurements(); setShowPicker(true); }}
                    className="bg-orange-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Select From Locker
                  </button>
                </div>
              )}

              {showPicker && (
                <div className="space-y-3 animate-in fade-in zoom-in-95">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Choose a measurement locker</p>
                  {allMeasurements.length > 0 ? (
                    allMeasurements.map((m) => (
                      <button
                        key={m._id}
                        disabled={attachingId === m._id}
                        onClick={() => handleAttachMeasurement(m._id)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-500 transition-all group"
                      >
                        <div className="text-left">
                          <p className="text-sm font-black text-slate-800">{m.label}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(m.createdAt).toLocaleDateString()}</p>
                        </div>
                        {attachingId === m._id ? <Loader2 size={18} className="animate-spin text-orange-500" /> : <CheckCircle2 size={18} className="text-slate-200 group-hover:text-orange-500" />}
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xs font-bold text-slate-400">No lockers found.</p>
                      <button onClick={() => navigate("/measurements")} className="text-orange-600 font-black text-[10px] uppercase mt-2">Create New Locker</button>
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

              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Order Note</p>
                <p className="text-sm text-slate-600 italic">"{selectedRequest.note || "No custom instructions."}"</p>
              </div>
            </div>

            <button onClick={() => { setShowMeasurement(false); setShowPicker(false); }} className="w-full mt-4 bg-slate-900 text-white py-4 rounded-3xl font-black uppercase text-xs tracking-widest">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestManager;