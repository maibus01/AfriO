import { useEffect, useState } from "react";
import axios from "axios";
import { 
  User, 
  Building2, 
  Briefcase, 
  LogOut, 
  Phone,
  FileText,
  Edit2,
  Check,
  X,
  ImageIcon,
  Compass
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ButtonBar from "../components/ButtonBar";

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

type UserProfile = {
  name: string;
  email: string;
  photo?: string;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });

  const [editingBusinessId, setEditingBusinessId] = useState<string | null>(null);
  const [businessForm, setBusinessForm] = useState({ 
    name: "", 
    phone: "", 
    description: "",
    logo: "",
    coverImage: "" 
  });

  const getToken = () => localStorage.getItem("token");

  const fetchProfileAndBusiness = async () => {
    const token = getToken();
    if (!token) return navigate("/auth");

    try {
      const userRes = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = userRes.data?.user || userRes.data;
      setUser(userData);
      setProfileForm({ name: userData?.name || "", email: userData?.email || "" });

      const businessRes = await axios.get(`${API}/business`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusinesses(businessRes.data.data || []);
    } catch (err) {
      console.error("Fetch Data Error:", err);
    } finally {
      loading && setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndBusiness();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const handleUpdateProfile = async () => {
    const token = getToken();
    if (!token) return navigate("/auth");

    try {
      // PERSIST TO BACKEND: Update this endpoint based on your specific auth schema route
      const res = await axios.put(`${API}/auth/update`, profileForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const updatedUser = res.data?.user || res.data;
      setUser(prev => prev ? { ...prev, ...updatedUser } : null);
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Profile update failed", err);
      // Fallback state update if backend doesn't return user instance
      setUser(prev => prev ? { ...prev, ...profileForm } : null);
      setIsEditingProfile(false);
    }
  };

  const handleUpdateBusiness = async (id: string) => {
    const token = getToken();
    if (!token) return navigate("/auth");

    try {
      // PERSIST TO BACKEND: synchronizes payload data including local base64 imagery strings
      await axios.put(`${API}/business/${id}`, businessForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBusinesses(prev => prev.map(b => b._id === id ? { ...b, ...businessForm } : b));
      setEditingBusinessId(null);
    } catch (err) {
      console.error("Business update failed", err);
      // Fallback state synchronization
      setBusinesses(prev => prev.map(b => b._id === id ? { ...b, ...businessForm } : b));
      setEditingBusinessId(null);
    }
  };

  // Helper utility to process native gallery imagery files into local readable string addresses
  const handleImagePicker = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setBusinessForm(prev => ({
        ...prev,
        [field]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const startEditingBusiness = (e: React.MouseEvent, b: Business) => {
    e.stopPropagation(); // Stops routing navigation chain on setup launch click
    setEditingBusinessId(b._id);
    setBusinessForm({ 
      name: b.name, 
      phone: b.phone || "", 
      description: b.description || "",
      logo: b.logo || "",
      coverImage: b.coverImage || ""
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-4">
        <div className="space-y-4 w-full max-w-md">
          <div className="h-28 bg-white dark:bg-neutral-900 rounded-xl animate-pulse border border-slate-100 dark:border-neutral-800" />
          <div className="h-48 bg-white dark:bg-neutral-900 rounded-xl animate-pulse border border-slate-100 dark:border-neutral-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-100 flex flex-col items-center p-3 pb-24 sm:p-6 sm:pb-12">
      <div className="w-full max-w-md space-y-4 mt-2 sm:mt-6">
        
        {/* ====================================================
            1. PROFILE INFO SECTION (EDITABLE)
           ==================================================== */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200/60 dark:border-neutral-800/80 p-4 shadow-sm relative overflow-hidden">
          
          {!isEditingProfile ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {/* Isolated Profile Avatar Track */}
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center font-black text-xl border border-amber-500/20 shrink-0 overflow-hidden">
                  {user?.photo ? (
                    <img src={user.photo} alt="User Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Afrio Merchant Profile</p>
                  <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white uppercase truncate">
                    {user?.name || "Premium Member"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono truncate">
                    {user?.email || "no-email-linked@afrio.com"}
                  </p>
                </div>

                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 min-w-[40px] min-h-[40px] flex items-center justify-center"
                >
                  <Edit2 size={16} />
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 transition-all border border-red-100 dark:border-red-900/30 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider shadow-sm min-h-[44px]"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-neutral-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Edit Profile Data</h4>
                <div className="flex gap-1">
                  <button onClick={() => setIsEditingProfile(false)} className="p-1 text-slate-400"><X size={16} /></button>
                  <button onClick={handleUpdateProfile} className="p-1 text-emerald-500"><Check size={16} /></button>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Merchant Name</label>
                  <input 
                    type="text" 
                    value={profileForm.name} 
                    onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 text-sm focus:outline-none focus:border-amber-500 min-h-[40px]" 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
                  <input 
                    type="email" 
                    value={profileForm.email} 
                    onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 text-sm focus:outline-none focus:border-amber-500 min-h-[40px]" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section Heading Tag */}
        <div className="pt-1 px-1 flex items-center gap-2">
          <Building2 size={13} className="text-slate-400" />
          <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Business Card Credentials</h3>
        </div>

        {/* ====================================================
            2. BUSINESS INFO SECTION (MEDIUM CARDS WITH GALLERY SELECTION)
           ==================================================== */}
        <div className="w-full space-y-3">
          {businesses.length > 0 ? (
            businesses.map((b) => (
              <div
                key={b._id}
                onClick={() => editingBusinessId !== b._id && navigate(`/${b.category}/${b._id}`)}
                className={`bg-white dark:bg-neutral-900 rounded-xl border border-slate-200/60 dark:border-neutral-800/80 shadow-sm overflow-hidden transition-all flex flex-col ${editingBusinessId !== b._id ? 'cursor-pointer active:scale-[0.99]' : ''}`}
              >
                {/* Store Cover Image Banner Background */}
                <div className="w-full h-24 bg-slate-100 dark:bg-neutral-800 relative overflow-hidden border-b border-slate-100 dark:border-neutral-800/50">
                  {editingBusinessId === b._id ? (
                    businessForm.coverImage ? (
                      <img src={businessForm.coverImage} className="w-full h-full object-cover" alt="New Cover Preview" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-slate-200/50 to-slate-50 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center" />
                    )
                  ) : b.coverImage ? (
                    <img src={b.coverImage} className="w-full h-full object-cover" alt="Business Cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-slate-200/50 to-slate-50 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center" />
                  )}
                  
                  {/* Category Pill Tag */}
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[8px] uppercase tracking-widest font-black shadow-sm border ${
                    b.category === 'tailor' 
                      ? 'bg-purple-500 text-white border-purple-400' 
                      : 'bg-blue-600 text-white border-blue-500'
                  }`}>
                    {b.category}
                  </span>
                </div>

                {/* Content Layout */}
                <div className="p-4 relative pt-10 flex flex-col space-y-3">
                  
                  {/* Isolated Floating Business Logo Track */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white dark:border-neutral-900 bg-slate-50 dark:bg-neutral-800 flex items-center justify-center shadow absolute left-4 top-0 -translate-y-1/2 shrink-0 z-10">
                    {editingBusinessId === b._id ? (
                      businessForm.logo ? (
                        <img src={businessForm.logo} className="w-full h-full object-cover" alt="New Logo Preview" />
                      ) : (
                        <Briefcase className="text-slate-400" size={20} />
                      )
                    ) : b.logo ? (
                      <img src={b.logo} className="w-full h-full object-cover" alt="Store Logo" />
                    ) : (
                      <Briefcase className="text-slate-400" size={20} />
                    )}
                  </div>

                  {editingBusinessId !== b._id ? (
                    <>
                      {/* Read Mode */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <h3 className="text-base font-bold tracking-tight text-slate-950 dark:text-white uppercase truncate">
                            {b.name}
                          </h3>
                        </div>
                        <button 
                          onClick={(e) => startEditingBusiness(e, b)}
                          className="p-1.5 -mt-1 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 min-w-[36px] min-h-[36px] flex items-center justify-center"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>

                      <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-neutral-800/40 text-xs text-slate-600 dark:text-neutral-400">
                        {b.phone && (
                          <div className="flex items-center gap-2 font-mono">
                            <Phone size={12} className="text-amber-500 shrink-0" />
                            <span className="truncate font-semibold">{b.phone}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <FileText size={12} className="text-amber-500 shrink-0 mt-0.5" />
                          <p className="leading-normal text-slate-500 dark:text-neutral-400 text-xs font-medium line-clamp-2">
                            {b.description || "No description provided."}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* In-place Business Edit Mode Form (Protected against event bubbling bugs) */
                    <div className="space-y-2.5 pt-1 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-neutral-800 pb-1.5">
                        <span className="font-bold uppercase text-[10px] text-slate-400">Modify Business Entry</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingBusinessId(null); }} 
                            className="text-slate-400 p-1 hover:scale-105 transition-transform"
                          >
                            <X size={15} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleUpdateBusiness(b._id); }} 
                            className="text-emerald-500 p-1 hover:scale-105 transition-transform"
                          >
                            <Check size={15} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Business Identity Name</label>
                          <input 
                            type="text" 
                            value={businessForm.name}
                            onChange={e => setBusinessForm({...businessForm, name: e.target.value})}
                            className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 focus:outline-none min-h-[38px]"
                          />
                        </div>

                        {/* Interactive Native Picker Touchzones */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5 flex items-center gap-1">
                              <Compass size={10} /> Choose Logo
                            </label>
                            <label className="w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-md border border-dashed border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950 text-[11px] text-slate-500 active:bg-slate-100 dark:active:bg-neutral-900 cursor-pointer text-center font-medium min-h-[38px]">
                              <Compass size={12} className="text-amber-500" />
                              Gallery
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={e => handleImagePicker(e, 'logo')} 
                              />
                            </label>
                          </div>
                          <div>
                            <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5 flex items-center gap-1">
                              <ImageIcon size={10} /> Choose Cover
                            </label>
                            <label className="w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-md border border-dashed border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950 text-[11px] text-slate-500 active:bg-slate-100 dark:active:bg-neutral-900 cursor-pointer text-center font-medium min-h-[38px]">
                              <ImageIcon size={12} className="text-amber-500" />
                              Gallery
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={e => handleImagePicker(e, 'coverImage')} 
                              />
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Contact Line</label>
                          <input 
                            type="text" 
                            value={businessForm.phone}
                            onChange={e => setBusinessForm({...businessForm, phone: e.target.value})}
                            className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 focus:outline-none min-h-[38px]"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Summary Manifesto</label>
                          <textarea 
                            value={businessForm.description}
                            onChange={e => setBusinessForm({...businessForm, description: e.target.value})}
                            rows={2}
                            className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 focus:outline-none resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-dashed border-slate-200 dark:border-neutral-800 p-6 text-center">
              <Briefcase className="mx-auto text-slate-300 dark:text-neutral-700 mb-2" size={24} />
              <p className="text-[11px] font-bold text-slate-400 dark:text-neutral-500">
                No active operational business credentials linked yet.
              </p>
            </div>
          )}
        </div>
           <ButtonBar />
      </div>
    </div>
  );
}