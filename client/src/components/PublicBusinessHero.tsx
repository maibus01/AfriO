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
    }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
      alert("Copied to clipboard!");
    });
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border-b border-slate-100 dark:border-neutral-800/80 transition-colors duration-300">

      {/* ================= COVER ================= */}
      <div className="relative h-48 md:h-72 w-full bg-slate-100 dark:bg-neutral-950">
        <img
          src={business.coverImage || "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47"}
          className="w-full h-full object-cover"
          alt="Business Backdrop"
        />
        {/* Soft Gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />

        <button 
          onClick={handleShare}
          className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-slate-900 dark:hover:text-black transition-all active:scale-95"
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
            <div className="relative -mt-12 md:-mt-16 shrink-0">
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-3xl border-4 border-white dark:border-neutral-900 shadow-xl overflow-hidden bg-slate-50 dark:bg-neutral-800">
                <img
                  src={business.logo || `https://ui-avatars.com/api/?name=${business.name}&background=amber&color=fff`}
                  className="w-full h-full object-cover"
                  alt={business.name}
                />
              </div>
            </div>

            {/* INFO BLOCK */}
            <div className="space-y-2 md:pb-2 flex-1 min-w-0 w-full">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white leading-none truncate uppercase tracking-tight">
                  {business.name}
                </h1>
                <CheckCircle size={20} className="text-amber-500 fill-amber-500/10 shrink-0" />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm font-bold">
                {/* Brand matched Amber design tag */}
                <span className="text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-lg capitalize text-xs tracking-wider">
                  {business.category || "Designer"}
                </span>
                <span className="text-slate-300 dark:text-neutral-700 font-normal">•</span>
                <div className="flex items-center gap-1 text-slate-500 dark:text-neutral-400 font-medium">
                  <Users size={14} className="text-slate-400" />
                  <span>1.2k Followers</span>
                </div>
                <span className="text-slate-300 dark:text-neutral-700 font-normal">•</span>
                <span className="text-green-600 dark:text-green-500 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse" />
                  Active Now
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Action Controls */}
          <div className="mt-6 md:mt-0 flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => setFollowed(!followed)}
              className={`w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border active:scale-98 ${
                followed
                  ? "bg-slate-100 dark:bg-neutral-800 border-transparent text-slate-500 dark:text-neutral-400"
                  : "bg-slate-950 dark:bg-amber-500 text-white dark:text-black border-slate-900 dark:border-transparent hover:bg-amber-600 dark:hover:bg-amber-400"
              }`}
            >
              {followed ? "Following" : "Follow Store"}
            </button>
          </div>

        </div>

        {/* BIO / DESCRIPTION SECTION */}
        <div className="pb-6 border-t border-slate-100 dark:border-neutral-800/60 pt-4">
          <p className="text-slate-600 dark:text-neutral-300 text-sm md:text-base leading-relaxed max-w-3xl font-medium">
            {business.description || "Welcome to our store! Explore our latest ready designs and premium style collections."}
          </p>
        </div>
      </div>
    </div>
  );
}