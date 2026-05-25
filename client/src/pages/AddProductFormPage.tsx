import { useState, useEffect } from "react";
import axios from "axios";
import { X, Trash2, Loader2, Layers } from "lucide-react";
import VariantBuilderPage from "./VariantBuilderPage";

const API = "https://afrio-api.onrender.com/api";

const CATEGORIES = [
  { value: "clothes", label: "Clothing & Apparel" },
  { value: "fabric", label: "Fabrics & Textiles" },
  { value: "kids_baby", label: "Kids & Baby Products" },
  { value: "phones_accessories", label: "Phones & Accessories" },
  { value: "electronics", label: "Consumer Electronics" },
  { value: "appliances", label: "Home Appliances" },
  { value: "furniture", label: "Furniture & Home" },
  { value: "kitchenware", label: "Kitchenware" },
  { value: "shoes_bags", label: "Shoes & Bags" },
  { value: "groceries", label: "Groceries & Food" },
  { value: "construction_hardware", label: "Hardware" },
  { value: "other", label: "Others" },
];

const CURRENCIES = [{ value: "NGN" }, { value: "USD" }, { value: "CNY" }, { value: "GBP" }];

const INITIAL_FORM_STATE = {
  name: "",
  description: "",
  images: [] as string[],
  category: "clothes",
  condition: "new" as "new" | "used" | "refurbished",
  basePrice: "",
  currency: "NGN" as "NGN" | "USD" | "CNY" | "GBP",
  stock: "",
  features: {
    variants: false,
    attributes: false,
    size: false,
    color: false,
    weight: false,
    measurement: false,
    bulkPricing: false,
    origin: false,
  },
  attributesInput: { size: "", color: "" },
  variants: [] as Array<{ id: string; sku: string; options: Record<string, string>; price: number; stock: number }>,
  bulkPricing: [] as Array<{ minQty: number; price: number }>,
  measurement: {
    unit: "yard" as "meter" | "yard" | "kg" | "liter",
    pricePerUnit: "",
    minOrder: ""
  },
  origin: { country: "", city: "" }
};

interface AddProductFormPageProps {
  editProductData?: any | null;
  onCloseOrComplete: () => void;
}

