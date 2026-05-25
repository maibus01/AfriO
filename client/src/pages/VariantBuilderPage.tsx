import { useState } from "react";
import { Trash2, Plus, Sliders, Layers, DollarSign, Package, X } from "lucide-react";

type Variant = {
  id: string;
  sku: string;
  options: Record<string, string>;
  price: number;
  stock: number;
};

interface Props {
  baseName: string;
  basePrice: number;
  onSave: (variants: Variant[]) => void;
  onClose: () => void;
}

export default function VariantBuilderPage({
  baseName,
  basePrice,
  onSave,
  onClose,
}: Props) {
  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");
  const [variants, setVariants] = useState<Variant[]>([]);

  // ⚡ AUTO GENERATE COMBINATIONS
  const generateVariants = () => {
    const sizeArr = sizes.split(",").map((s) => s.trim()).filter(Boolean);
    const colorArr = colors.split(",").map((c) => c.trim()).filter(Boolean);

    let combos: Record<string, string>[] = [];

    if (sizeArr.length && colorArr.length) {
      sizeArr.forEach((s) =>
        colorArr.forEach((c) => combos.push({ size: s, color: c }))
      );
    } else if (sizeArr.length) {
      sizeArr.forEach((s) => combos.push({ size: s }));
    } else if (colorArr.length) {
      colorArr.forEach((c) => combos.push({ color: c }));
    }

    const newVariants: Variant[] = combos.map((combo, i) => ({
      id: `var-${Date.now()}-${i}`,
      sku: `${baseName.substring(0, 3).toUpperCase()}-${Object.values(combo)
        .join("-")
        .toUpperCase()}`,
      options: combo,
      price: basePrice || 0,
      stock: 10,
    }));

    setVariants(newVariants);
  };

  // ➕ MANUAL ADD
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}`,
        sku: "",
        options: {},
        price: basePrice || 0,
        stock: 0,
      },
    ]);
  };

  // ❌ DELETE
  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  // ✏️ UPDATE FIELD
  const updateVariant = (
    id: string,
    field: keyof Variant,
    value: any
  ) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      )
    );
  };

  // Reusable Save Button sub-component to keep code clean
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
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900">Variant Builder</h2>
            <p className="text-xs text-gray-500">Manage stock and pricing for variations</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
        {/* INPUTS SECTION */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Generate Attributes</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-gray-500">Sizes (Comma separated)</span>
              <input
                placeholder="S, M, L, XL"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-500">Colors (Comma separated)</span>
              <input
                placeholder="Black, White, Crimson"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* ACTIONS & TOP SAVE BUTTON (FOR MOBILE) */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={generateVariants}
            className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white font-medium px-4 py-2.5 rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Layers size={15} /> Auto Generate
          </button>

          <button
            onClick={addVariant}
            className="w-full sm:w-auto border border-gray-200 hover:bg-gray-50 text-zinc-700 font-medium px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
          >
            <Plus size={15} /> Manual Add
          </button>

          {/* ⚡ Mobile-only Save Button (Hidden on Desktop) */}
          <div className="block md:hidden pt-2 border-t border-gray-100 mt-2">
            <SaveButton />
          </div>
        </div>

        {/* VARIANTS LIST */}
        {variants.length > 0 && (
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Table Headers - Hidden on Mobile */}
            <div className="hidden md:grid grid-cols-12 gap-3 bg-gray-50 px-4 py-2.5 border-b border-gray-200 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              <div className="col-span-3">Attributes</div>
              <div className="col-span-3">SKU</div>
              <div className="col-span-3">Price ($)</div>
              <div className="col-span-3">Stock</div>
            </div>

            {/* List Rows */}
            <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto bg-gray-50 md:bg-white">
              {variants.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-col md:grid md:grid-cols-12 gap-3 p-4 md:px-4 md:py-3 items-start md:items-center bg-white hover:bg-gray-50/70 transition-colors"
                >
                  {/* OPTIONS BADGES */}
                  <div className="col-span-3 flex flex-wrap gap-1 w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block md:hidden mb-0.5 w-full">
                      Attributes
                    </span>
                    {Object.keys(v.options).length === 0 ? (
                      <span className="text-xs text-gray-400 italic">Custom</span>
                    ) : (
                      Object.entries(v.options).map(([key, val]) => (
                        <span 
                          key={key} 
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200/50"
                        >
                          {val}
                        </span>
                      ))
                    )}
                  </div>

                  {/* SKU */}
                  <div className="col-span-3 w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block md:hidden mb-1">
                      SKU
                    </span>
                    <input
                      placeholder="e.g. TSHIRT-S-RED"
                      value={v.sku}
                      onChange={(e) => updateVariant(v.id, "sku", e.target.value)}
                      className="w-full border border-gray-200 px-3 py-2 md:px-2.5 md:py-1.5 rounded-md text-xs font-mono uppercase focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                    />
                  </div>

                  {/* PRICE */}
                  <div className="col-span-3 relative w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block md:hidden mb-1">
                      Price
                    </span>
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

                  {/* STOCK + DELETE */}
                  <div className="col-span-3 flex gap-3 items-end md:items-center w-full">
                    <div className="relative w-full">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block md:hidden mb-1">
                        Stock
                      </span>
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
                      <span className="text-[10px] block md:hidden opacity-0 pointer-events-none mb-1">
                        Remove
                      </span>
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
            <p className="text-sm text-gray-400">No variants generated yet. Enter options above or add manually.</p>
          </div>
        )}

        {/* BOTTOM SAVE ACTION (FOR DESKTOP ONLY) */}
        <div className="hidden md:block pt-2">
          <SaveButton />
        </div>
      </div>
    </div>
  );
}