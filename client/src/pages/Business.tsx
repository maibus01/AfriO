import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Plus, 
  Building2, 
  Edit3, 
  Briefcase, 
  X, 
  CheckCircle2,
  Loader2,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = "https://afrio-api.onrender.com/api";

type Business = {
  _id: string;
  name: string;
  category: "tailor" | "vendor";
  description?: string;
  logo?: string;
  coverImage?: string;
  phone?: string;
};

const INITIAL_FORM = {
  name: "",
  category: "vendor" as "tailor" | "vendor",
  description: "",
  phone: "",
  logo: "",
  coverImage: "",
};

export default function BusinessPage() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [form, setForm] = useState(INITIAL_FORM);

  const getToken = () => localStorage.getItem("token");

  const fetchBusinesses = async () => {
    const token = getToken();
    
    // Safety Guard: Force kick out unauthorized users immediately
    if (!token) {
      return navigate("/auth");
    }

    try {
      const res = await axios.get(`${API}/business`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusinesses(res.data.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return navigate("/auth");

    setIsSaving(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      };

      if (editId) {
        const res = await axios.patch(`${API}/business/${editId}`, form, config);
        setBusinesses((prev) => prev.map((b) => (b._id === editId ? res.data.data : b)));
        closeModal();
      } else {
        const res = await axios.post(`${API}/business`, form, config);
        setBusinesses((prev) => [...prev, res.data.data]);
        closeModal();
        navigate("/profile"); 
      }
    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to save business. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (b: Business) => {
    setForm({
      name: b.name,
      category: b.category,
      description: b.description || "",
      phone: b.phone || "",
      logo: b.logo || "",
      coverImage: b.coverImage || "",
    });
    setEditId(b._id);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditId(null);
    setForm(INITIAL_FORM);
  };

  const uploadImage = async (file: File, field: "logo" | "coverImage") => {
    const token = getToken();
    if (!token) return navigate("/auth");

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await axios.patch(`${API}/auth/update-me`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const url = res.data?.user?.photo;

      if (url) {
        setForm((prev) => ({
          ...prev,
          [field]: url,
        }));
      }
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
    }
  };

  const hasBusiness = businesses.length > 0;

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-6">
        <div className="space-y-4 w-full max-w-xl">
          <div className="h-40 bg-white dark:bg-neutral-900 rounded-2xl animate-pulse border border-slate-100 dark:border-neutral-800" />
          <div className="h-14 bg-white dark:bg-neutral-900 rounded-2xl animate-pulse border border-slate-100 dark:border-neutral-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-100 flex flex-col justify-start items-center p-4 md:p-8 select-none">
      
      <div className="w-full max-w-xl space-y-4 mt-4 md:mt-12">
        
        {/* MANAGEMENT CONTROLS BLOCK */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/60 dark:border-neutral-800/80 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="flex-1 min-w-0 space-y-1.5 w-full">
              <div>
                <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Enterprise Ledger</p>
                <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white truncate uppercase mt-0.5 flex items-center justify-center sm:justify-start gap-2">
                  <Building2 size={18} className="text-amber-500" /> Management
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono pt-1 border-t border-slate-100 dark:border-neutral-800/40">
                Control your storefront URLs and registry info
              </p>
            </div>

            {!hasBusiness ? (
              <button
                onClick={() => setOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-950 dark:bg-neutral-800 text-white rounded-xl hover:bg-slate-900 dark:hover:bg-neutral-750 transition-all border border-slate-800 dark:border-neutral-700 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider shrink-0"
              >
                <Plus size={14} /> New Business
              </button>
            ) : (
              <button
                onClick={() => navigate("/profile")}
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 text-black rounded-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider shrink-0"
              >
                <User size={14} /> Go to Profile
              </button>
            )}
          </div>
        </div>

        {/* ALREADY HAS BUSINESS NOTIFICATION BANNER */}
        {hasBusiness && (
          <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-4 text-center sm:text-left">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-400">
              You already have a business account registered under this profile.
            </p>
          </div>
        )}

        {/* GRID CONTAINER LIST */}
        <div className="space-y-4 w-full">
          {businesses.map((b) => (
            <div
              key={b._id}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/60 dark:border-neutral-800/80 p-6 shadow-sm relative overflow-hidden transition-all"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100 dark:border-neutral-800 shrink-0 bg-slate-50 dark:bg-neutral-900 flex items-center justify-center pointer-events-none">
                  {b.logo ? (
                    <img src={b.logo} className="w-full h-full object-cover" alt="logo" />
                  ) : (
                    <Briefcase className="text-slate-400" size={24} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-white truncate uppercase">{b.name}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-black ${b.category === 'tailor' ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'}`}>
                    {b.category}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 truncate pt-1 font-medium">{b.description || "No description provided."}</p>
                </div>

                <button
                  onClick={() => openEdit(b)}
                  className="p-2 bg-slate-50 dark:bg-neutral-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 transition-colors shrink-0"
                >
                  <Edit3 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* MODAL SHEET OVERLAY */}
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 border border-slate-100 dark:border-neutral-800 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-neutral-800/60">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-amber-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {editId ? "Modify Registry Profile" : "Launch New Storefront"}
                </h3>
              </div>
              <button 
                onClick={closeModal} 
                className="p-1.5 bg-slate-50 dark:bg-neutral-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Business Registry Name</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-neutral-800 text-xs p-3 rounded-xl border border-slate-200 dark:border-neutral-700 outline-none font-bold text-slate-800 dark:text-white focus:border-amber-500 dark:focus:border-amber-500 transition-all"
                  required
                  placeholder="e.g. Afrio Apparel"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Asset Link: Logo</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, "logo");
                    }}
                    className="w-full bg-slate-50 dark:bg-neutral-800 text-[10px] p-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 outline-none text-slate-500 cursor-pointer"
                  />
                  {form.logo && (
                    <img src={form.logo} className="w-12 h-12 mt-2 rounded-xl object-cover" alt="Logo Preview" />
                  )}
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Asset Link: Cover</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, "coverImage");
                    }}
                    className="w-full bg-slate-50 dark:bg-neutral-800 text-[10px] p-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 outline-none text-slate-500 cursor-pointer"
                  />
                  {form.coverImage && (
                    <img src={form.coverImage} className="w-full h-12 mt-2 rounded-xl object-cover" alt="Cover Preview" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Communication Endpoint</label>
                  <input 
                    type="tel" 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+234..."
                    className="w-full bg-slate-50 dark:bg-neutral-800 text-xs p-3 rounded-xl border border-slate-200 dark:border-neutral-700 outline-none font-mono text-slate-800 dark:text-white focus:border-amber-500 dark:focus:border-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Classification Type</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-neutral-800 text-xs p-3 rounded-xl border border-slate-200 dark:border-neutral-700 outline-none font-bold text-slate-800 dark:text-white cursor-pointer focus:border-amber-500 dark:focus:border-amber-500 transition-all"
                  >
                    <option value="vendor">Vendor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Operational Manifest Description</label>
                <textarea 
                  rows={2}
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your design architecture style..."
                  className="w-full bg-slate-50 dark:bg-neutral-800 text-xs p-3 rounded-xl border border-slate-200 dark:border-neutral-700 outline-none font-medium text-slate-800 dark:text-white focus:border-amber-500 dark:focus:border-amber-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="w-full bg-slate-50 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-neutral-750 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full bg-slate-950 dark:bg-amber-500 dark:text-black text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={14} /> {editId ? "Save Changes" : "Commit Store"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}