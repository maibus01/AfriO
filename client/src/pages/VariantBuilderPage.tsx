import { useState, KeyboardEvent } from "react";
import { Trash2, Plus, Sliders, Layers, DollarSign, Package, X, HelpCircle, Check } from "lucide-react";

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
}

interface Props {
  baseName: string;
  basePrice: number;
  onSave: (variants: Variant[]) => void;
  onClose: () => void;
}

// Quick presets for the toggle buttons
const PRESETS = ["Size", "Color", "Storage", "Material"];

export default function VariantBuilderPage({
  baseName,
  basePrice,
  onSave,
  onClose,
}: Props) {
  const [attributes, setAttributes] = useState<Attribute[]>([
    { name: "Color", values: [] },
  ]);
  const [variants, setVariants] = useState<Variant[]>([]);
  // Local state to track what the user is typing in each attribute's value field
  const [inputValue, setInputValue] = useState<Record<number, string>>({});

  // 🎛️ PRESET TOGGLE HANDLER
  const togglePreset = (presetName: string) => {
    const exists = attributes.some((attr) => attr.name.toLowerCase() === presetName.toLowerCase());
    
    if (exists) {
      // If it exists, remove it
      setAttributes((prev) => prev.filter((attr) => attr.name.toLowerCase() !== presetName.toLowerCase()));
    } else {
      // If it doesn't exist, append it
      setAttributes((prev) => [...prev, { name: presetName, values: [] }]);
    }
  };

  // 🛠️ ATTRIBUTE MANAGEMENT HANDLERS
  const addCustomAttribute = () => {
    setAttributes((prev) => [...prev, { name: "", values: [] }]);
  };

  const removeAttributeField = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
    // Clean up temporary input state for this index
    const newInputs = { ...inputValue };
    delete newInputs[index];
    setInputValue(newInputs);
  };

  const updateAttributeName = (index: number, name: string) => {
    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, name } : attr))
    );
  };

  // 🏷️ ENTER-KEY TAG SYSTEM (No Commas Needed)
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = inputValue[index]?.trim();
      
      if (!value) return;

      // Don't add duplicate values to the same attribute
      if (attributes[index].values.includes(value)) {
        setInputValue((prev) => ({ ...prev, [index]: "" }));
        return;
      }

      setAttributes((prev) =>
        prev.map((attr, i) =>
          i === index ? { ...attr, values: [...attr.values, value] } : attr
        )
      );

      // Reset just this row's input field
      setInputValue((prev) => ({ ...prev, [index]: "" }));
    }
  };

  const removeValueTag = (attrIndex: number, valueIndex: number) => {
    setAttributes((prev) =>
      prev.map((attr, i) =>
        i === attrIndex
          ? { ...attr, values: attr.values.filter((_, vIdx) => vIdx !== valueIndex) }
          : attr
      )
    );
  };

  // ⚡ RECURSIVE CARTESIAN ENGINE
  const generateVariants = () => {
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

    const newVariants: Variant[] = combos.map((combo, i) => {
      const skuSuffix = Object.values(combo)
        .join("-")
        .replace(/\s+/g, "")
        .toUpperCase();
        
      return {
        id: `var-${Date.now()}-${i}`,
        sku: `${baseName.substring(0, 3).toUpperCase()}-${skuSuffix}`,
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
      onClick={() => onSave(variants)}
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
            <p className="text-xs text-gray-500">Toggle presets or add custom configuration attributes</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
        
        {/* 🎛️ PRESET TOGGLES BANK */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
            Quick Toggle Attributes
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => {
              const isActive = attributes.some((attr) => attr.name.toLowerCase() === preset.toLowerCase());
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => togglePreset(preset)}
                  className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all flex items-center gap-1.5 shadow-xs ${
                    isActive
                      ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                      : "bg-white border-gray-200 text-zinc-700 hover:bg-gray-50"
                  }`}
                >
                  {isActive && <Check size={12} />}
                  {preset}
                </button>
              );
            })}
            
            <button
              type="button"
              onClick={addCustomAttribute}
              className="text-xs font-medium px-3 py-2 rounded-lg border border-dashed border-zinc-300 text-zinc-600 hover:bg-zinc-50 flex items-center gap-1"
            >
              <Plus size={13} /> Custom Attribute
            </button>
          </div>
        </div>

        {/* DYNAMIC ATTRIBUTES BUILDER */}
        <div className="space-y-3">
          {attributes.map((attr, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50/40 border border-gray-100 rounded-xl items-start">
              
              {/* Attribute Label Name */}
              <div className="md:col-span-3 space-y-1">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Label Name</span>
                <input
                  placeholder="e.g. Plug Type, Speed"
                  value={attr.name}
                  onChange={(e) => updateAttributeName(index, e.target.value)}
                  className="w-full border border-gray-200 bg-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-medium"
                />
              </div>

              {/* Tag System Values Output + Input */}
              <div className="md:col-span-8 space-y-1.5">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                  Values (Type value and press <kbd className="bg-gray-200 px-1 rounded text-[10px] font-mono font-bold text-gray-600">Enter</kbd>)
                </span>
                
                <div className="w-full border border-gray-200 bg-white p-1.5 rounded-lg flex flex-wrap gap-1.5 items-center min-h-[40px] focus-within:ring-1 focus-within:ring-zinc-900 transition-all">
                  {/* Generated Tags */}
                  {attr.values.map((val, vIdx) => (
                    <span
                      key={vIdx}
                      className="inline-flex items-center gap-1 text-xs bg-zinc-100 text-zinc-800 px-2 py-1 rounded-md border border-zinc-200/60 font-medium"
                    >
                      {val}
                      <button
                        type="button"
                        onClick={() => removeValueTag(index, vIdx)}
                        className="text-gray-400 hover:text-zinc-900 p-0.5 rounded"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  
                  {/* Seamless Input Field */}
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
                  onClick={() => removeAttributeField(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove row"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* COMBINATION TRIGGER ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={generateVariants}
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
                      Object.entries(v.options).map(([key, val]) => (
                        <span key={key} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200/50">
                          <strong className="text-zinc-500 font-normal">{key}:</strong> {val}
                        </span>
                      ))
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

        {/* BOTTOM SAVE ACTION */}
        {variants.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl px-4">
            <p className="text-sm text-gray-400">No variants compiled yet. Toggle preset options above, add details, and generate.</p>
          </div>
        )}

        <div className="hidden md:block pt-2">
          <SaveButton />
        </div>
      </div>
    </div>
  );
}
