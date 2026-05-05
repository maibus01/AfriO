// import { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { Plus, Building2, Edit3, Phone, Briefcase, X, Camera, UploadCloud } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const API = "http://localhost:5000/api";

// type Business = {
//   _id: string;
//   name: string;
//   category: "tailor" | "vendor";
//   description?: string;
//   logo?: string;
//   coverImage?: string;
//   phone?: string;
// };

// const INITIAL_FORM = {
//   name: "",
//   category: "tailor" as "tailor" | "vendor",
//   description: "",
//   phone: "",
// };

// export default function BusinessPage() {
//   const navigate = useNavigate();
//   const [businesses, setBusinesses] = useState<Business[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [open, setOpen] = useState(false);
//   const [editId, setEditId] = useState<string | null>(null);
  
//   const [form, setForm] = useState(INITIAL_FORM);
//   const [logoFile, setLogoFile] = useState<File | null>(null);
//   const [coverFile, setCoverFile] = useState<File | null>(null);

//   const getToken = () => localStorage.getItem("token");

//   const fetchBusinesses = async () => {
//     const token = getToken();
//     if (!token) return navigate("/auth");
//     try {
//       const res = await axios.get(`${API}/business`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setBusinesses(res.data.data || []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchBusinesses(); }, []);

//   const handleSave = async () => {
//     const token = getToken();
//     if (!token) return;

//     // Use FormData for File Uploads
//     const formData = new FormData();
//     formData.append("name", form.name);
//     formData.append("category", form.category);
//     formData.append("description", form.description);
//     formData.append("phone", form.phone);
//     if (logoFile) formData.append("logo", logoFile);
//     if (coverFile) formData.append("coverImage", coverFile);

//     try {
//       const headers = { 
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "multipart/form-data" 
//       };

//       if (editId) {
//         const res = await axios.patch(`${API}/business/${editId}`, formData, { headers });
//         setBusinesses(prev => prev.map(b => b._id === editId ? res.data.data : b));
//       } else {
//         const res = await axios.post(`${API}/business`, formData, { headers });
//         setBusinesses(prev => [...prev, res.data.data]);
//       }
//       closeModal();
//     } catch (err) {
      
//       alert("Error saving business. Make sure your backend handles multipart/form-data.");
//     }
//   };

//   const openEdit = (b: Business) => {
//     setForm({ name: b.name, category: b.category, description: b.description || "", phone: b.phone || "" });
//     setEditId(b._id);
//     setOpen(true);
//   };

//   const closeModal = () => {
//     setOpen(false);
//     setEditId(null);
//     setForm(INITIAL_FORM);
//     setLogoFile(null);
//     setCoverFile(null);
//   };

//   const hasTailor = businesses.some((b) => b.category === "tailor");
//   const hasVendor = businesses.some((b) => b.category === "vendor");
//   const canCreate = !(hasTailor && hasVendor);

//   if (loading) return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
//     </div>
//   );

//   return (
//     // Added pt-20 to ensure it doesn't hide under the Navbar
//     <div className="min-h-screen pt-20 pb-10 px-4 sm:px-8 bg-[#FDFDFD] text-slate-900">
//       <div className="max-w-5xl mx-auto">

//         {/* HEADER */}
//         <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
//           <div>
//             <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-800">
//               <div className="bg-orange-500 p-2 rounded-xl">
//                 <Building2 className="text-white" size={24} />
//               </div>
//               Management
//             </h1>
//             <p className="text-slate-500 mt-1 font-medium">Control your professional storefronts</p>
//           </div>

//           {canCreate && (
//             <button
//               onClick={() => setOpen(true)}
//               className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
//             >
//               <Plus size={20} /> New Business
//             </button>
//           )}
//         </header>

//         {/* GRID LIST */}
//         <div className="grid md:grid-cols-2 gap-8">
//           {businesses.map((b) => (
//             <div
//               key={b._id}
//               onClick={() => navigate(`/${b.category}/${b._id}`)}
//               className="group relative bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
//             >
//               <div className="h-32 bg-slate-100 relative">
//                 {b.coverImage && <img src={b.coverImage} className="w-full h-full object-cover" alt="cover" />}
//                 <div className="absolute -bottom-8 left-8 w-20 h-20 bg-white rounded-3xl shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
//                   {b.logo ? <img src={b.logo} className="w-full h-full object-cover" /> : <Briefcase className="text-slate-200" size={32} />}
//                 </div>
//               </div>

