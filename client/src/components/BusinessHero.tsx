import { useState, useEffect } from "react";
import { MessageCircle, Share2, UserPlus, Users, Camera, Check } from "lucide-react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function BusinessHero({ business }: any) {
  const token = localStorage.getItem("token");

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(business?.followersCount || 0);
  const [coverPreview, setCoverPreview] = useState(business?.coverImage || "");

  // ✅ CHECK INITIAL FOLLOW STATUS
  useEffect(() => {
    if (business?.followers?.includes(localStorage.getItem("userId"))) {
       setIsFollowing(true);
    }
  }, [business]);

  const toggleFollow = async () => {
    if (!token) return alert("Please login to follow");
    try {
      if (isFollowing) {
        await axios.delete(`${API}/follow/${business._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFollowing(false);
        setFollowersCount((prev: number) => prev - 1);
      } else {
        await axios.post(`${API}/follow`, { businessId: business._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(true);
        setFollowersCount((prev: number) => prev + 1);
      }
    } catch (err) { console.log(err); }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);

    const formData = new FormData();
    formData.append("coverImage", file);

    try {
      await axios.put(`${API}/business/${business._id}/cover`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "multipart/form-data" 
        },
      });
    } catch (err) { alert("Failed to upload image"); }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
      
      {/* ================= COVER PHOTO ================= */}
      <div className="relative h-48 md:h-64 bg-slate-200">
        {coverPreview ? (
          <img src={coverPreview} className="w-full h-full object-cover" alt="Business Cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-200 to-slate-300 flex items-center justify-center" />
        )}
        
        {/* Upload Button overlay */}
        <label className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full cursor-pointer hover:bg-white transition-all shadow-sm border border-white/50">
          <Camera size={20} className="text-slate-700" />
          <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
        </label>
      </div>

      {/* ================= PROFILE AREA ================= */}
      <div className="relative px-6 pb-6">
        
        {/* LOGO - Floating Overlap */}
        <div className="absolute -top-12 left-6">
          <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl border border-slate-50 overflow-hidden">
            <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
              {business.logo ? (
                <img src={business.logo} className="w-full h-full object-cover" alt="Logo" />
              ) : (
                <span className="font-bold text-slate-400">LOGO</span>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="pt-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          
          {/* INFO */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{business.name}</h1>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold uppercase rounded-full">
                {business.category}
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-md">{business.description}</p>
            
            <div className="flex items-center gap-4 pt-2 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-1">
                <Users size={16} className="text-slate-400" />
                <span>{followersCount} <span className="text-slate-400 font-normal">followers</span></span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleFollow}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                isFollowing 
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-100"
              }`}
            >
              {isFollowing ? <Check size={16} /> : <UserPlus size={16} />}
              {isFollowing ? "Following" : "Follow"}
            </button>

            <button
              onClick={() => window.open(`https://wa.me/${business.phone}`, "_blank")}
              className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors border border-green-100"
              title="Message on WhatsApp"
            >
              <MessageCircle size={20} />
            </button>

            <button
              onClick={() => navigator.share({ title: business.name, url: window.location.href })}
              className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
              title="Share Profile"
            >
              <Share2 size={20} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}