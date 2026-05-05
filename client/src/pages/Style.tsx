import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Edit3, Search, LayoutGrid, ClipboardList, X } from "lucide-react";
import BusinessHero from "../components/BusinessHero";
import TailorRequestManager from "./TailorRequested"; // This is the file we made earlier

const API = "https://afrio-api.onrender.com/api";

type Style = {
  _id: string;
  title: string;
  description?: string;
  image: string;
  category: string;
};

export default function StylesPage() {
  const [activeTab, setActiveTab] = useState<"portfolio" | "requests">("portfolio");
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState<Style | null>(null);
  const [search, setSearch] = useState("");
  const [business, setBusiness] = useState<any>(null);

  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    category: "modern",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [bizRes, styleRes] = await Promise.all([
          axios.get(`${API}/business`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/styles/me`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const tailor = bizRes.data.data.find((b: any) => b.category === "tailor");
        setBusiness(tailor || null);
        setStyles(styleRes.data.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [token]);

  const createStyle = async () => {
    if (!business?._id) return;
    try {
      const res = await axios.post(`${API}/styles`, { ...form, businessId: business._id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStyles((prev) => [res.data.data, ...prev]);
      setForm({ title: "", description: "", image: "", category: "modern" });
      setOpen(false);
    } catch (err) { console.log(err); }
  };

  const updateStyle = async () => {
    if (!editMode) return;
    try {
      const res = await axios.patch(`${API}/styles/${editMode._id}`, editMode, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStyles(prev => prev.map(s => (s._id === editMode._id ? res.data.data : s)));
      setEditMode(null);
    } catch (err) { console.log(err); }
  };

  const deleteStyle = async (id: string) => {
    if (!window.confirm("Delete this style from your portfolio?")) return;
    try {
      await axios.delete(`${API}/styles/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setStyles(prev => prev.filter(s => s._id !== id));
    } catch (err) { console.log(err); }
  };

  const filtered = styles.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Mastering Your Profile</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {business && <BusinessHero business={business} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* --- NAVIGATION TABS --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="bg-slate-200/60 p-1.5 rounded-[2rem] flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`flex-1 md:w-48 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'portfolio' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid size={16} /> My Styles
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 md:w-48 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ClipboardList size={16} /> Client Requests
            </button>
          </div>

          {activeTab === "portfolio" && (
            <button
              onClick={() => setOpen(true)}
              className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
            >
              <Plus size={18} /> New Creation
            </button>
          )}
        </div>

        {/* --- CONTENT AREA --- */}
        {activeTab === "requests" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TailorRequestManager />
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {/* SEARCH BAR */}
            <div className="relative group max-w-md mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={20} />
              <input
                placeholder="Search your collection..."
                className="w-full bg-white border-2 border-slate-100 h-14 pl-12 pr-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-medium"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* STYLES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filtered.map((s) => (
                <div key={s._id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                  <div className="relative h-64 overflow-hidden">
                    <img src={s.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                        {s.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h2 className="font-bold text-slate-900 text-lg mb-1">{s.title}</h2>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-6 italic">
                      {s.description || "No description provided."}
                    </p>

                    <div className="flex gap-2 pt-4 border-t border-slate-50">
                      <button onClick={() => setEditMode(s)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all">
                        <Edit3 size={14} /> Edit
                      </button>
                      <button onClick={() => deleteStyle(s._id)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS (Enhanced UI) --- */}
      {(open || editMode) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">{editMode ? "Refine Style" : "New Creation"}</h2>
              <button onClick={() => { setOpen(false); setEditMode(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
            </div>

            <div className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Style Title</label>
                <input
                  value={editMode ? editMode.title : form.title}
                  placeholder="e.g. Midnight Agbada"
                  className="w-full bg-slate-50 border-none h-14 px-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                  onChange={(e) => editMode ? setEditMode({ ...editMode, title: e.target.value }) : setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Image Link</label>
                <input
                  value={editMode ? editMode.image : form.image}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border-none h-14 px-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                  onChange={(e) => editMode ? setEditMode({ ...editMode, image: e.target.value }) : setForm({ ...form, image: e.target.value })}
                />
              </div>

              {!editMode && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                  <select
                    className="w-full bg-slate-50 border-none h-14 px-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="modern">Modern</option>
                    <option value="traditional">Traditional</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Description</label>
                <textarea
                  value={editMode ? editMode.description : form.description}
                  className="w-full bg-slate-50 border-none p-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 h-24"
                  onChange={(e) => editMode ? setEditMode({ ...editMode, description: e.target.value }) : setForm({ ...form, description: e.target.value })}
                />
              </div>

              <button
                onClick={editMode ? updateStyle : createStyle}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 mt-4"
              >
                {editMode ? "Update Collection" : "Publish to Gallery"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}