//               <div className="pt-12 pb-8 px-8">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h2 className="text-2xl font-black text-slate-800 group-hover:text-orange-600 transition-colors">{b.name}</h2>
//                     <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black mt-2 ${b.category === 'tailor' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
//                       {b.category}
//                     </span>
//                   </div>
//                   <button
//                     onClick={(e) => { e.stopPropagation(); openEdit(b); }}
//                     className="p-3 bg-slate-50 hover:bg-orange-50 rounded-2xl text-slate-400 hover:text-orange-500 transition-all"
//                   >
//                     <Edit3 size={20} />
//                   </button>
//                 </div>

//                 <p className="text-slate-500 text-sm mt-4 line-clamp-2 font-medium leading-relaxed">
//                   {b.description || "Establish your brand description to attract customers."}
//                 </p>

//                 {b.phone && (
//                   <div className="flex items-center gap-2 mt-6 text-slate-400 font-bold text-xs uppercase tracking-tight">
//                     <div className="bg-slate-100 p-1.5 rounded-lg"><Phone size={12} /></div>
//                     {b.phone}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* MODAL */}
//         {open && (
//           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
//             <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
//               <div className="p-8 border-b border-slate-50 flex justify-between items-center">
//                 <h2 className="text-2xl font-black text-slate-800">{editId ? "Update Profile" : "Launch Store"}</h2>
//                 <button onClick={closeModal} className="bg-slate-100 p-2 rounded-full text-slate-400 hover:text-slate-600"><X size={20}/></button>
//               </div>

//               <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
//                 {/* Image Uploaders */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <label className="group relative h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition-all overflow-hidden">
//                     {logoFile ? <img src={URL.createObjectURL(logoFile)} className="w-full h-full object-cover opacity-50" /> : <UploadCloud size={20} className="text-slate-300 group-hover:text-orange-500" />}
//                     <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Logo</span>
//                     <input type="file" className="hidden" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
//                   </label>

//                   <label className="group relative h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition-all overflow-hidden">
//                     {coverFile ? <img src={URL.createObjectURL(coverFile)} className="w-full h-full object-cover opacity-50" /> : <Camera size={20} className="text-slate-300 group-hover:text-orange-500" />}
//                     <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Cover</span>
//                     <input type="file" className="hidden" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
//                   </label>
//                 </div>

//                 <div className="space-y-4">
//                   <input
//                     className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
//                     placeholder="Business Name"
//                     value={form.name}
//                     onChange={(e) => setForm({ ...form, name: e.target.value })}
//                   />

//                   <div className="flex gap-4">
//                      <input
//                       className="flex-1 bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none"
//                       placeholder="Phone (e.g. +234...)"
//                       value={form.phone}
//                       onChange={(e) => setForm({ ...form, phone: e.target.value })}
//                     />
//                     {!editId && (
//                       <select
//                         className="bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none cursor-pointer"
//                         value={form.category}
//                         onChange={(e) => setForm({ ...form, category: e.target.value as any })}
//                       >
//                         <option value="tailor">Tailor</option>
//                         <option value="vendor">Vendor</option>
//                       </select>
//                     )}
//                   </div>

//                   <textarea
//                     rows={4}
//                     className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
//                     placeholder="Brief description of your services..."
//                     value={form.description}
//                     onChange={(e) => setForm({ ...form, description: e.target.value })}
//                   />
//                 </div>

//                 <button
//                   onClick={handleSave}
//                   className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-orange-100 active:scale-95"
//                 >
//                   {editId ? "Save Profile" : "Create Storefront"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Building2, Edit3, Phone, Briefcase, X, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

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
  category: "tailor" as "tailor" | "vendor",
  description: "",
  phone: "",
  logo: "",
  coverImage: "",
};

