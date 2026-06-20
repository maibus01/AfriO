import React, { useState, useMemo, useEffect } from "react";
import { X, Plus, Minus, Maximize2 } from "lucide-react";

interface Variant {
  _id: string;
  sku?: string;
  stock?: number;
  price?: number;
  images?: string[];
  options?: Record<string, string>;
}

interface Measurement {
  minOrder?: number;
  pricePerUnit?: number;
  unit?: string;
}

interface VariantSelectorProps {
  variants: Variant[];
  measurement?: Measurement;
  basePrice: number;
  currencySymbol: string;
  defaultImage: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onConfirm: (selectedOrders: Array<{ variant: Variant; qty: number }>) => void;
}

export default function VariantSelector({
  variants,
  measurement,
  basePrice,
  currencySymbol,
  defaultImage,
  isOpen,
  setIsOpen,
  onConfirm,
}: VariantSelectorProps) {
  
  if (!variants || variants.length === 0) return null;

  // 1. DYNAMIC DATA MATRIX MAPPER
  const attributeLayers = useMemo(() => {
    const keysOrder: string[] = [];
    const setsMap: Record<string, Set<string>> = {};

    variants.forEach((v) => {
      if (v.options) {
        Object.entries(v.options).forEach(([key, value]) => {
          if (!setsMap[key]) {
            setsMap[key] = new Set<string>();
            keysOrder.push(key);
          }
          setsMap[key].add(value);
        });
      }
    });

    const sortedKeys = [...keysOrder].sort((a, b) => {
      if (a.toLowerCase() === "color") return -1;
      if (b.toLowerCase() === "color") return 1;
      return 0;
    });

    return sortedKeys.map((key) => ({
      name: key,
      values: Array.from(setsMap[key]),
    }));
  }, [variants]);

  const totalLayers = attributeLayers.length;
  const hasOnlyColor = totalLayers === 1 && attributeLayers[0].name.toLowerCase() === "color";

  const selectionLayers = useMemo(() => {
    if (hasOnlyColor) return attributeLayers; 
    return attributeLayers.slice(0, -1);
  }, [attributeLayers, hasOnlyColor]);

  const leafLayerName = useMemo(() => {
    if (hasOnlyColor) return "Options"; 
    return totalLayers > 0 ? attributeLayers[totalLayers - 1].name : "";
  }, [attributeLayers, totalLayers, hasOnlyColor]);

  // 2. CONTROLLER STATES
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const initial: Record<string, string> = {};
    selectionLayers.forEach((layer) => {
      if (layer.values.length > 0) {
        initial[layer.name] = layer.values[0];
      }
    });
    setSelections(initial);
  }, [variants, selectionLayers]);

  // 3. SELECTION ROUTE MATCH FILTERS
  const currentBottomRows = useMemo(() => {
    return variants.filter((v) => {
      if (!v.options) return false;
      if (hasOnlyColor) {
        return v.options["Color"] === selections["Color"];
      }
      return selectionLayers.every((layer) => v.options?.[layer.name] === selections[layer.name]);
    });
  }, [variants, selectionLayers, selections, hasOnlyColor]);

  const getColorThumbnail = (colorValue: string): string => {
    const matchedVar = variants.find(
      (v) => v.options?.Color === colorValue && v.images && v.images.length > 0
    );
    return matchedVar?.images?.[0] || defaultImage;
  };

  const currentDisplayImage = useMemo(() => {
    const matchedWithImg = currentBottomRows.find((v) => v.images && v.images.length > 0);
    if (matchedWithImg?.images?.[0]) return matchedWithImg.images[0];
    
    if (selections["Color"]) {
      return getColorThumbnail(selections["Color"]);
    }
    return defaultImage;
  }, [currentBottomRows, selections, defaultImage]);

  // 4. PATH COMPOSITE STRINGS GENERATOR
  const getCompositeKey = (v: Variant) => {
    return attributeLayers.map((layer) => v.options?.[layer.name] || "Standard").join("___");
  };

  // 5. COUNTERS & BADGE MATH
  const totalQuantity = useMemo(() => {
    return Object.values(quantities).reduce((sum, q) => sum + q, 0);
  }, [quantities]);

  const layerBadges = useMemo(() => {
    const badges: Record<string, Record<string, number>> = {};
    
    attributeLayers.forEach((layer) => {
      badges[layer.name] = {};
    });

    Object.entries(quantities).forEach(([compositeKey, qty]) => {
      if (qty <= 0) return;
      const keyParts = compositeKey.split("___");
      
      attributeLayers.forEach((layer, idx) => {
        const value = keyParts[idx];
        if (value) {
          badges[layer.name][value] = (badges[layer.name][value] || 0) + qty;
        }
      });
    });

    return badges;
  }, [quantities, attributeLayers]);

  // 6. PRICING CALCULATIONS
  const currentUnitPrice = useMemo(() => {
    if (totalQuantity >= 500) {
      return (measurement?.pricePerUnit || basePrice) * 0.95; 
    }
    return measurement?.pricePerUnit || basePrice;
  }, [totalQuantity, measurement, basePrice]);

  const subtotal = totalQuantity * currentUnitPrice;

  const updateQty = (variant: Variant, type: "plus" | "minus", maxStock: number) => {
    const compositeKey = getCompositeKey(variant);

    setQuantities((prev) => {
      const current = prev[compositeKey] || 0;
      if (type === "plus") {
        if (current >= maxStock) return prev;
        return { ...prev, [compositeKey]: current + 1 };
      } else {
        if (current <= 0) return prev;
        const updated = { ...prev, [compositeKey]: current - 1 };
        if (updated[compositeKey] === 0) delete updated[compositeKey];
        return updated;
      }
    });
  };

  // FIXED: Aggregates and returns ALL variants containing quantities instead of a single active row
  const handleConfirm = () => {
    if (totalQuantity <= 0) {
      alert("Please add at least 1 unit to your configuration configurations.");
      return;
    }

    const compiledOrders: Array<{ variant: Variant; qty: number }> = [];

    // Loop over every combination that has quantities allocated to it
    Object.entries(quantities).forEach(([compositeKey, qty]) => {
      if (qty <= 0) return;

      // Locate the original variant object matching this composite signature key
      const foundVariant = variants.find((v) => getCompositeKey(v) === compositeKey);
      
      if (foundVariant) {
        compiledOrders.push({
          variant: foundVariant,
          qty: qty
        });
      }
    });

    if (compiledOrders.length > 0) {
      onConfirm(compiledOrders);
      setIsOpen(false);
    } else {
      alert("Selected configurations configurations are currently unavailable.");
    }
  };

  return (
    <>
      {/* TRIGGER ROW CONTAINER */}
      <div
        onClick={() => setIsOpen(true)}
        className="bg-white dark:bg-neutral-900 p-4 md:rounded-2xl shadow-xs border-y md:border border-slate-200/40 dark:border-neutral-800/60 flex items-center justify-between cursor-pointer active:bg-slate-50 select-none"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-slate-700 dark:text-neutral-300">
            Select Options ({attributeLayers.map((l) => l.name).join(", ")})
          </span>
        </div>
        <div className="text-xs text-orange-500 font-bold flex items-center gap-1">
          {totalQuantity > 0 ? `Selected ${totalQuantity} items` : "Select options"} <span>›</span>
        </div>
      </div>

      {/* OVERLAY INTERFACE POPUP COMPONENT SHEET */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans select-none">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
            style={{ animation: "fadeIn 0.2s ease-out forwards" }}
          />

          <div
            className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl z-10 max-h-[85vh] flex flex-col overflow-hidden"
            style={{ animation: "centerPopup 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
          >
            {/* Header Block Panel */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 flex-shrink-0">
              <div className="w-10" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Configurations</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* MAIN CONTAINER WINDOW SCROLL */}
            <div className="overflow-y-auto p-4 space-y-6 flex-1 pb-36">
              
              {/* IMAGE DETAILS PREVIEW BOX */}
              <div className="flex gap-4 items-start">
                <div 
                  onClick={() => setLightboxImage(currentDisplayImage)}
                  className="group relative w-20 h-20 bg-slate-50 dark:bg-neutral-950 rounded-xl overflow-hidden border border-slate-200/60 dark:border-neutral-800 flex-shrink-0 cursor-zoom-in"
                >
                  <img src={currentDisplayImage} className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105" alt="Selected Preview" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 size={14} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <div className="text-base font-black text-orange-600 dark:text-orange-500">
                      {currencySymbol}{(measurement?.pricePerUnit || basePrice).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Min. order: {measurement?.minOrder || 1} units</div>
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-800 dark:text-white">
                      {currencySymbol}{((measurement?.pricePerUnit || basePrice) * 0.95).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Bulk Tier (500+)</div>
                  </div>
                </div>
              </div>

              {/* AUTOMATED SELECTION LAYERS */}
              {selectionLayers.map((layer) => {
                const isColorLayer = layer.name.toLowerCase() === "color";

                return (
                  <div key={layer.name} className="space-y-2.5">
                    <span className="block text-xs font-bold text-slate-800 dark:text-neutral-200 tracking-wider uppercase">
                      {layer.name}
                    </span>
                    
                    <div className={isColorLayer ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-2"}>
                      {layer.values.map((val) => {
                        const isSelected = selections[layer.name] === val;
                        const countBadge = layerBadges[layer.name]?.[val] || 0;

                        return (
                          <button
                            key={val}
                            onClick={() => setSelections((prev) => ({ ...prev, [layer.name]: val }))}
                            className={`relative flex items-center transition-all rounded-xl border text-left ${
                              isColorLayer ? "p-1.5 gap-2 w-full" : "px-4 py-2.5 text-xs font-bold"
                            } ${
                              isSelected
                                ? "border-slate-900 bg-slate-50 dark:border-orange-500 dark:bg-orange-950/20 text-slate-900 dark:text-white"
                                : "border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-slate-700 dark:text-neutral-300"
                            }`}
                          >
                            {isColorLayer && (
                              <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/40 dark:border-neutral-800">
                                <img src={getColorThumbnail(val)} className="w-full h-full object-cover" alt="" />
                              </div>
                            )}
                            <span className={isColorLayer ? "text-xs font-bold truncate text-slate-800 dark:text-neutral-200" : ""}>
                              {val}
                            </span>
                            
                            {countBadge > 0 && (
                              <span className="absolute -top-1.5 -right-1 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-xs animate-scale-in">
                                ×{countBadge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* DIRECT QUANTITY ADJUSTMENT LAYER MATRIX */}
              {leafLayerName && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-neutral-800">
                  <span className="block text-xs font-bold text-slate-800 dark:text-neutral-200 tracking-wider uppercase">
                    Available {hasOnlyColor ? "Selection" : leafLayerName}
                  </span>

                  <div className="space-y-3">
                    {currentBottomRows.map((v) => {
                      const leafLabel = hasOnlyColor 
                        ? (v.sku || `Standard Pack`) 
                        : (v.options?.[leafLayerName] || v.sku || "Standard Option");
                      const stock = v.stock ?? 0;
                      
                      const compositeKey = getCompositeKey(v);
                      const currentQty = quantities[compositeKey] || 0;

                      const rowImage = v.images?.[0] || (v.options?.Color ? getColorThumbnail(v.options.Color) : defaultImage);

                      return (
                        <div key={v._id} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-neutral-955/30 rounded-xl border border-slate-100 dark:border-neutral-800/50">
                          <div className="flex items-center gap-3">
                            <div 
                              onClick={() => setLightboxImage(rowImage)}
                              className="group relative w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-200/60 dark:border-neutral-800 flex-shrink-0 cursor-zoom-in"
                            >
                              <img src={rowImage} className="w-full h-full object-contain transition-transform duration-150 group-hover:scale-105" alt="" />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[8px]">
                                <Maximize2 size={10} />
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-xs font-black text-slate-800 dark:text-white uppercase">{leafLabel}</span>
                              <span className="block text-[10px] text-slate-400">Inventory: {stock} units</span>
                            </div>
                          </div>

                          {/* Plus / Minus Counter Adjusters */}
                          <div className="flex items-center gap-3 bg-white dark:bg-neutral-950 p-1 rounded-xl border dark:border-neutral-800">
                            <button
                              type="button"
                              onClick={() => updateQty(v, "minus", stock)}
                              disabled={currentQty === 0}
                              className="w-7 h-7 bg-slate-50 dark:bg-neutral-900 rounded-lg shadow-xs flex items-center justify-center text-slate-800 dark:text-white disabled:opacity-30 border dark:border-neutral-800/40"
                            >
                              <Minus size={12} />
                            </button>
                            <span className={`text-xs font-black w-6 text-center ${currentQty > 0 ? "text-orange-600 dark:text-orange-400" : "text-slate-400"}`}>
                              {currentQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(v, "plus", stock)}
                              disabled={currentQty >= stock}
                              className="w-7 h-7 bg-slate-50 dark:bg-neutral-900 rounded-lg shadow-xs flex items-center justify-center text-slate-800 dark:text-white disabled:opacity-30 border dark:border-neutral-800/40"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {currentBottomRows.length === 0 && (
                      <div className="text-center py-6 text-xs text-slate-400 font-medium">
                        No matches available for this combination.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* FIXED FOOTER CONTROLLER BAR */}
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-slate-100 dark:border-neutral-800 p-4 space-y-3 z-20 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] flex-shrink-0">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-700 dark:text-neutral-300">Subtotal</span>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {currencySymbol}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium">Total Items: {totalQuantity}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={totalQuantity < (measurement?.minOrder || 1)}
                className="w-full h-12 rounded-full font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md active:scale-98 transition-all disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-neutral-800 dark:disabled:to-neutral-800 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {totalQuantity < (measurement?.minOrder || 1) 
                  ? `Minimum requirement is ${measurement?.minOrder || 1} units` 
                  : "Start Order"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FULL SCREEN LIGHTBOX MODAL */}
      {lightboxImage && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/90 p-4 animate-fade-in select-none">
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <div 
            className="max-w-3xl max-h-[85vh] w-full h-full flex items-center justify-center p-2"
            onClick={() => setLightboxImage(null)}
          >
            <img 
              src={lightboxImage} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl scale-up-anim" 
              alt="Expanded Preview"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes centerPopup { 
          from { transform: scale(0.9); opacity: 0; } 
          to { transform: scale(1); opacity: 1; } 
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-scale-in { transform: scale(0); animation: scaleIn 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes scaleIn { to { transform: scale(1); } }
        
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .scale-up-anim { animation: centerPopup 0.25s cubic-bezier(0.34, 1.3, 0.64, 1) forwards; }
        .z-55 { z-index: 55; }
        .cursor-zoom-in { cursor: zoom-in; }
      `}</style>
    </>
  );
}