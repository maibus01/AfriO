import React from "react";

interface ProductMetaInfoProps {
  category: string;
  condition: string;
  features: {
    origin?: boolean;
  };
  origin?: {
    country?: string;
    city?: string;
  };
}

export default function ProductMetaInfo({ category, condition, features, origin }: ProductMetaInfoProps) {
  return (
    <div className="space-y-2">
      {/* Top Tag Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
          {category || 'Fabric Marketplace'}
        </span>
        <span className="text-[9px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 px-1.5 py-0.5 rounded capitalize">
          {condition || 'New'}
        </span>
      </div>

      {/* Origin Footprint Metadata Badge */}
      {features?.origin && origin && (origin.country || origin.city) && (
        <div className="inline-flex items-center gap-3 px-2.5 py-1 bg-slate-100/60 dark:bg-neutral-950/40 border border-slate-200/20 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-wider">
          {origin.country && (
            <div>
              Origin: <span className="text-slate-900 dark:text-neutral-200 font-black">{origin.country}</span>
            </div>
          )}
          {origin.city && (
            <div>
              Hub: <span className="text-slate-900 dark:text-neutral-200 font-black">{origin.city}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}