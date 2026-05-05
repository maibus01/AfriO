import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Heart,
  Info,
  ShoppingBag,
  Verified,
  ExternalLink,
  Ruler,
  Send,
  CheckCircle2,
} from "lucide-react";
import API from "../api/User"; // ✅ axios instance

export default function StyleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // DATA
  const [style, setStyle] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);

  // UI
  const [loading, setLoading] = useState(true);
  const [selectedM, setSelectedM] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // 🔹 FETCH STYLE + PRODUCTS
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await API.get(`/styles/${id}`);
      setStyle(res.data.data);

      const prod = await API.get("/products");
      setProducts(prod.data.data || []);

    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 FETCH MEASUREMENTS
  const fetchMeasurements = async () => {
    try {
      const res = await API.get("/measurements");
      setMeasurements(res.data.data || []);
    } catch (err) {
      console.error("MEASUREMENTS ERROR:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
      fetchMeasurements();
      window.scrollTo(0, 0);
    }
  }, [id]);

  // 🔹 SEND REQUEST
  const handleSendRequest = async () => {
    if (sending) return;

    if (!selectedM) {
      alert("Please select a measurement");
      return;
    }

    try {
      setSending(true);

      const res = await API.post("/tailor-requests", {
        styleId: style._id,
        measurementId: selectedM,
        note: note.trim(),
      });

      if (res.data.success) {
        setRequestSent(true);
      }
    } catch (err: any) {
      console.error("REQUEST ERROR:", err);
      alert(err.response?.data?.message || "Request failed");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="font-black text-4xl text-orange-500 animate-bounce">AFRIO</div>
      </div>
    );
  }

  if (!style) return <p className="p-10 text-center font-bold">Style not found</p>;

  return (
    <main className="min-h-screen bg-white pb-20">

      {/* FLOATING NAV */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-black/30 backdrop-blur-md text-white rounded-full hover:bg-black/50 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-2">
          <button className="p-3 bg-black/30 backdrop-blur-md text-white rounded-full"><Share2 size={20} /></button>
          <button className="p-3 bg-black/30 backdrop-blur-md text-white rounded-full"><Heart size={20} /></button>
        </div>
      </div>

      {/* HERO IMAGE */}
      <div className="relative w-full aspect-[3/4] md:aspect-video bg-slate-200">
        <img
          src={style.image}
          className="w-full h-full object-cover"
          alt={style.title}
        />
        <div className="absolute bottom-12 left-6 bg-orange-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
          {style.category || "Couture"}
        </div>
      </div>

      {/* INFO & REQUEST SECTION */}
      <div className="max-w-3xl mx-auto px-5 -mt-10 relative z-10">
        <div className="bg-white rounded-t-[3rem] p-8 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">

          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
            {style.title}
          </h1>

          <div className="bg-slate-50 p-6 rounded-[2rem] mb-8 border border-slate-100">
            <h3 className="font-bold flex items-center gap-2 mb-2 text-slate-400 text-xs uppercase tracking-widest">
              <Info size={14} /> Designer's Note
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed italic">
              "{style.description || "A masterpiece designed for elegance and individual expression."}"
            </p>
          </div>

          {/* TAILOR CARD */}
          {style.businessId && (
            <div
              onClick={() => navigate(`/business/${style.businessId._id}/public`)}
              className="mb-8 p-5 bg-white border-2 border-slate-50 rounded-[2rem] flex items-center gap-4 cursor-pointer hover:border-orange-100 hover:bg-orange-50/30 transition-all"
            >
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-white shadow-xl">
                {style.businessId.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-black text-slate-900 text-lg flex items-center gap-1">
                  {style.businessId.name} <Verified size={16} className="text-blue-500" />
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Tailor Profile</p>
              </div>
              <ExternalLink size={20} className="text-slate-200" />
            </div>
          )}

          {/* REQUEST FLOW */}
          {!requestSent ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 px-2">
                  <Ruler size={14} /> Select Measurement Locker
                </label>
                <select
                  className="w-full h-16 px-6 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-600 outline-none transition-all font-bold text-slate-700"
                  value={selectedM}
                  onChange={(e) => setSelectedM(e.target.value)}
                >
                  <option value="">Choose saved dimensions...</option>
                  {measurements.map((m) => (
                    <option key={m._id} value={m._id}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Make it slim fit, longer sleeves..."
                  className="w-full min-h-[120px] p-4 rounded-2xl border-2 border-slate-100 focus:border-orange-600 outline-none text-sm"
                />
              </div>

              <button
                onClick={handleSendRequest}
                disabled={sending || !selectedM}
                className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-xl disabled:bg-slate-200"
              >
                {sending ? "Processing..." : "Send Request to Tailor"}
                <Send size={20} />
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border-2 border-green-100 p-8 rounded-[2.5rem] text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-green-200">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-green-900 mb-2">Request Sent!</h3>
              <p className="text-green-700/70 text-sm mb-6 font-medium">
                Your tailoring request has been delivered to the designer.
              </p>
              <button
                onClick={() => navigate("/profile")}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-700 transition-all shadow-md"
              >
                View in My Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DISCOVERY FEED */}
      <div className="max-w-6xl mx-auto px-5 mt-16">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><ShoppingBag size={20} /></div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Shop Ready Designs</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-20">
          {products.slice(0, 10).map((p) => (
            <div key={p._id} onClick={() => navigate(`/product/${p._id}`)} className="group cursor-pointer">
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-100 mb-3 border border-slate-100 shadow-sm transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                <img src={p.images?.[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={p.name} />
              </div>
              <h3 className="text-xs font-bold text-slate-800 truncate px-2">{p.name}</h3>
              <p className="text-orange-600 font-black text-sm px-2 mt-1">₦{p.price?.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
