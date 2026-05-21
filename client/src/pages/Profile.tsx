import { useEffect, useState } from "react";
import axios from "axios";
import { 
  User, 
  Mail, 
  Phone, 
  LogOut, 
  Camera,
  Edit3,
  X,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = "https://afrio-api.onrender.com/api";

type UserType = {
  name: string;
  email: string;
  phone?: string;
  photo?: string;
};

export default function Profile() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  
  // Form State Vectors
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedUser = res.data.user;
        setUser(fetchedUser);
        setProfileForm({
          name: fetchedUser.name || "",
          phone: fetchedUser.phone || ""
        });
      } catch (err) {
        console.error("Profile authorization clear down:", err);
        localStorage.removeItem("token");
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const uploadPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await axios.patch(`${API}/auth/update-me`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error("Avatar dispatch synchronization engine failure:", err);
    }
  };

  const handleUpdateProfileData = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const data = new FormData();
    data.append("name", profileForm.name);
    data.append("phone", profileForm.phone);

    try {
      const res = await axios.patch(`${API}/auth/update-me`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.user) {
        setUser(res.data.user);
        setOpenEditModal(false);
      }
    } catch (err) {
      console.error("Profile metadata payload push crash:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-6">
        <div className="space-y-4 w-full max-w-md">
          <div className="h-40 bg-white dark:bg-neutral-900 rounded-2xl animate-pulse border border-slate-100 dark:border-neutral-800" />
          <div className="h-14 bg-white dark:bg-neutral-900 rounded-2xl animate-pulse border border-slate-100 dark:border-neutral-800" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-100 flex flex-col justify-start items-center p-4 md:p-8 select-none">
      
      <div className="w-full max-w-xl space-y-4 mt-4 md:mt-12">
        
        {/* FULL RESPONSIVE ACCOUNT CARD BLOCK */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/60 dark:border-neutral-800/80 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            
            {/* HOVER ACTIVE AVATAR INTERFACE LAYER */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-500/20 dark:border-neutral-700 p-1 bg-white dark:bg-neutral-900 relative">
                <img
                  src={preview || user.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&auto=format&fit=crop"}
                  className="w-full h-full object-cover rounded-full"
                  alt="Account Avatar"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={18} className="text-white mb-0.5" />
                  <span className="text-[8px] text-white font-black uppercase tracking-wider">Change</span>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer z-20 rounded-full"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setPreview(URL.createObjectURL(file));
                  uploadPhoto(file);
                }}
              />
            </div>

            {/* IDENTITY METADATA DISPLAY WRAPPER */}
            <div className="flex-1 min-w-0 space-y-1.5 w-full">
              <div>
                <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Active Profile</p>
                <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white truncate uppercase mt-0.5">{user.name}</h2>
              </div>
              
              <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-neutral-800/40">
                <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono flex items-center justify-center sm:justify-start gap-2 truncate">
                  <Mail size={12} className="text-slate-400" /> {user.email}
                </p>
                <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono flex items-center justify-center sm:justify-start gap-2">
                  <Phone size={12} className="text-slate-400" /> {user.phone || <span className="text-slate-300 dark:text-neutral-600 italic">No phone linked</span>}
                </p>
              </div>
            </div>

            {/* QUICK-ACTION TRIGGER */}
            <button 
              onClick={() => setOpenEditModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-950 dark:bg-neutral-800 text-white rounded-xl hover:bg-slate-900 dark:hover:bg-neutral-750 transition-all border border-slate-800 dark:border-neutral-700 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider shrink-0"
            >
              <Edit3 size={13} /> Edit Profile
            </button>
          </div>
        </div>

        {/* LOGOUT SECURE DISPATCH */}
        <button 
          onClick={handleLogout}
          className="w-full bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-500 rounded-2xl p-4 border border-slate-200/60 dark:border-neutral-800/80 shadow-sm font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-rose-50/40 dark:hover:bg-rose-950/10 transition-colors"
        >
          <LogOut size={14} /> Terminate Current Session
        </button>

      </div>

      {/* ====================================================
          MODAL SHEET OVERLAY: UNIVERSAL METADATA MANAGER
         ==================================================== */}
      {openEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 border border-slate-100 dark:border-neutral-800 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-neutral-800/60">
              <div className="flex items-center gap-2">
                <User size={16} className="text-amber-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Modify Account Registry</h3>
              </div>
              <button 
                onClick={() => setOpenEditModal(false)} 
                className="p-1.5 bg-slate-50 dark:bg-neutral-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfileData} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Legal Full Name</label>
                <input 
                  type="text" 
                  value={profileForm.name} 
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-neutral-800 text-xs p-3 rounded-xl border border-slate-200 dark:border-neutral-700 outline-none font-bold text-slate-800 dark:text-white focus:border-amber-500 dark:focus:border-amber-500 transition-all"
                  required
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Mobile Communication Endpoint</label>
                <input 
                  type="tel" 
                  value={profileForm.phone} 
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+234 902 745 6061"
                  className="w-full bg-slate-50 dark:bg-neutral-800 text-xs p-3 rounded-xl border border-slate-200 dark:border-neutral-700 outline-none font-mono text-slate-800 dark:text-white focus:border-amber-500 dark:focus:border-amber-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setOpenEditModal(false)}
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
                      <CheckCircle2 size={14} /> Save Changes
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