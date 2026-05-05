import { useState, useEffect } from "react";
import {
  User,
  MessageSquare,
  CheckCircle,
  Ruler,
  ShoppingBag,
  Loader2,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/User";

// =========================
// TYPES (MATCH BACKEND)
// =========================
interface MeasurementSnapshot {
  upperBody?: Record<string, number>;
  lowerBody?: Record<string, number>;
  extras?: Record<string, number>;
}

interface RequestData {
  _id: string;
  internalStatus: string;
  customerStatus: string;
  note?: string;
  customerId: {
    _id: string;
    name: string;
  };
  styleId: {
    _id: string;
    title: string;
    image: string;
  };
  measurementSnapshot?: MeasurementSnapshot;
  createdAt: string;
}

const TailorRequestManager = () => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [selectedReq, setSelectedReq] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const res = await API.get("/tailor-requests/tailor");
      const data = res.data.data || [];
      setRequests(data);
      if (data.length > 0) {
        setSelectedReq(prev => data.find((r: any) => r._id === prev?._id) || data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "pending_review": return "text-orange-500 bg-orange-50";
      case "price_set": return "text-blue-600 bg-blue-50";
      case "payment_received": return "text-cyan-600 bg-cyan-50";
      case "processing": return "text-purple-600 bg-purple-50";
      case "completed": return "text-green-600 bg-green-50";
      default: return "text-slate-500 bg-slate-50";
    }
  };

  const startWork = async (id: string) => {
    try {
      setUpdating("start");
      await API.patch(`/tailor-requests/${id}/start`);
      await fetchRequests();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Cannot start work");
    } finally {
      setUpdating(null);
    }
  };

  const completeWork = async (id: string) => {
    try {
      setUpdating("complete");
      await API.patch(`/tailor-requests/${id}/complete`);
      await fetchRequests();
    } catch {
      alert("Failed to complete");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="font-black text-slate-300 animate-pulse uppercase">AFRIO WORKSHOP...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-screen p-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">

        {/* LEFT LIST */}
        <div className="lg:col-span-4 space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl text-center border border-dashed">
              <p className="text-slate-400 text-xs font-bold uppercase">No Jobs</p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req._id}
                onClick={() => setSelectedReq(req)}
                className={`p-5 rounded-2xl cursor-pointer border transition ${selectedReq?._id === req._id ? "border-black bg-white shadow" : "border-transparent bg-white hover:border-slate-200"
                  }`}
              >
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${getStatusStyles(req.internalStatus)}`}>
                  {req.internalStatus?.replace("_", " ")}
                </span>
                <h4 className="font-bold mt-2">{req.styleId?.title}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <User size={12} /> {req.customerId?.name}
                </p>
              </div>
            ))
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-8">
          {selectedReq ? (
            <div className="bg-white p-8 rounded-3xl border">

              {/* HEADER */}
              <div className="flex gap-6 mb-8">
                <img src={selectedReq.styleId?.image} className="w-32 h-40 object-cover rounded-xl shadow-sm" alt="" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedReq.styleId?.title}</h2>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <User size={14} /> {selectedReq.customerId?.name}
                      </p>
                    </div>
                    {/* Measurement status badge */}
                    {selectedReq.measurementSnapshot && (
                      <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase">
                        <CheckCircle size={10} /> Specs Ready
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => navigate("/chat", { state: { requestId: selectedReq._id } })}
                    className="mt-4 bg-slate-900 text-white p-3 rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2 text-sm font-bold"
                  >
                    <MessageSquare size={18} /> Chat with Admin
                  </button>
                </div>
              </div>

              {/* MEASUREMENTS - ALWAYS VISIBLE IF THEY EXIST */}
              <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold flex items-center gap-2 text-slate-700">
                    <Ruler size={16} /> Client Measurements
                  </h3>
                  {selectedReq.internalStatus !== "processing" && selectedReq.measurementSnapshot && (
                    <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1">
                      <Eye size={12} /> View Only Mode
                    </span>
                  )}
                </div>

                {selectedReq.measurementSnapshot ? (
                  <div className="grid md:grid-cols-3 gap-6">
                    {["upperBody", "lowerBody", "extras"].map((part) => {
                      const section = selectedReq.measurementSnapshot?.[part as keyof MeasurementSnapshot];
                      if (!section || Object.keys(section).length === 0) return null;
                      return (
                        <div key={part} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                          <p className="text-[10px] font-black text-orange-600 uppercase mb-3 border-b pb-1">{part}</p>
                          {Object.entries(section).map(([k, v]) => (
                            <div key={k} className="flex justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
                              <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="font-bold text-slate-900">{v}"</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer has not provided measurements yet</p>
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 flex-wrap">
                {/* START WORK */}
                {selectedReq.internalStatus === "payment_received" && (
                  <button
                    disabled={!selectedReq.measurementSnapshot || updating === "start"}
                    onClick={() => startWork(selectedReq._id)}
                    className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all ${!selectedReq.measurementSnapshot
                        ? "bg-slate-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
                      }`}
                  >
                    {updating === "start" ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : !selectedReq.measurementSnapshot ? (
                      "Measurement Required to Start"
                    ) : (
                      "Start Production"
                    )}
                  </button>
                )}

                {/* COMPLETE WORK */}
                {selectedReq.internalStatus === "processing" && (
                  <button
                    disabled={updating === "complete"}
                    onClick={() => completeWork(selectedReq._id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 transition-all"
                  >
                    {updating === "complete" ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : (
                      "Mark as Finished"
                    )}
                  </button>
                )}

                {/* WAITING STATES */}
                {selectedReq.internalStatus === "pending_review" && (
                  <div className="w-full py-4 bg-orange-50 rounded-2xl text-center text-[10px] text-orange-600 font-black uppercase tracking-[0.2em] border border-orange-100">
                    Reviewing Request (Admin Price Set Pending)
                  </div>
                )}

                {selectedReq.internalStatus === "price_set" && (
                  <div className="w-full py-4 bg-blue-50 rounded-2xl text-center text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] border border-blue-100">
                    Waiting for customer payment
                  </div>
                )}

                {selectedReq.internalStatus === "completed" && (
                  <div className="w-full py-4 bg-green-50 rounded-2xl text-center text-green-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-green-100">
                    <CheckCircle size={16} /> Job Completed
                  </div>
                )}
              </div>

              {/* NOTE */}
              {selectedReq.note && (
                <div className="mt-8 p-4 bg-slate-50 rounded-xl border-l-4 border-orange-400">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tailor Instructions</p>
                  <p className="text-sm text-slate-600 italic">"{selectedReq.note}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[50vh] flex flex-col items-center justify-center text-slate-300 gap-4">
              <ShoppingBag size={48} />
              <p className="text-xs font-black uppercase tracking-widest">Select a job to view specs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TailorRequestManager;