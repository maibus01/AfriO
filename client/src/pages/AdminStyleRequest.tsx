import { useEffect, useState } from "react";
import { 
  MessageCircle, Scissors, Building2, 
  Ruler, CheckCircle2, PlusCircle, Loader2, CreditCard
} from "lucide-react";
import API from "../api/User";

// 1. ADDED INTERFACES (Crucial for fixing "Variable not found" errors)
interface RequestItem {
  _id: string;
  internalStatus: string;
  finalPrice?: number;
  createdAt: string;
  customerId: {
    _id: string;
    name: string;
    phone: string;
  };
  businessId: {
    _id: string;
    name: string;
    phone: string;
  };
  styleId: {
    _id: string;
    title: string;
    image: string;
  };
  measurementId?: {
    _id: string;
    label: string;
  };
  measurementSnapshot?: Record<string, Record<string, any>>;
}

const AdminRequests = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending_review");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const [userMeasurements, setUserMeasurements] = useState<{ [key: string]: any[] }>({});
  const [selectedMeasurement, setSelectedMeasurement] = useState<{ [key: string]: string }>({});
  const [loadingMeasurements, setLoadingMeasurements] = useState<{ [key: string]: boolean }>({});

  const [priceInputs, setPriceInputs] = useState<{ [key: string]: number }>({});
  const [deadlineInputs, setDeadlineInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => { fetchRequests(); }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/tailor-requests/admin?status=${filter}`);
      setRequests(res.data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // 2. LOGIC FOR WHATSAPP BUTTONS
  const openWhatsApp = (r: RequestItem) => {
    const phone = r.customerId?.phone;
    if (!phone) return alert("No phone number");
    const cleanPhone = phone.replace(/\D/g, "");
    const message = `Hello ${r.customerId.name} 👋\nRegarding: ${r.styleId?.title}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const openBusinessWhatsApp = (r: RequestItem) => {
    const phone = r.businessId?.phone;
    if (!phone) return alert("No business phone number");
    const cleanPhone = phone.replace(/\D/g, "");
    const message = `Hello Tailor ${r.businessId.name} 🧵\nRegarding: ${r.styleId?.title}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleConfirmPayment = async (id: string) => {
    if (!window.confirm("Confirm payment received?")) return;
    try {
      setUpdatingStatus(id);
      await API.patch(`/tailor-requests/${id}/payment-received`);
      fetchRequests();
    } catch (err) { console.error(err); } finally { setUpdatingStatus(null); }
  };

  const fetchUserMeasurements = async (requestId: string, userId: string) => {
    try {
      setLoadingMeasurements(prev => ({ ...prev, [requestId]: true }));
      const res = await API.get(`/measurements/user/${userId}`);
      setUserMeasurements(prev => ({ ...prev, [requestId]: res.data.data || [] }));
    } catch (err) { console.error(err); } finally { setLoadingMeasurements(prev => ({ ...prev, [requestId]: false })); }
  };

  const attachMeasurement = async (requestId: string) => {
    const measurementId = selectedMeasurement[requestId];
    if (!measurementId) return alert("Select a locker");
    try {
      await API.patch(`/tailor-requests/${requestId}/add-measurement`, { measurementId });
      fetchRequests();
    } catch (err) { console.error(err); }
  };

  const handleSetPrice = async (id: string) => {
    const price = priceInputs[id];
    if (!price) return alert("Enter price");
    try {
      await API.patch(`/tailor-requests/${id}/set-price`, { price });
      fetchRequests();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse">LOADING DASHBOARD...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Admin Dashboard</h1>
        <div className="flex gap-1 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          {["pending_review", "price_set", "processing", "completed"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === s ? "bg-slate-900 text-white shadow-lg" : "text-slate-400"}`}>
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {requests.map((r) => (
          <div key={r._id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/3 h-64 lg:h-auto relative bg-slate-200">
                <img src={r.styleId?.image} className="w-full h-full object-cover" alt="" />
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold">
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{r.styleId?.title}</h3>
                    <p className="text-orange-600 font-black flex items-center gap-1 uppercase text-[10px] tracking-widest mt-1">
                      Order ID: {r._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <button onClick={() => setExpandedId(expandedId === r._id ? null : r._id)} className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-5 py-2.5 rounded-full">
                    {expandedId === r._id ? "Close Details" : "View Measurements"}
                  </button>
                </div>

                {/* MEASUREMENT ATTACHMENT AREA */}
                <div className="mb-6 p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <Ruler size={14} className="text-slate-900" /> Active Measurement
                  </p>
                  {r.measurementId ? (
                    <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase">
                      <CheckCircle2 size={12} className="text-green-400" /> {r.measurementId.label}
                    </div>
                  ) : (
                    <div>
                      {!userMeasurements[r._id] ? (
                        <button onClick={() => fetchUserMeasurements(r._id, r.customerId._id)} className="flex items-center gap-2 text-xs font-black text-orange-600">
                          {loadingMeasurements[r._id] ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                          Load User's Lockers
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {userMeasurements[r._id].map((m) => (
                              <button key={m._id} onClick={() => setSelectedMeasurement({ ...selectedMeasurement, [r._id]: m._id })} className={`text-[10px] font-black px-4 py-2 rounded-xl border ${selectedMeasurement[r._id] === m._id ? "bg-orange-600 text-white" : "bg-white"}`}>
                                {m.label}
                              </button>
                            ))}
                          </div>
                          <button onClick={() => attachMeasurement(r._id)} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Attach to Order</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* TWO COLUMN CONTACT INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                   <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-100">{r.customerId?.name?.charAt(0)}</div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Customer</p>
                        <p className="text-sm font-black text-slate-800">{r.customerId?.name}</p>
                      </div>
                    </div>
                    <button onClick={() => openWhatsApp(r)} className="p-2.5 bg-green-50 rounded-xl text-green-600 hover:bg-green-600 hover:text-white transition-all"><MessageCircle size={16}/></button>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-orange-400 border border-slate-100"><Building2 size={16}/></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Tailor Shop</p>
                        <p className="text-sm font-black text-slate-800">{r.businessId?.name}</p>
                      </div>
                    </div>
                    <button onClick={() => openBusinessWhatsApp(r)} className="p-2.5 bg-orange-50 rounded-xl text-orange-600 hover:bg-orange-600 hover:text-white transition-all"><MessageCircle size={16}/></button>
                  </div>
                </div>

                {/* PRICING & PAYMENT */}
                {r.finalPrice ? (
                   <div className="pt-6 border-t border-slate-50 space-y-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Agreed Price</p>
                          <p className="text-3xl font-black text-slate-900">₦{r.finalPrice.toLocaleString()}</p>
                        </div>
                        <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase">{r.internalStatus.replace('_', ' ')}</span>
                      </div>
                      {r.internalStatus === "price_set" && (
                        <button onClick={() => handleConfirmPayment(r._id)} disabled={updatingStatus === r._id} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-100">
                          {updatingStatus === r._id ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
                          Confirm Payment Received
                        </button>
                      )}
                   </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-dashed border-slate-200">
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-3.5 text-slate-400 font-black text-sm">₦</span>
                      <input type="number" placeholder="Set Price" className="w-full bg-slate-50 border-none pl-8 pr-4 py-4 rounded-2xl text-sm font-black" onChange={(e) => setPriceInputs({...priceInputs, [r._id]: Number(e.target.value)})}/>
                    </div>
                    <button onClick={() => handleSetPrice(r._id)} className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs">Set Quote</button>
                  </div>
                )}
              </div>
            </div>
            
            {/* EXPANDED VIEW */}
            {expandedId === r._id && (
               <div className="bg-slate-900 text-white p-10">
                  <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                    <Ruler className="text-orange-500" size={24} />
                    <h4 className="text-2xl font-black tracking-tighter uppercase">Body Snapshot</h4>
                  </div>
                  {r.measurementSnapshot ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                      {Object.entries(r.measurementSnapshot).map(([group, fields]) => (
                        <div key={group}>
                          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4 border-l-2 border-orange-500 pl-2">{group}</p>
                          <div className="space-y-2">
                            {Object.entries(fields).map(([key, val]) => (
                              <div key={key} className="flex justify-between border-b border-white/5 py-1.5">
                                <span className="text-[10px] text-slate-400 font-bold capitalize">{key}</span>
                                <span className="text-xs font-black text-white">{val as string}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-slate-500">No snapshot</p>}
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRequests;