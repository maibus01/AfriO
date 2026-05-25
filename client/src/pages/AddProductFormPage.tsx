import { useState, useEffect } from "react";
import axios from "axios";
import { 
  X, Trash2, Loader2, Layers, Tag, Package, UploadCloud, FileText, 
  Sliders, Scale, BarChart3, Maximize2, Palette, Ruler, Globe, MapPin 
} from "lucide-react";
import VariantBuilderPage from "./VariantBuilderPage";

interface SubModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
  savedData?: any;
}

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
  customSizes: [] as string[],
  customColors: [] as string[],
  weightMetrics: { grossWeight: "", netWeight: "", unit: "kg" },
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

  // Modal Routing States
  const [activeModal, setActiveModal] = useState<"variants" | "attributes" | "size" | "color" | "weight" | "measurement" | "bulkPricing" | "origin" | null>(null);

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

    if (form.features.variants) payload.variants = form.variants;
    if (form.features.bulkPricing) payload.bulkPricing = form.bulkPricing;
    if (form.features.measurement) payload.measurement = form.measurement;
    if (form.features.origin) payload.origin = form.origin;
    
    // Core attributes mapping block
    payload.attributes = {};
    if (form.features.size) payload.attributes.sizes = form.customSizes;
    if (form.features.color) payload.attributes.colors = form.customColors;
    if (form.features.weight) payload.attributes.weight = form.weightMetrics;

    return payload;
  };

  const handleSaveProduct = async () => {
    try {
      const payload = compilePayload();
      if (editProductData) {
        await axios.patch(`${API}/products/${editProductData._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API}/products`, payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      onCloseOrComplete();
    } catch (err) {
      alert("Operational issue executing catalog save schema.");
    }
  };

  // ==========================================================================
  // UPDATED: REAL UPLOAD ASSET ENGINE PIPELINE
  // ==========================================================================
  const uploadSingleFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    // Check your backend configuration setup: if it expects an alternative key field 
    // like "images" or "file" rather than "photo", change this string wrapper.
    formData.append("photo", file); 

    try {
      // Directs payload chunk out to auth profile route setup or shared store module 
      const res = await axios.patch(`${API}/auth/update-me`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Captures the hosted structural web links nested returned inside server response
      return res.data?.user?.photo || res.data?.data?.photo || res.data?.url || null;
    } catch (err) {
      console.error("Asset pipeline drop exception on single item:", err);
      return null;
    }
  };

  const handleImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(5);

    const uploadedUrls: string[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
      const targetUrl = await uploadSingleFile(files[i]);
      if (targetUrl) {
        uploadedUrls.push(targetUrl);
      }
      // Incremental calculation for state rendering view metrics
      setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
    }

    if (uploadedUrls.length > 0) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    }

    // Smooth UI drop state reset transition
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
    }, 500);
  };

  // Function helper to clear an image array target if needed
  const handleRemoveImage = (indexToRemove: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8 flex justify-center items-start relative font-sans">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {editProductData ? "Edit Product Catalog Details" : "Create New Product Listing"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Configure parameters across all 8 specialized product system modules.</p>
          </div>
          <button onClick={onCloseOrComplete} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          
          {/* SECTION 1: CORE DATA */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">Product Title</label>
              <div className="relative">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input value={form.name} placeholder="e.g., Vanguard Leather Boots" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 h-9 pl-9 pr-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">Category</label>
                <select value={form.category} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 h-9 px-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" onChange={(e) => setForm({ ...form, category: e.target.value })} >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">Condition</label>
                <select value={form.condition} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 h-9 px-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" onChange={(e) => setForm({ ...form, condition: e.target.value as any })} >
                  <option value="new">Brand New</option>
                  <option value="used">Used / Pre-owned</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: PRICING & INVENTORY */}
          <div className="grid grid-cols-3 gap-4 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">Currency</label>
              <select value={form.currency} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 h-9 px-2 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" onChange={(e) => setForm({ ...form, currency: e.target.value as any })} >
                {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">Base Price</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-medium">{form.currency}</span>
                <input type="number" placeholder="0.00" value={form.basePrice} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 h-9 pl-12 pr-3 rounded-lg text-xs dark:text-zinc-100" onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">Stock Capacity</label>
              <div className="relative">
                <Package className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input type="number" placeholder="0" value={form.stock} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 h-9 pl-9 pr-3 rounded-lg text-xs dark:text-zinc-100" onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
          </div>

          {/* ⚡ GRID CONTROL CENTER: ALL 8 ADVANCED FEATURES MODULES */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">Advanced System Feature Blocks (8)</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* MODULE 1: VARIANTS */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl flex flex-col justify-between gap-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                    <Layers size={14} className="text-indigo-500" /> 1. Product Variants
                  </div>
                  <button type="button" onClick={() => setActiveModal("variants")} className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-200">Configure</button>
                </div>
                {form.features.variants && form.variants.length > 0 ? (
                  <div className="bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 p-2 rounded-lg text-[11px] font-medium border border-indigo-100/40 space-y-1">
                    <span className="font-bold block">✓ Stacked Configuration Loaded:</span>
                    <div className="grid grid-cols-2 gap-1 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                      {form.variants.slice(0, 2).map((v, idx) => (
                        <div key={idx} className="truncate bg-white dark:bg-zinc-950 p-1 rounded border dark:border-zinc-800">SKU: {v.sku || "N/A"} - P: {v.price}</div>
                      ))}
                    </div>
                    {form.variants.length > 2 && <span className="text-[10px] opacity-70 block text-right font-semibold">+ {form.variants.length - 2} more variants</span>}
                  </div>
                ) : <span className="text-[11px] text-zinc-400 italic px-0.5">No variants active</span>}
              </div>

              {/* MODULE 2: WHOLESALE BULK PRICING */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl flex flex-col justify-between gap-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                    <BarChart3 size={14} className="text-emerald-500" /> 2. Bulk Pricing
                  </div>
                  <button type="button" onClick={() => setActiveModal("bulkPricing")} className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-200">Configure</button>
                </div>
                {form.features.bulkPricing && form.bulkPricing.length > 0 ? (
                  <div className="bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-2 rounded-lg text-[11px] font-medium border border-emerald-100/40 space-y-1">
                    <span className="font-bold block">✓ Bulk Scaling Levels:</span>
                    <div className="flex flex-wrap gap-1">
                      {form.bulkPricing.map((b, i) => (
                        <span key={i} className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 px-1.5 py-0.5 rounded text-[10px]">Qty {b.minQty}+: {form.currency}{b.price}</span>
                      ))}
                    </div>
                  </div>
                ) : <span className="text-[11px] text-zinc-400 italic px-0.5">No wholesale scaling configured</span>}
              </div>

              {/* MODULE 3: MEASUREMENT SCALE */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl flex flex-col justify-between gap-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                    <Scale size={14} className="text-amber-500" /> 3. Dimensional Units
                  </div>
                  <button type="button" onClick={() => setActiveModal("measurement")} className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-200">Configure</button>
                </div>
                {form.features.measurement && form.measurement.pricePerUnit ? (
                  <div className="bg-amber-50/40 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 p-2 rounded-lg text-[11px] font-medium border border-amber-100/40 space-y-0.5">
                    <div>• Calculated Unit Base: <span className="font-bold capitalize">{form.measurement.unit}</span></div>
                    <div>• Rate: <span className="font-bold">{form.currency} {form.measurement.pricePerUnit}</span> / Min Limit: <span className="font-bold">{form.measurement.minOrder}</span></div>
                  </div>
                ) : <span className="text-[11px] text-zinc-400 italic px-0.5">No measurements active</span>}
              </div>

              {/* MODULE 4: SIZE CONTROL MATRIX */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl flex flex-col justify-between gap-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                    <Ruler size={14} className="text-blue-500" /> 4. Size Metrics
                  </div>
                  <button type="button" onClick={() => setActiveModal("size")} className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-200">Configure</button>
                </div>
                {form.features.size && form.customSizes.length > 0 ? (
                  <div className="bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 p-2 rounded-lg text-[11px] font-medium border border-blue-100/40 space-y-1">
                    <span className="font-bold block">✓ Standard Target Sizes:</span>
                    <div className="flex flex-wrap gap-1">
                      {form.customSizes.map((s, i) => (
                        <span key={i} className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 px-2 py-0.5 rounded text-[10px] uppercase">{s}</span>
                      ))}
                    </div>
                  </div>
                ) : <span className="text-[11px] text-zinc-400 italic px-0.5">No explicit sizes saved</span>}
              </div>

              {/* MODULE 5: COLOR PROFILES */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl flex flex-col justify-between gap-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                    <Palette size={14} className="text-pink-500" /> 5. Color Palettes
                  </div>
                  <button type="button" onClick={() => setActiveModal("color")} className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-200">Configure</button>
                </div>
                {form.features.color && form.customColors.length > 0 ? (
                  <div className="bg-pink-50/40 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 p-2 rounded-lg text-[11px] font-medium border border-pink-100/40 space-y-1">
                    <span className="font-bold block">✓ Allocated Color Blocks:</span>
                    <div className="flex flex-wrap gap-1">
                      {form.customColors.map((c, i) => (
                        <span key={i} className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 px-2 py-0.5 rounded text-[10px] capitalize">{c}</span>
                      ))}
                    </div>
                  </div>
                ) : <span className="text-[11px] text-zinc-400 italic px-0.5">No custom color states active</span>}
              </div>

              {/* MODULE 6: WEIGHT METRICS */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl flex flex-col justify-between gap-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                    <Maximize2 size={14} className="text-cyan-500" /> 6. Weight Vectors
                  </div>
                  <button type="button" onClick={() => setActiveModal("weight")} className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-200">Configure</button>
                </div>
                {form.features.weight && form.weightMetrics.grossWeight ? (
                  <div className="bg-cyan-50/40 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 p-2 rounded-lg text-[11px] font-medium border border-cyan-100/40 space-y-0.5">
                    <div>• Gross Parameter: <span className="font-bold">{form.weightMetrics.grossWeight} {form.weightMetrics.unit}</span></div>
                    <div>• Net Parameter: <span className="font-bold">{form.weightMetrics.netWeight || "N/A"} {form.weightMetrics.unit}</span></div>
                  </div>
                ) : <span className="text-[11px] text-zinc-400 italic px-0.5">No weight metrics tracking</span>}
              </div>

              {/* MODULE 7: GLOBAL ORIGIN LOCATIONS */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl flex flex-col justify-between gap-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                    <Globe size={14} className="text-teal-500" /> 7. Origin Mapping
                  </div>
                  <button type="button" onClick={() => setActiveModal("origin")} className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-200">Configure</button>
                </div>
                {form.features.origin && form.origin.country ? (
                  <div className="bg-teal-50/40 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 p-2 rounded-lg text-[11px] font-medium border border-teal-100/40 space-y-0.5 flex items-center gap-1.5">
                    <MapPin size={12} />
                    <span>Provenance: <span className="font-bold">{form.origin.city && `${form.origin.city}, `}{form.origin.country}</span></span>
                  </div>
                ) : <span className="text-[11px] text-zinc-400 italic px-0.5">No dispatch origin logged</span>}
              </div>

              {/* MODULE 8: CORE ATTRIBUTES SCHEMAS */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl flex flex-col justify-between gap-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                    <Sliders size={14} className="text-purple-500" /> 8. Extended Schema
                  </div>
                  <button type="button" onClick={() => setActiveModal("attributes")} className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-200">Configure</button>
                </div>
                {form.features.attributes && (form.attributesInput.size || form.attributesInput.color) ? (
                  <div className="bg-purple-50/40 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 p-2 rounded-lg text-[11px] space-y-0.5 border border-purple-100/40">
                    {form.attributesInput.size && <div>• Raw Size Matrix: <span className="font-semibold">{form.attributesInput.size}</span></div>}
                    {form.attributesInput.color && <div>• Raw Color Matrix: <span className="font-semibold">{form.attributesInput.color}</span></div>}
                  </div>
                ) : <span className="text-[11px] text-zinc-400 italic px-0.5">No key-value attributes grouped</span>}
              </div>

            </div>
          </div>

          {/* SECTION 4: IMAGES ASSET LOADING */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Product Images</label>
            <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs py-5 rounded-xl cursor-pointer hover:bg-zinc-100/70 transition-all group">
              {uploading ? (
                <div className="flex flex-col items-center gap-2.5 w-full px-6">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    <Loader2 size={16} className="animate-spin text-zinc-900 dark:text-white" /> 
                    Uploading assets... {uploadProgress}%
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-center">
                  <UploadCloud size={22} className="text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400 mt-1">Upload Product Photos</span>
                </div>
              )}
              <input type="file" accept="image/*" multiple disabled={uploading} className="hidden" onChange={(e) => handleImagesUpload(e.target.files)} />
            </label>
            
            {form.images.length > 0 && (
              <div className="flex gap-3 flex-wrap pt-1">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group/img rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm w-16 h-16">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button 
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute inset-0 bg-red-600/80 flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 5: BLOCKS DESCRIPTION SUMMARY */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5"><FileText size={14} /> Description Summary</label>
            <textarea value={form.description} rows={3} placeholder="Provide structural content descriptions..." className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:text-zinc-100" onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          {/* MASTER ACTIONS */}
          <button onClick={handleSaveProduct} disabled={uploading} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:text-zinc-950 py-3 rounded-xl text-xs font-bold shadow-md transition-all tracking-wide uppercase disabled:opacity-50 disabled:cursor-not-allowed">
            {editProductData ? "Commit Document Changes" : "Publish Listing Data"}
          </button>
        </div>
      </div>

      {/* 🔮 MULTI-MODAL OVERLAYS */}
      {activeModal === "variants" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-md p-4">
          <div className="w-full max-w-3xl">
            <VariantBuilderPage
              baseName={form.name || "Product"}
              basePrice={Number(form.basePrice) || 0}
              onClose={() => setActiveModal(null)}
              onSave={(generatedVariants) => {
                setForm({ ...form, variants: generatedVariants, features: { ...form.features, variants: generatedVariants.length > 0 } });
                setActiveModal(null);
              }}
            />
          </div>
        </div>
      )}

      {activeModal === "size" && (
        <SizeModalManager
          savedData={form.customSizes}
          onClose={() => setActiveModal(null)}
          onSave={(sizesArr) => {
            setForm({ ...form, customSizes: sizesArr, features: { ...form.features, size: sizesArr.length > 0 } });
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === "color" && (
        <ColorModalManager
          savedData={form.customColors}
          onClose={() => setActiveModal(null)}
          onSave={(colorsArr) => {
            setForm({ ...form, customColors: colorsArr, features: { ...form.features, color: colorsArr.length > 0 } });
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === "weight" && (
        <WeightModalManager
          savedData={form.weightMetrics}
          onClose={() => setActiveModal(null)}
          onSave={(weightObj) => {
            setForm({ ...form, weightMetrics: weightObj, features: { ...form.features, weight: !!weightObj.grossWeight } });
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === "origin" && (
        <OriginModalManager
          savedData={form.origin}
          onClose={() => setActiveModal(null)}
          onSave={(originObj) => {
            setForm({ ...form, origin: originObj, features: { ...form.features, origin: !!originObj.country } });
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === "bulkPricing" && (
        <BulkPricingModalManager 
          savedData={form.bulkPricing}
          onClose={() => setActiveModal(null)} 
          onSave={(data) => {
            setForm({ ...form, bulkPricing: data, features: { ...form.features, bulkPricing: data.length > 0 } });
            setActiveModal(null);
          }} 
        />
      )}

      {activeModal === "measurement" && (
        <MeasurementModalManager 
          savedData={form.measurement}
          onClose={() => setActiveModal(null)} 
          onSave={(data) => {
            setForm({ ...form, measurement: data, features: { ...form.features, measurement: !!data.pricePerUnit } });
            setActiveModal(null);
          }} 
        />
      )}

      {activeModal === "attributes" && (
        <AttributesModalManager 
          savedData={form.attributesInput}
          onClose={() => setActiveModal(null)} 
          onSave={(data) => {
            setForm({ ...form, attributesInput: data, features: { ...form.features, attributes: !!(data.size || data.color) } });
            setActiveModal(null);
          }} 
        />
      )}

    </div>
  );
}

/* ==========================================================================
   MODAL COMPONENT MANAGERS FOR EXTRA RESTORED FEATURES
   ========================================================================== */

function SizeModalManager({ onClose, onSave, savedData }: SubModalProps) {
  const [input, setInput] = useState(savedData?.join(", ") || "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl shadow-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><Ruler size={16} /> Configure Sizing Metrics</h3>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Target Sizes (Separate with commas)</label>
          <input value={input} placeholder="XS, S, M, L, XL, XXL" className="w-full border dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 h-9 px-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" onChange={(e) => setInput(e.target.value)} />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="w-full border dark:border-zinc-800 text-xs font-semibold py-2 rounded-lg dark:text-zinc-300">Cancel</button>
          <button type="button" onClick={() => onSave(input.split(",").map(x => x.trim()).filter(Boolean))} className="w-full bg-zinc-950 dark:bg-zinc-50 dark:text-zinc-950 text-white text-xs font-semibold py-2 rounded-lg">Save Settings</button>
        </div>
      </div>
    </div>
  );
}

function ColorModalManager({ onClose, onSave, savedData }: SubModalProps) {
  const [input, setInput] = useState(savedData?.join(", ") || "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl shadow-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><Palette size={16} /> Configure Color Palettes</h3>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Colors (Separate with commas)</label>
          <input value={input} placeholder="Red, Blue, Green" className="w-full border dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 h-9 px-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" onChange={(e) => setInput(e.target.value)} />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="w-full border dark:border-zinc-800 text-xs font-semibold py-2 rounded-lg dark:text-zinc-300">Cancel</button>
          <button type="button" onClick={() => onSave(input.split(",").map(x => x.trim()).filter(Boolean))} className="w-full bg-zinc-950 dark:bg-zinc-50 dark:text-zinc-950 text-white text-xs font-semibold py-2 rounded-lg">Save Settings</button>
        </div>
      </div>
    </div>
  );
}

// Dummy/Placeholder declarations to prevent code compilation break down due to truncated user input text
function WeightModalManager({ onClose }: SubModalProps) { return null; }
function OriginModalManager({ onClose }: SubModalProps) { return null; }
function BulkPricingModalManager({ onClose }: SubModalProps) { return null; }
function MeasurementModalManager({ onClose }: SubModalProps) { return null; }
function AttributesModalManager({ onClose }: SubModalProps) { return null; }