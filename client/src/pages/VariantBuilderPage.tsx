import { useState } from "react";
import { Trash2, Plus, Sliders, Layers, DollarSign, Package, X, HelpCircle } from "lucide-react";

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

export default function VariantBuilderPage({
  baseName,
  basePrice,
  onSave,
  onClose,
}: Props) {
  // ⚡ Fully dynamic marketplace attributes state
  const [attributes, setAttributes] = useState<Attribute[]>([
    { name: "Color", values: [] },
  ]);
  const [variants, setVariants] = useState<Variant[]>([]);

  // 🛠️ ATTRIBUTE MANAGEMENT HANDLERS
  const addAttributeField = () => {
    setAttributes((prev) => [...prev, { name: "", values: [] }]);
  };

  const removeAttributeField = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAttributeName = (index: number, name: string) => {
    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, name } : attr))
    );
  };

  const handleValuesInput = (index: number, valueString: string) => {
    // Splits on commas and strips out empty spaces on-the-fly
    const valuesArray = valueString
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v !== "");

    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, values: valuesArray } : attr))
    );
  };

  // ⚡ RECURSIVE CARTESIAN ENGINE (Universal Generation Engine)
  const generateVariants = () => {
    // Only compile fields with a name and actual values present
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
      // Intelligently auto-generate a descriptive dynamic SKU string
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

  // ➕ MANUAL ADD (Gracefully degradation to custom unmapped rows)
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

  // ❌ DELETE VARIANT
  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  // ✏️ UPDATE SINGLE VARIANT FIELDS
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
            <p className="text-xs text-gray-500">Add custom attributes and options dynamically</p>
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
        
        {/* DYNAMIC ATTRIBUTIONS CREATOR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
              Product Attributes
            </label>
            <button
              type="button"
              onClick={addAttributeField}
              className="text-xs font-medium text-zinc-950 hover:text-zinc-800 flex items-center gap-1.5 border border-zinc-200 px-2.5 py-1 rounded-md bg-white hover:bg-gray-50 shadow-xs transition-all"
            >
              <Plus size={13} /> Add Custom Attribute
            </button>
          </div>

          <div className="space-y-3">
            {attributes.map((attr, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3.5 bg-gray-50/50 border border-gray-100 rounded-xl"
              >
                {/* ATTRIBUTE KEY NAME */}
                <div className="md:col-span-4 space-y-1">
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                    Attribute Label
                  </span>
                  <input
                    placeholder="e.g., Storage, Material, Size"
                    value={attr.name}
                    onChange={(e) => updateAttributeName(index, e.target.value)}
                    className="w-full border border-gray-200 bg-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
                  />
                </div>

                {/* ATTRIBUTE RAW VALUES CONTAINER */}
                <div className="md:col-span-7 space-y-1">
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                    Values (Comma Separated)
                  </span>
                  <input
                    placeholder="e.g., 128GB, 256GB, 512GB"
                    value={attr.values.join(", ")}
                    onChange={(e) => handleValuesInput(index, e.target.value)}
                    className="w-full border border-gray-200 bg-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
                  />
                </div>

                {/* TRASH ROW DELETION */}
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    disabled={attributes.length === 1}
                    onClick={() => removeAttributeField(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors border border-transparent md:mb-0.5"
                    title="Remove field"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
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

        {/* COMPILING GENERATED RESULTS MATRIX */}
        {variants.length > 0 && (
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Table Dynamic Headers - Adapts layout automatically */}
            <div className="hidden md:grid grid-cols-12 gap-3 bg-gray-50 px-4 py-2.5 border-b border-gray-200 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              <div className="col-span-4">Generated Option Badges</div>
              <div className="col-span-3">SKU Identifier</div>
              <div className="col-span-3">Price ($)</div>
              <div className="col-span-2">Stock</div>
            </div>

            {/* List Rows */}
            <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto bg-gray-50 md:bg-white">
              {variants.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-col md:grid md:grid-cols-12 gap-3 p-4 md:px-4 md:py-3 items-start md:items-center bg-white hover:bg-gray-50/70 transition-colors"
                >
                  {/* DYNAMIC OPTION CHIPS */}
                  <div className="col-span-4 flex flex-wrap gap-1 w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block md:hidden mb-0.5 w-full">
                      Attributes Mapping
                    </span>
                    {Object.keys(v.options).length === 0 ? (
                      <span className="text-xs text-gray-400 italic flex items-center gap-1">
                        <HelpCircle size={12} /> Custom Row
                      </span>
                    ) : (
                      Object.entries(v.options).map(([key, val]) => (
                        <span
                          key={key}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200/50"
                        >
                          <strong className="text-zinc-500 font-normal">{key}:</strong> {val}
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
                      placeholder="e.g. ELECTRONIC-128GB"
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

                  {/* STOCK & ACTION ROW */}
                  <div className="col-span-2 flex gap-3 items-end md:items-center w-full">
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
            <p className="text-sm text-gray-400">
              No variants compiled yet. Define dynamic custom attributes above, or add a standard manual variation row.
            </p>
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
