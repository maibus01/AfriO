import { useState } from "react";
import { Trash2, Plus } from "lucide-react";

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

  // 🔥 AUTO GENERATE COMBINATIONS
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

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow border space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Variant Builder</h2>
        <button onClick={onClose} className="text-sm text-gray-500">
          Close
        </button>
      </div>

      {/* INPUTS */}
      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="Sizes (S, M, L)"
          value={sizes}
          onChange={(e) => setSizes(e.target.value)}
          className="border p-2 rounded text-sm"
        />

        <input
          placeholder="Colors (Red, Blue)"
          value={colors}
          onChange={(e) => setColors(e.target.value)}
          className="border p-2 rounded text-sm"
        />
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2">
        <button
          onClick={generateVariants}
          className="bg-black text-white px-3 py-2 rounded text-sm"
        >
          Auto Generate
        </button>

        <button
          onClick={addVariant}
          className="border px-3 py-2 rounded text-sm flex items-center gap-1"
        >
          <Plus size={14} /> Manual Add
        </button>
      </div>

      {/* VARIANTS LIST */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {variants.map((v) => (
          <div
            key={v.id}
            className="grid grid-cols-4 gap-2 border p-3 rounded items-center"
          >
            {/* OPTIONS */}
            <div className="text-xs bg-gray-100 p-1 rounded">
              {JSON.stringify(v.options)}
            </div>

            {/* SKU */}
            <input
              placeholder="SKU"
              value={v.sku}
              onChange={(e) =>
                updateVariant(v.id, "sku", e.target.value)
              }
              className="border p-1 rounded text-xs"
            />

            {/* PRICE */}
            <input
              type="number"
              placeholder="Price"
              value={v.price}
              onChange={(e) =>
                updateVariant(v.id, "price", Number(e.target.value))
              }
              className="border p-1 rounded text-xs"
            />

            {/* STOCK + DELETE */}
            <div className="flex gap-1 items-center">
              <input
                type="number"
                placeholder="Stock"
                value={v.stock}
                onChange={(e) =>
                  updateVariant(v.id, "stock", Number(e.target.value))
                }
                className="border p-1 rounded text-xs w-full"
              />

              <button
                onClick={() => removeVariant(v.id)}
                className="text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SAVE */}
      <button
        onClick={() => onSave(variants)}
        className="w-full bg-black text-white py-2 rounded"
      >
        Save Variants
      </button>
    </div>
  );
}