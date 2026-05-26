import { useState, useRef } from "react";
import type { KeyboardEvent } from "react";
import { Trash2, Plus, Sliders, Layers, DollarSign, Package, X, HelpCircle, Check, Image as ImageIcon, AlertTriangle } from "lucide-react";

type Variant = {
  id: string;
  sku: string;
  options: Record<string, string>;
  price: number;
  stock: number;
};

interface Attribute {
  name: string;
  values: string[];
  hasImage?: boolean;
}

interface Props {
  baseName: string;
  basePrice: number;
  onSave: (variants: Variant[], attributeImages: Record<string, string>) => void;
  onClose: () => void;
}

// 📦 Define the high-level Product Type templates
type ProductType = "clothing" | "phone" | "electronics" | "custom";

const VARIANT_LIMIT = 200;

export default function VariantBuilderPage({
  baseName,
  basePrice,
  onSave,
  onClose,
}: Props) {
  // Track the top-level product category type
  const [productType, setProductType] = useState<ProductType>("custom");
  
  const [attributes, setAttributes] = useState<Attribute[]>([
    { name: "Color", values: [], hasImage: true },
  ]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [inputValue, setInputValue] = useState<Record<number, string>>({});
  const [attributeImages, setAttributeImages] = useState<Record<string, string>>({});
  const [showOverwiteWarning, setShowOverwriteWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ⚡ PRODUCT TYPE TEMPLATE ENFORCER
  const handleProductTypeChange = (type: ProductType) => {
    setProductType(type);
    setVariants([]); // Clear variants to prevent stale matrices
    setAttributeImages({});
    setErrorMessage(null);

    // Swap templates instantly based on choice
    switch (type) {
      case "clothing":
        setAttributes([
          { name: "Size", values: ["S", "M", "L", "XL"], hasImage: false },
          { name: "Color", values: ["Black", "White", "Navy"], hasImage: true }
        ]);
        break;
      case "phone":
        setAttributes([
          { name: "Model", values: [baseName || "iPhone 11 Pro"], hasImage: false },
          { name: "Storage", values: ["128GB", "256GB", "512GB"], hasImage: false },
          { name: "Color", values: ["Midnight Green", "Space Gray", "Silver"], hasImage: true }
        ]);
        break;
      case "electronics":
        setAttributes([
          { name: "RAM", values: ["8GB", "16GB"], hasImage: false },
          { name: "Storage", values: ["256GB", "512GB"], hasImage: false }
        ]);
        break;
      case "custom":
      default:
        setAttributes([{ name: "Color", values: [], hasImage: true }]);
        break;
    }
  };

  // 🛠️ ATTRIBUTE MANAGEMENT HANDLERS
  const addCustomAttribute = () => {
    setAttributes((prev) => [...prev, { name: "", values: [], hasImage: false }]);
    setErrorMessage(null);
  };

  const removeAttributeField = (index: number) => {
    const attrToRemove = attributes[index];
    if (attrToRemove) {
      setAttributeImages(prev => {
        const updated = { ...prev };
        attrToRemove.values.forEach(val => delete updated[`${attrToRemove.name}:${val}`]);
        return updated;
      });
    }
    setAttributes((prev) => prev.filter((_, i) => i !== index));
    const newInputs = { ...inputValue };
    delete newInputs[index];
    setInputValue(newInputs);
    setErrorMessage(null);
  };

  const updateAttributeName = (index: number, name: string) => {
    const oldName = attributes[index].name;
    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, name } : attr))
    );
    
    if (oldName && oldName !== name) {
      setAttributeImages(prev => {
        const updated = { ...prev };
        attributes[index].values.forEach(val => {
          if (updated[`${oldName}:${val}`]) {
            updated[`${name}:${val}`] = updated[`${oldName}:${val}`];
            delete updated[`${oldName}:${val}`];
          }
        });
        return updated;
      });
    }
  };

  const toggleImageSupport = (index: number) => {
    setAttributes(prev => prev.map((attr, i) => i === index ? { ...attr, hasImage: !attr.hasImage } : attr));
  };

  // 🏷️ ENTER-KEY TAG SYSTEM
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = inputValue[index]?.trim();
      const attrName = attributes[index].name.trim();
      
      if (!value || !attrName) return;
      if (attributes[index].values.includes(value)) {
        setInputValue((prev) => ({ ...prev, [index]: "" }));
        return;
      }

      setAttributes((prev) =>
        prev.map((attr, i) =>
          i === index ? { ...attr, values: [...attr.values, value] } : attr
        )
      );
      setInputValue((prev) => ({ ...prev, [index]: "" }));
      setErrorMessage(null);
    }
  };

  const removeValueTag = (attrIndex: number, valueIndex: number) => {
    const attrName = attributes[attrIndex].name;
    const valToRemove = attributes[attrIndex].values[valueIndex];
    
    setAttributeImages(prev => {
      const updated = { ...prev };
      delete updated[`${attrName}:${valToRemove}`];
      return updated;
    });

    setAttributes((prev) =>
      prev.map((attr, i) =>
        i === attrIndex
          ? { ...attr, values: attr.values.filter((_, vIdx) => vIdx !== valueIndex) }
          : attr
      )
    );
    setErrorMessage(null);
  };

  // 📸 IMAGE UPLOAD HANDLER
 const handleImageUpload = async (
  attrName: string,
  value: string,
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("images", file);

  const res = await fetch("/api/upload-single", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  const imageUrl = data.url; // Cloudinary URL

  const compositeKey = `${attrName}:${value}`;

  setAttributeImages((prev) => ({
    ...prev,
    [compositeKey]: imageUrl,
  }));
};
  const triggerFileInput = (attrName: string, value: string) => {
    fileInputRefs.current[`${attrName}:${value}`]?.click();
  };

  const removeImage = (attrName: string, value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAttributeImages(prev => {
      const updated = { ...prev };
      delete updated[`${attrName}:${value}`];
      return updated;
    });
  };

  // ⚡ RECURSIVE CARTESIAN ENGINE
  const handleGenerationClick = () => {
    if (variants.length > 0 && !showOverwiteWarning) {
      setShowOverwriteWarning(true);
      return;
    }
    executeGeneration();
  };

  const executeGeneration = () => {
    setShowOverwriteWarning(false);
    setErrorMessage(null);

    const validAttributes = attributes.filter(
      (attr) => attr.name.trim() && attr.values.length > 0
    );

    if (validAttributes.length === 0) return;

    const combos: Record<string, string>[] = [];

    function backtrack(index: number, currentCombo: Record<string, string>) {
      if (index === validAttributes.length) {
        combos.push({ ...currentCombo });
        return;
      }

      const currentAttr = validAttributes[index];
      for (const value of currentAttr.values) {
        currentCombo[currentAttr.name] = value;
        backtrack(index + 1, currentCombo);
      }
    }

    backtrack(0, {});

    if (combos.length > VARIANT_LIMIT) {
      setErrorMessage(`Matrix explosion safety trigger! This setup generates ${combos.length} variants. Your system limit is ${VARIANT_LIMIT}. Please slim down your options.`);
      return;
    }

    const newVariants: Variant[] = combos.map((combo, i) => {
      const skuSuffix = Object.values(combo).join("-").replace(/\s+/g, "").toUpperCase();
      const generatedSku = `${baseName.substring(0, 3).toUpperCase()}-${skuSuffix}`;

      const existingMatch = variants.find(v => 
        Object.keys(combo).length === Object.keys(v.options).length &&
        Object.entries(combo).every(([k, val]) => v.options[k] === val)
      );

      if (existingMatch) return existingMatch; 
        
      return {
        id: `var-${Date.now()}-${i}`,
        sku: generatedSku,
        options: combo,
        price: basePrice || 0,
        stock: 10,
      };
    });

    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { id: `var-${Date.now()}`, sku: "", options: {}, price: basePrice || 0, stock: 0 },
    ]);
  };

  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const updateVariant = (id: string, field: keyof Variant, value: any) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const SaveButton = () => (
    <button
      onClick={() => onSave(variants, attributeImages)}
      disabled={variants.length === 0}
      className={`w-full font-medium py-3 rounded-lg text-sm transition-all shadow-sm ${
        variants.length === 0
          ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
          : "bg-zinc-950 hover:bg-zinc-800 text-white"
      }`}
    >
      Save {variants.length > 0 ? `${variants.length} Variant(s)` : "Variants"}
    </button>
  );

  return (
    <div className="max-w-4xl mx-4 sm:mx-6 md:mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 my-6 flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <div className="px-4 py-4 sm:px-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <Sliders className="text-zinc-700 w-5 h-5 flex-shrink-0" />
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900">Universal Variant Engine</h2>
            <p className="text-xs text-gray-500">Select your product class template or map custom properties</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-xs flex gap-3 items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* 🏬 NEW: TOP-LEVEL PRODUCT TYPE SELECTOR PILLS */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
            What type of product is this?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "clothing", label: "👕 Clothing Template" },
              { id: "phone", label: "📱 Smartphone Template" },
              { id: "electronics", label: "🔌 General Electronics" },
              { id: "custom", label: "✨ Clean Slate / Custom" }
            ].map((type) => {
              const isSelected = productType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleProductTypeChange(type.id as ProductType)}
                  className={`text-xs font-medium px-3 py-3 rounded-xl border text-center transition-all shadow-xs ${
                    isSelected
                      ? "bg-zinc-950 border-zinc-950 text-white shadow-md font-semibold"
                      : "bg-white border-gray-200 text-zinc-700 hover:bg-gray-50"
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* DYNAMIC ATTRIBUTES BUILDER */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
              Attributes Configurator
            </label>
            <button
              type="button"
              onClick={addCustomAttribute}
              className="text-xs font-medium text-zinc-950 hover:text-zinc-800 flex items-center gap-1 border border-zinc-200 px-2.5 py-1 rounded-md bg-white hover:bg-gray-50 shadow-xs"
            >
              <Plus size={13} /> Add Extra Field
            </button>
          </div>

          {attributes.map((attr, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50/40 border border-gray-100 rounded-xl items-start">
              
              {/* Attribute Label Name */}
              <div className="md:col-span-3 space-y-2">
                <div>
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide block mb-1">Label Name</span>
                  <input
                    placeholder="e.g. Size, Color, Capacity"
                    value={attr.name}
                    onChange={(e) => updateAttributeName(index, e.target.value)}
                    className="w-full border border-gray-200 bg-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-medium"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={!!attr.hasImage}
                    onChange={() => toggleImageSupport(index)}
                    className="rounded border-gray-300 text-zinc-950 focus:ring-zinc-900 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] font-medium text-zinc-600">Enable Asset Uploads</span>
                </label>
              </div>

              {/* Tag System Values Output + Input */}
              <div className="md:col-span-8 space-y-1.5">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                  Values (Type value and press <kbd className="bg-gray-200 px-1 rounded text-[10px] font-mono font-bold text-gray-600">Enter</kbd>)
                </span>
                
                <div className="w-full border border-gray-200 bg-white p-1.5 rounded-lg flex flex-wrap gap-2 items-center min-h-[44px] focus-within:ring-1 focus-within:ring-zinc-900 transition-all">
                  {attr.values.map((val, vIdx) => {
                    const compositeKey = `${attr.name}:${val}`;
                    const hasImage = !!attributeImages[compositeKey];
                    
                    return (
                      <span
                        key={vIdx}
                        onClick={() => attr.hasImage && triggerFileInput(attr.name, val)}
                        className={`inline-flex items-center gap-1.5 text-xs bg-zinc-100 text-zinc-800 pl-1.5 pr-2 py-1 rounded-md border border-zinc-200/60 font-medium relative group ${attr.hasImage ? 'cursor-pointer hover:bg-zinc-200/80 transition-colors' : ''}`}
                      >
                        {attr.hasImage && (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              ref={el => { fileInputRefs.current[compositeKey] = el; }}
                              onChange={(e) => handleImageUpload(attr.name, val, e)}
                              className="hidden"
                            />
                            
                            {hasImage ? (
                              <div className="w-4 h-4 rounded bg-cover bg-center relative border border-black/10" style={{ backgroundImage: `url(${attributeImages[compositeKey]})` }}>
                                <div 
                                  onClick={(e) => removeImage(attr.name, val, e)}
                                  className="absolute -top-1.5 -right-1.5 bg-zinc-950 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 scale-75 hover:bg-red-600 transition-all"
                                >
                                  <X size={8} />
                                </div>
                              </div>
                            ) : (
                              <ImageIcon size={12} className="text-gray-400 group-hover:text-zinc-600 transition-colors" />
                            )}
                          </>
                        )}

                        {val}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeValueTag(index, vIdx);
                          }}
                          className="text-gray-400 hover:text-zinc-900 p-0.5 rounded"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                  
                  <input
                    placeholder={attr.values.length === 0 ? "Type option value..." : ""}
                    value={inputValue[index] || ""}
                    onChange={(e) => setInputValue((prev) => ({ ...prev, [index]: e.target.value }))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="flex-1 min-w-[120px] bg-transparent px-2 py-0.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Delete Attribute Row */}
              <div className="md:col-span-1 flex justify-end pt-5 md:pt-4">
                <button
                  type="button"
                  disabled={attributes.length === 1}
                  onClick={() => removeAttributeField(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-20 rounded-lg transition-colors"
                  title="Remove row"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* ACTIONS & COMBINATION MATRIX TRIGGER */}
        <div className="bg-white rounded-xl space-y-3">
          {showOverwiteWarning && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Regeneration Alert:</strong> Re-compiling combinations preserves prices and stock matching current attributes, but unmapped edits will reset.
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button onClick={() => setShowOverwriteWarning(false)} className="text-zinc-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={executeGeneration} className="text-white bg-amber-600 px-3 py-1.5 rounded-lg font-medium hover:bg-amber-700">Continue</button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={handleGenerationClick}
              className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white font-medium px-4 py-2.5 rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Layers size={15} /> Auto-Generate Matrices
            </button>

            <button
              onClick={addVariant}
              className="w-full sm:w-auto border border-gray-200 hover:bg-gray-50 text-zinc-700 font-medium px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
            >
              <Plus size={15} /> Manual Add Row
            </button>

            <div className="block md:hidden pt-2 border-t border-gray-100 mt-2">
              <SaveButton />
            </div>
          </div>
        </div>

        {/* MATRIX CONTAINER */}
        {variants.length > 0 && (
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="hidden md:grid grid-cols-12 gap-3 bg-gray-50 px-4 py-2.5 border-b border-gray-200 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              <div className="col-span-4">Generated Option Badges</div>
              <div className="col-span-3">SKU Identifier</div>
              <div className="col-span-3">Price ($)</div>
              <div className="col-span-2">Stock</div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto bg-gray-50 md:bg-white">
              {variants.map((v) => (
                <div key={v.id} className="flex flex-col md:grid md:grid-cols-12 gap-3 p-4 md:px-4 md:py-3 items-start md:items-center bg-white hover:bg-gray-50/70 transition-colors">
                  
                  {/* Dynamic Chip Mapping */}
                  <div className="col-span-4 flex flex-wrap gap-1 w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block md:hidden mb-0.5 w-full">Attributes Mapping</span>
                    {Object.keys(v.options).length === 0 ? (
                      <span className="text-xs text-gray-400 italic flex items-center gap-1">
                        <HelpCircle size={12} /> Custom Row
                      </span>
                    ) : (
                      Object.entries(v.options).map(([key, val]) => {
                        const compositeKey = `${key}:${val}`;
                        const hasImg = !!attributeImages[compositeKey];
                        return (
                          <span key={key} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200/50">
                            {hasImg && (
                              <div className="w-3 h-3 rounded bg-cover bg-center border border-black/10" style={{ backgroundImage: `url(${attributeImages[compositeKey]})` }} />
                            )}
                            <strong className="text-zinc-500 font-normal">{key}:</strong> {val}
                          </span>
                        );
                      })
                    )}
                  </div>

                  {/* SKU */}
                  <div className="col-span-3 w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block md:hidden mb-1">SKU</span>
                    <input
                      placeholder="e.g. ITEM-XL"
                      value={v.sku}
                      onChange={(e) => updateVariant(v.id, "sku", e.target.value)}
                      className="w-full border border-gray-200 px-3 py-2 md:px-2.5 md:py-1.5 rounded-md text-xs font-mono uppercase focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                    />
                  </div>

                  {/* PRICE */}
                  <div className="col-span-3 relative w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block md:hidden mb-1">Price</span>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-400">
                        <DollarSign size={12} />
                      </div>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={v.price || ""}
                        onChange={(e) => updateVariant(v.id, "price", Number(e.target.value))}
                        className="w-full border border-gray-200 pl-6 pr-2.5 py-2 md:py-1.5 rounded-md text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* STOCK & DELETE */}
                  <div className="col-span-2 flex gap-3 items-end md:items-center w-full">
                    <div className="relative w-full">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block md:hidden mb-1">Stock</span>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-400">
                          <Package size={12} />
                        </div>
                        <input
                          type="number"
                          placeholder="0"
                          value={v.stock || ""}
                          onChange={(e) => updateVariant(v.id, "stock", Number(e.target.value))}
                          className="w-full border border-gray-200 pl-6 pr-2.5 py-2 md:py-1.5 rounded-md text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-end">
                      <button
                        onClick={() => removeVariant(v.id)}
                        className="p-2 md:p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors border border-gray-100 md:border-none flex items-center justify-center bg-gray-50 md:bg-transparent"
                        title="Remove variant"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {variants.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl px-4">
            <p className="text-sm text-gray-400">No variants compiled yet. Select a template preset above, fill values, and generate.</p>
          </div>
        )}

        <div className="hidden md:block pt-2">
          <SaveButton />
        </div>
      </div>
    </div>
  );
}