export default function BusinessPage() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const getToken = () => localStorage.getItem("token");

  const fetchBusinesses = async () => {
    const token = getToken();
    if (!token) return navigate("/auth");
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

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;

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
      } else {
        const res = await axios.post(`${API}/business`, form, config);
        setBusinesses((prev) => [...prev, res.data.data]);
      }
      closeModal();
    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to save business. Check console for details.");
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

  const hasTailor = businesses.some((b) => b.category === "tailor");
  const hasVendor = businesses.some((b) => b.category === "vendor");
  const canCreate = !(hasTailor && hasVendor);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 sm:px-8 bg-[#FDFDFD] text-slate-900">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-800">
              <div className="bg-orange-500 p-2 rounded-xl">
                <Building2 className="text-white" size={24} />
              </div>
              Management
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Control your storefront URLs and info</p>
          </div>

          {canCreate && (
            <button
              onClick={() => setOpen(true)}
              className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
            >
              <Plus size={20} /> New Business
            </button>
          )}
        </header>

        {/* GRID LIST */}
        <div className="grid md:grid-cols-2 gap-8">
          {businesses.map((b) => (
            <div
              key={b._id}
              onClick={() => navigate(`/${b.category}/${b._id}`)}
              className="group relative bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="h-32 bg-slate-100 relative">
                {b.coverImage ? (
                  <img src={b.coverImage} className="w-full h-full object-cover" alt="cover" />
                ) : (
                  <div className="w-full h-full bg-slate-200 animate-pulse" />
                )}
                <div className="absolute -bottom-8 left-8 w-20 h-20 bg-white rounded-3xl shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
                  {b.logo ? (
                    <img src={b.logo} className="w-full h-full object-cover" alt="logo" />
                  ) : (
                    <Briefcase className="text-slate-200" size={32} />
                  )}
                </div>
              </div>

              <div className="pt-12 pb-8 px-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 group-hover:text-orange-600 transition-colors">{b.name}</h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black mt-2 ${b.category === 'tailor' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                      {b.category}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(b); }}
                    className="p-3 bg-slate-50 hover:bg-orange-50 rounded-2xl text-slate-400 hover:text-orange-500 transition-all"
                  >
                    <Edit3 size={20} />
                  </button>
                </div>
                <p className="text-slate-500 text-sm mt-4 line-clamp-2 font-medium leading-relaxed">
                  {b.description || "No description provided."}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800">{editId ? "Update Profile" : "Launch Store"}</h2>
                <button onClick={closeModal} className="bg-slate-100 p-2 rounded-full text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>

              <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-black uppercase text-slate-400 ml-2">Business Name</span>
                    <input
                      className="w-full mt-1 bg-slate-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      placeholder="e.g. Afrio Couture"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <label>
                      <span className="text-xs font-black uppercase text-slate-400 ml-2">Logo URL</span>
                      <div className="relative mt-1">
                        <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-10 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="https://..."
                          value={form.logo}
                          onChange={(e) => setForm({ ...form, logo: e.target.value })}
                        />
                      </div>
                    </label>
                    <label>
                      <span className="text-xs font-black uppercase text-slate-400 ml-2">Cover URL</span>
                      <div className="relative mt-1">
                        <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-10 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="https://..."
                          value={form.coverImage}
                          onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                        />
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex-1">
                       <span className="text-xs font-black uppercase text-slate-400 ml-2">Phone</span>
                       <input
                        className="w-full mt-1 bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="+234..."
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </label>
                    {!editId && (
                      <label>
                        <span className="text-xs font-black uppercase text-slate-400 ml-2">Category</span>
                        <select
                          className="w-full mt-1 bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none cursor-pointer"
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                        >
                          <option value="tailor">Tailor</option>
                          <option value="vendor">Vendor</option>
                        </select>
                      </label>
                    )}
                  </div>

                  <label>
                    <span className="text-xs font-black uppercase text-slate-400 ml-2">Description</span>
                    <textarea
                      rows={3}
                      className="w-full mt-1 bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Tell customers about your style..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </label>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-orange-100 active:scale-95 mt-4"
                >
                  {editId ? "Save Changes" : "Create Storefront"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}