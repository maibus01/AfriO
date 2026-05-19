import { useState } from "react";
import { CheckCircle, Share2, Users } from "lucide-react";

type Props = {
  business: any;
};

export default function PublicBusinessHero({ business }: Props) {
  const [followed, setFollowed] = useState(false);

  // Handle sharing the public link
  const handleShare = () => {
    navigator.share({
      title: business.name,
      url: window.location.href,
    }).catch(() => alert("Copied to clipboard!"));
  };

  return (
    <div className="bg-white border-b border-slate-100">

      {/* ================= COVER ================= */}
      <div className="relative h-48 md:h-72 w-full">
        <img
          src={business.coverImage || "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47"}
          className="w-full h-full object-cover"
          alt="Business Backdrop"
        />
        {/* Soft Gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />

        <button 
          onClick={handleShare}
          className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-slate-900 transition-all"
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* ================= PROFILE SECTION ================= */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between pb-6">

          {/* LEFT SIDE: Identity */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">

            {/* LOGO: Overlapping the cover */}
            <div className="relative -mt-12 md:-mt-16">
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-slate-50">
                <img
                  src={business.logo || `https://ui-avatars.com/api/?name=${business.name}&background=random`}
                  className="w-full h-full object-cover"
                  alt={business.name}
                />
              </div>
            </div>

            {/* INFO */}
            <div className="space-y-1 md:pb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
                  {business.name}
                </h1>
                <CheckCircle size={20} className="text-blue-500 fill-blue-500/10" />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded capitalize">
                  {business.category}
                </span>
                <span className="text-slate-400">•</span>
                <div className="flex items-center gap-1 text-slate-500">
                  <Users size={14} />
                  <span>1.2k Followers</span>
                </div>
                <span className="text-slate-400">•</span>
                <span className="text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Active Now
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Actions (WhatsApp Button Removed) */}
          <div className="mt-6 md:mt-0 flex items-center gap-2 w-full md:w-auto">
            {/* FOLLOW BUTTON */}
            <button
              onClick={() => setFollowed(!followed)}
              className={`w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all border ${
                followed
                  ? "bg-slate-100 border-transparent text-slate-500"
                  : "bg-slate-900 border-transparent text-white hover:bg-orange-600"
              }`}
            >
              {followed ? "Following" : "Follow Store"}
            </button>
          </div>

        </div>

        {/* BIO / DESCRIPTION SECTION */}
        <div className="pb-6 border-t border-slate-50 pt-4">
          <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-3xl">
            {business.description || "Welcome to our store! Explore our latest ready designs and premium style collections."}
          </p>
        </div>
      </div>
    </div>
  );
}