export default function AddProductFormPage({ editProductData, onCloseOrComplete }: AddProductFormPageProps) {
  const token = localStorage.getItem("token");
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [businessId, setBusinessId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showVariantPage, setShowVariantPage] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await axios.get(`${API}/business`, { headers: { Authorization: `Bearer ${token}` } });
        const vendor = res.data.data.find((b: any) => b.category === "vendor");
        if (vendor) setBusinessId(vendor._id);
      } catch (err) {
        console.error("Could not fetch profile context ID", err);
      }
    };
    fetchBusiness();

    if (editProductData) {
      setForm({
        ...INITIAL_FORM_STATE,
        ...editProductData,
        basePrice: editProductData.basePrice?.toString() || "",
        stock: editProductData.stock?.toString() || "",
        attributesInput: {
          size: editProductData.attributes?.size?.join(", ") || "",
          color: editProductData.attributes?.color?.join(", ") || ""
        },
        features: { ...INITIAL_FORM_STATE.features, ...editProductData.features }
      });
    }
  }, [editProductData, token]);

  const compilePayload = () => {
    const payload: any = {
      name: form.name,
      description: form.description,
      images: form.images,
      category: form.category,
      condition: form.condition,
      currency: form.currency,
      features: form.features,
      stock: form.stock ? Number(form.stock) : 0,
      basePrice: form.basePrice ? Number(form.basePrice) : undefined,
      businessId: editProductData ? editProductData.businessId : businessId,
    };

    if (form.features.attributes) {
      payload.attributes = {};
      if (form.features.size && form.attributesInput.size) {
        payload.attributes.size = form.attributesInput.size.split(",").map(s => s.trim()).filter(Boolean);
      }
      if (form.features.color && form.attributesInput.color) {
        payload.attributes.color = form.attributesInput.color.split(",").map(c => c.trim()).filter(Boolean);
      }
    }

    if (form.features.variants) {
      payload.variants = form.variants.map(v => ({
        id: v.id || Math.random().toString(36).substring(2, 7),
        sku: v.sku,
        options: v.options,
        price: Number(v.price),
        stock: Number(v.stock)
      }));
    }

    if (form.features.bulkPricing) {
      payload.bulkPricing = form.bulkPricing.map(b => ({
        minQty: Number(b.minQty),
        price: Number(b.price)
      }));
    }

    if (form.features.measurement) {
      payload.measurement = {
        unit: form.measurement.unit,
        pricePerUnit: Number(form.measurement.pricePerUnit),
        minOrder: Number(form.measurement.minOrder || 1)
      };
    }

    return payload;
  };

  const handleSaveProduct = async () => {
    try {
      const payload = compilePayload();
      if (editProductData) {
        await axios.patch(`${API}/products/${editProductData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API}/products`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onCloseOrComplete();
    } catch (err) {
      console.error(err);
      alert("Operational issue executing catalog save schema.");
    }
  };

  const uploadProductImage = async (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const res = await axios.patch(`${API}/auth/update-me`, formData, { headers: { Authorization: `Bearer ${token}` } });
      return res.data?.user?.photo; 
    } catch (err) { return null; }
  };

  const handleImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true); setUploadProgress(10);
    const uploaded: string[] = [];
    for (let i = 0; i < files.length; i++) {
      setUploadProgress(Math.round((i / files.length) * 100) + 10);
      const url = await uploadProductImage(files[i]);
      if (url) uploaded.push(url);
    }
    setForm(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 p-4 md:p-8 flex justify-center items-start relative">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-xl border shadow-sm overflow-hidden">
        
        {/* MODAL / SUBPAGE INTERFACE TITLE HEAD */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-neutral-100 uppercase tracking-tight">
              {editProductData ? "Refactor Catalog Model Schema" : "Register Unique Custom Product Configuration"}
            </h2>
            <p className="text-[11px] text-slate-400">Specify data settings and dynamic UI fields below.</p>
          </div>
          <button onClick={onCloseOrComplete} className="p-1.5 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          {/* SECTION 1: CORE PARAMS */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Product Name</label>
              <input value={form.name} className="w-full bg-slate-50 dark:bg-neutral-950 border h-9 px-3 rounded text-xs" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Category</label>
              <select value={form.category} className="w-full bg-slate-50 dark:bg-neutral-950 border h-9 px-2 rounded text-xs" onChange={(e) => setForm({ ...form, category: e.target.value })} >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Condition</label>
              <select value={form.condition} className="w-full bg-slate-50 dark:bg-neutral-950 border h-9 px-2 rounded text-xs" onChange={(e) => setForm({ ...form, condition: e.target.value as any })} >
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
              </select>
            </div>
          </div>

          {/* SECTION 2: VALUES BLOCK */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Currency</label>
              <select value={form.currency} className="w-full bg-slate-50 dark:bg-neutral-950 border h-9 px-2 rounded text-xs" onChange={(e) => setForm({ ...form, currency: e.target.value as any })} >
                {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Base Price</label>
              <input type="number" value={form.basePrice} className="w-full bg-slate-50 dark:bg-neutral-950 border h-9 px-3 rounded text-xs" onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Stock</label>
              <input type="number" value={form.stock} className="w-full bg-slate-50 dark:bg-neutral-950 border h-9 px-3 rounded text-xs" onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
          </div>

          {/* FEATURE ROUTING CONFIGURATION STRIPS */}
          <div className="p-3.5 bg-slate-50 dark:bg-neutral-950 border rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2.5 tracking-wider">Toggle Features to Display Sub-Forms</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.keys(form.features).map((feat) => (
                <label key={feat} className="flex items-center gap-2 border p-2 rounded-md bg-white dark:bg-neutral-900 cursor-pointer select-none shadow-sm hover:border-slate-300 transition-all">
                  <input type="checkbox" checked={(form.features as any)[feat]} className="w-3.5 h-3.5 accent-black dark:accent-white"
                    onChange={(e) => setForm({ ...form, features: { ...form.features, [feat]: e.target.checked } })}
                  />
                  <span className="text-[11px] font-semibold capitalize text-slate-600 dark:text-neutral-300">{feat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* DYNAMIC FORM VIEWS DEPENDING ON ACTIVATED SWITCHES */}
          {form.features.attributes && (
            <div className="p-4 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-3 bg-blue-50/5">
              <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">1. Options Static Attributes (Metadata)</h4>
              <div className="grid grid-cols-2 gap-3">
                {form.features.size && (
                  <div>
                    <label className="text-[10px] font-medium text-slate-400 block mb-1">Sizes List</label>
                    <input value={form.attributesInput.size} placeholder="S, M, L, XL" className="w-full bg-white dark:bg-neutral-950 border h-9 px-3 rounded text-xs" onChange={(e) => setForm({ ...form, attributesInput: { ...form.attributesInput, size: e.target.value } })} />
                  </div>
                )}
                {form.features.color && (
                  <div>
                    <label className="text-[10px] font-medium text-slate-400 block mb-1">Colors List</label>
                    <input value={form.attributesInput.color} placeholder="Black, White, Gold" className="w-full bg-white dark:bg-neutral-950 border h-9 px-3 rounded text-xs" onChange={(e) => setForm({ ...form, attributesInput: { ...form.attributesInput, color: e.target.value } })} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 🔀 CLEAN ROUTING GATEWAY LINK TO THE NEW PAGE COMPONENT */}
          {form.features.variants && (
            <div className="p-4 border border-indigo-200 dark:border-indigo-900/60 rounded-xl bg-indigo-50/5 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-1">
                  <Layers size={14} /> 2. Complex Item Variants
                </h4>
                <p className="text-[11px] text-slate-400">
                  {form.variants.length > 0 
                    ? `Tracking ${form.variants.length} explicit variant datasets.` 
                    : "Configure price, inventory parameters, and color matrix setups."}
                </p>
              </div>
              
              <button 
                type="button" 
                onClick={() => setShowVariantPage(true)}
                className="bg-indigo-600 text-white font-bold text-[10px] uppercase h-9 px-4 rounded-lg hover:bg-indigo-700 shadow-sm transition-all"
              >
                Open Variant Builder
              </button>
            </div>
          )}

          {form.features.measurement && (
            <div className="p-4 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-3 bg-amber-50/5">
              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">3. Continuous Metric Allocation Dimensions</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Scale Unit</label>
                  <select value={form.measurement.unit} className="w-full border h-9 px-2 rounded text-xs bg-white dark:bg-neutral-950" onChange={(e) => setForm({ ...form, measurement: { ...form.measurement, unit: e.target.value as any } })}>
                    <option value="yard">Yard</option>
                    <option value="meter">Meter</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="liter">Liter</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Price Per Unit</label>
                  <input type="number" value={form.measurement.pricePerUnit} className="w-full border h-9 px-3 rounded text-xs bg-white dark:bg-neutral-950" onChange={(e) => setForm({ ...form, measurement: { ...form.measurement, pricePerUnit: e.target.value } })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Min Order Limit</label>
                  <input type="number" value={form.measurement.minOrder} className="w-full border h-9 px-3 rounded text-xs bg-white dark:bg-neutral-950" onChange={(e) => setForm({ ...form, measurement: { ...form.measurement, minOrder: e.target.value } })} />
                </div>
              </div>
            </div>
          )}

          {form.features.bulkPricing && (
            <div className="p-4 border border-emerald-200 dark:border-emerald-900/60 rounded-xl space-y-3 bg-emerald-50/5">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">4. Wholesale Scaling Price Levels</h4>
                <button type="button" className="text-[10px] font-bold text-emerald-500 underline" onClick={() => setForm({ ...form, bulkPricing: [...form.bulkPricing, { minQty: 5, price: 0 }] })}>+ Add Level</button>
              </div>
              <div className="space-y-2">
                {form.bulkPricing.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-4 bg-white dark:bg-neutral-950 p-2 border rounded-md shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Min Volume Qty:</span>
                      <input type="number" value={b.minQty} className="w-20 border h-8 px-2 rounded text-xs bg-transparent font-bold" onChange={(e) => { const t = [...form.bulkPricing]; t[bIdx].minQty = Number(e.target.value); setForm({ ...form, bulkPricing: t }); }} />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs text-slate-400">Reduce Single Unit Price To:</span>
                      <input type="number" value={b.price} className="w-24 border h-8 px-2 rounded text-xs bg-transparent font-bold text-emerald-600" onChange={(e) => { const t = [...form.bulkPricing]; t[bIdx].price = Number(e.target.value); setForm({ ...form, bulkPricing: t }); }} />
                    </div>
                    <button type="button" className="text-red-500" onClick={() => setForm({ ...form, bulkPricing: form.bulkPricing.filter((_, i) => i !== bIdx) })}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEDIA FLOW INPUT PIPELINE */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Upload Assets</label>
            <label className="w-full flex flex-col items-center justify-center border-2 border-dashed bg-slate-50 dark:bg-neutral-950 text-xs py-4 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
              {uploading ? (
                <div className="flex flex-col items-center gap-2 w-full px-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Loader2 size={14} className="animate-spin text-black dark:text-white" /> Loading server elements... {uploadProgress}%</div>
                </div>
              ) : <span className="font-bold text-slate-400">Click to connect item profile images</span>}
              <input type="file" accept="image/*" multiple disabled={uploading} className="hidden" onChange={(e) => handleImagesUpload(e.target.files)} />
            </label>
            <div className="flex gap-2 flex-wrap mt-2">
              {form.images.map((img, i) => <img key={i} src={img} className="w-12 h-12 rounded-lg object-cover border" alt="" />)}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Product Markdown Summary Description</label>
            <textarea value={form.description} rows={2} className="w-full bg-slate-50 dark:bg-neutral-950 border p-2 rounded-lg text-xs resize-none" onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <button onClick={handleSaveProduct} disabled={uploading} className="w-full bg-slate-900 text-white dark:bg-white dark:text-black py-2.5 rounded-xl text-xs font-bold shadow hover:opacity-90 disabled:opacity-40 transition-all">
            {editProductData ? "Commit Document Updates to Master Schema Engine" : "Publish Listing Document to Live Marketplace"}
          </button>
        </div>
      </div>

      {/* 🔮 SLICK BACKDROP-BLURRED MODAL DIALOG OVERLAY */}
      {showVariantPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl animate-in fade-in-50 zoom-in-95 duration-150">
            <VariantBuilderPage
              baseName={form.name || "Product"}
              basePrice={Number(form.basePrice) || 0}
              onClose={() => setShowVariantPage(false)}
              onSave={(generatedVariants) => {
                setForm({ ...form, variants: generatedVariants });
                setShowVariantPage(false);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}