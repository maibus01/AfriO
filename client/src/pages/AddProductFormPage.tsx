import { useState, useEffect } from "react";
import axios from "axios";
import {
  X, Loader2, Layers, Tag, Package, UploadCloud,
  Scale, BarChart3, Maximize2, Globe, MapPin, Trash2, AlertCircle
} from "lucide-react";
import VariantBuilderPage from "./VariantBuilderPage";

const API = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  : "https://afrio-api.onrender.com/api";

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

type ProductType = "simple" | "variant" | "measured";

const INITIAL_FORM_STATE = {
  name: "",
  description: "",
  category: "clothes",
  condition: "new" as "new" | "used" | "refurbished",
  productType: "simple" as ProductType,
  basePrice: "",
  currency: "NGN" as "NGN" | "USD" | "CNY" | "GBP",
  stock: "",
  features: {
    bulkPricing: false,
    weight: false,
    origin: false,
  },
  attributes: {} as Record<string, string[]>,
  variants: [] as Array<{
    _id?: string;
    sku: string;
    options: Record<string, string>;
    price: number;
    stock: number;
    images?: File[] | string[];
  }>,
  bulkPricing: [] as Array<{ minQty: number; maxQty?: number; price: number }>,
  measurement: {
    unit: "yard" as "meter" | "yard" | "kg" | "liter",
    pricePerUnit: "",
    minOrder: ""
  },
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [activeModal, setActiveModal] = useState<"variants" | "weight" | "measurement" | "bulkPricing" | "origin" | null>(null);
  const [childVariantFiles, setChildVariantFiles] = useState<Record<string, File>>({});

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

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
      let derivedType: ProductType = "simple";
      if (editProductData.features?.variants || editProductData.variants?.length > 0) derivedType = "variant";
      else if (editProductData.features?.measurement || editProductData.measurement?.pricePerUnit) derivedType = "measured";

      setForm({
        ...INITIAL_FORM_STATE,
        ...editProductData,
        productType: derivedType,
        basePrice: editProductData.basePrice?.toString() || "",
        stock: editProductData.stock?.toString() || "",
        attributes: editProductData.attributes || {},
        bulkPricing: editProductData.bulkPricing || [],
        measurement: editProductData.measurement || INITIAL_FORM_STATE.measurement,
        weightMetrics: editProductData.weightMetrics || INITIAL_FORM_STATE.weightMetrics,
        origin: editProductData.origin || INITIAL_FORM_STATE.origin,
        features: {
          bulkPricing: !!editProductData.features?.bulkPricing || (editProductData.bulkPricing?.length > 0),
          weight: !!editProductData.features?.weight || !!editProductData.weightMetrics?.grossWeight,
          origin: !!editProductData.features?.origin || !!editProductData.origin?.country
        }
      });

      if (editProductData.images) {
        setExistingImages(editProductData.images);
      }
    }
  }, [editProductData, token]);

  const validateForm = (): boolean => {
    setErrorMessage(null);
    if (!form.name.trim()) { setErrorMessage("Product Title is required."); return false; }
    if (!form.description.trim()) { setErrorMessage("Description Summary is required."); return false; }
    if (existingImages.length === 0 && newImageFiles.length === 0) { setErrorMessage("Please upload at least one product image."); return false; }

    if (form.productType === "simple") {
      if (!form.basePrice || Number(form.basePrice) <= 0) { setErrorMessage("Simple products require a valid Base Price."); return false; }
      if (form.stock === "" || Number(form.stock) < 0) { setErrorMessage("Please configure a valid stock capacity."); return false; }
    }
    if (form.productType === "variant" && form.variants.length === 0) {
      setErrorMessage("Variant Mode enabled, but no configurations exist. Run the Builder Matrix.");
      return false;
    }
    if (form.productType === "measured") {
      if (!form.measurement.pricePerUnit || Number(form.measurement.pricePerUnit) <= 0) { setErrorMessage("Measured products require a Price Per Unit."); return false; }
      if (!form.measurement.minOrder || Number(form.measurement.minOrder) <= 0) { setErrorMessage("Please establish a Minimum Unit Order value."); return false; }
    }

    return true;
  };

  const compilePayload = () => {
    const hasActiveVariants = form.variants.length > 0;

    const calculatedStock = (form.productType === "variant" || (form.productType === "measured" && hasActiveVariants))
      ? form.variants.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0)
      : Number(form.stock) || 0;

    const hasBulk = form.bulkPricing.length > 0;
    const hasWeight = !!form.weightMetrics.grossWeight;
    const hasOrigin = !!form.origin.country;

    const payload: any = {
      name: form.name,
      description: form.description,
      category: form.category,
      condition: form.condition,
      currency: form.currency,
      basePrice: form.basePrice !== "" ? Number(form.basePrice) : 0,
      stock: calculatedStock,
      businessId: editProductData ? editProductData.businessId : businessId,
      existingImages: existingImages,
      attributes: form.attributes,
      features: {
        variants: form.productType === "variant" || (form.productType === "measured" && hasActiveVariants),
        attributes: Object.keys(form.attributes).length > 0,
        size: !!form.attributes["size"] || !!form.attributes["Size"],
        color: !!form.attributes["color"] || !!form.attributes["Color"],
        weight: hasWeight,
        measurement: form.productType === "measured",
        bulkPricing: hasBulk,
        origin: hasOrigin,
      },
    };

    if (form.productType === "variant" || (form.productType === "measured" && hasActiveVariants)) {
      payload.variants = [];
    }

    if (form.productType === "measured") {
      payload.measurement = {
        unit: form.measurement.unit,
        pricePerUnit: Number(form.measurement.pricePerUnit) || 0,
        minOrder: Number(form.measurement.minOrder) || 1
      };
    }

    if (hasBulk) payload.bulkPricing = form.bulkPricing;
    if (hasWeight) payload.weightMetrics = form.weightMetrics;
    if (hasOrigin) payload.origin = form.origin;

    return payload;
  };

  const handleImagesUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const filesArray = Array.from(files);
    setNewImageFiles((prev) => [...prev, ...filesArray]);
    const visualPreviews = filesArray.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...visualPreviews]);
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) return;

    try {
      setUploading(true);
      setUploadProgress(10);

      const payload = compilePayload();
      const formData = new FormData();

      newImageFiles.forEach((file) => {
        formData.append("images", file);
      });

      Object.keys(payload).forEach((key) => {
        if (typeof payload[key] === "object") {
          formData.append(key, JSON.stringify(payload[key]));
        } else {
          formData.append(key, payload[key]);
        }
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 90) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      };

      if (editProductData) {
        await axios.patch(`${API}/products/${editProductData._id}`, formData, config);
      } else {
        const response = await axios.post(`${API}/products`, formData, config);
        const createdProduct = response.data.data;

        const expectsVariants = form.productType === "variant" || (form.productType === "measured" && form.variants.length > 0);

        if (expectsVariants && createdProduct?._id && form.variants.length > 0) {
          const createdVariantIds = [];

          for (const variant of form.variants) {
            const varData = new FormData();
            varData.append("productId", createdProduct._id);
            varData.append("businessId", businessId);
            varData.append("sku", variant.sku);
            varData.append("price", String(variant.price));
            varData.append("stock", String(variant.stock));
            varData.append("options", JSON.stringify(variant.options));

            const color = variant.options.Color || variant.options.color;
            if (color) {
              const targetFile = childVariantFiles[`Color:${color}`] || childVariantFiles[`color:${color}`];
              if (targetFile) varData.append("images", targetFile);
            }

            const res = await axios.post(`${API}/variants`, varData, {
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });
            createdVariantIds.push(res.data.data._id);
          }

          await axios.patch(
            `${API}/products/${createdProduct._id}`,
            { variants: createdVariantIds },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      setUploadProgress(100);
      onCloseOrComplete();
    } catch (err: any) {
      console.error("Submission Error Details:", err);
      const fallbackMsg = err?.response?.data?.message || "Operational issue executing catalog save schema.";
      setErrorMessage(fallbackMsg);
    } finally {
      setUploading(false);
    }
  };

  const isVariantOrMeasured = form.productType === "variant" || form.productType === "measured";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8 flex justify-center items-start relative font-sans">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {editProductData ? "Edit Product Catalog Details" : "Create New Product Listing"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Configure core parameters and specialized advanced modules.</p>
          </div>
          <button onClick={onCloseOrComplete} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-2.5 text-rose-800 dark:text-rose-400 text-xs shadow-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          {/* SECTION 1: CORE DATA */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">Product Title</label>
              <div className="relative">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input value={form.name} placeholder="e.g., Vanguard Leather Boots" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 h-9 pl-9 pr-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400" onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">Description Summary</label>
              <textarea
                rows={4}
                value={form.description}
                placeholder="Describe your product in detail..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          {/* DYNAMIC MODE ENGINE */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block">Product Structure Model</label>
            <div className="grid grid-cols-3 gap-2.5">
              {(["simple", "variant", "measured"] as ProductType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, productType: type })}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${form.productType === type
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 shadow-sm"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                >
                  <span className="text-xs font-bold capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* INVENTORY AND PRICING CONTAINER */}
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 transition-all">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">Currency</label>
                <select value={form.currency} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 h-9 px-2 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" onChange={(e) => setForm({ ...form, currency: e.target.value as any })} >
                  {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
                </select>
              </div>

              <>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">
                    {isVariantOrMeasured ? "Default Base Price" : "Base Price"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-medium">{form.currency}</span>
                    <input type="number" min="0" placeholder="0.00" value={form.basePrice} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 h-9 pl-12 pr-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">Stock Capacity</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input type="number" min="0" placeholder="0" disabled={isVariantOrMeasured && form.variants.length > 0} value={(isVariantOrMeasured && form.variants.length > 0) ? form.variants.reduce((acc, c) => acc + (Number(c.stock) || 0), 0) : form.stock} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 h-9 pl-9 pr-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none disabled:bg-zinc-100 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500" onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                  </div>
                </div>
              </>
            </div>
            {isVariantOrMeasured && (
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-medium">
                💡 Entering a Default Base Price above will instantly fill out prices automatically inside the Options Builder Matrix.
              </p>
            )}
          </div>

          {/* ADVANCED MODULE FUNCTION BLOCKS */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">Advanced System Functional Blocks</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {isVariantOrMeasured && (
                <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl flex flex-col justify-between gap-2.5 shadow-sm sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                      <Layers size={14} className="text-indigo-500" /> Options & Product Variants
                    </div>
                    <button type="button" onClick={() => setActiveModal("variants")} className="bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors hover:opacity-90">Build Options Matrix</button>
                  </div>
                  {form.variants.length > 0 ? (
                    <div className="bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 p-2 rounded-lg text-[11px] font-medium border border-indigo-100/40 space-y-1">
                      <span className="font-bold block">✓ Generated Combinations Matrix Loaded:</span>
                      <div className="grid grid-cols-2 gap-1 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                        {form.variants.slice(0, 2).map((v, idx) => (
                          <div key={idx} className="truncate bg-white dark:bg-zinc-950 p-1 rounded border dark:border-zinc-800">SKU: {v.sku || "N/A"} - P: {v.price}</div>
                        ))}
                      </div>
                      {form.variants.length > 2 && <span className="text-[10px] opacity-70 block text-right font-semibold">+ {form.variants.length - 2} more configurations</span>}
                    </div>
                  ) : <span className="text-[11px] text-zinc-400 italic px-0.5">No options matrix active (single product item)</span>}
                </div>
              )}

              {form.productType === "measured" && (
                <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl flex flex-col justify-between gap-2.5 shadow-sm sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                      <Scale size={14} className="text-amber-500" /> Custom Unit Selling
                    </div>
                    <button type="button" onClick={() => setActiveModal("measurement")} className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-200 transition-colors">Configure</button>
                  </div>
                  {form.measurement.pricePerUnit ? (
                    <div className="bg-amber-50/40 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 p-2 rounded-lg text-[11px] font-medium border border-amber-100/40 space-y-0.5">
                      <div>• Calculated Unit Base: <span className="font-bold capitalize">{form.measurement.unit}</span></div>
                      <div>• Rate: <span className="font-bold">{form.currency} {form.measurement.pricePerUnit}</span> / Min Order: <span className="font-bold">{form.measurement.minOrder}</span></div>
                    </div>
                  ) : <span className="text-[11px] text-zinc-400 italic px-0.5">No base dynamic metrics active</span>}
                </div>
              )}

              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl flex flex-col justify-between gap-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                    <BarChart3 size={14} className="text-emerald-500" /> Wholesale Bulk Pricing
                  </div>
                  <button type="button" onClick={() => setActiveModal("bulkPricing")} className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-200 transition-colors">Configure</button>
                </div>
                {form.bulkPricing.length > 0 ? (
                  <div className="bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-2 rounded-lg text-[11px] font-medium border border-emerald-100/40 space-y-1">
                    <span className="font-bold block">✓ Bulk Scaling Levels:</span>
                    <div className="flex flex-wrap gap-1">
                      {form.bulkPricing.map((b, i) => (
                        <span key={i} className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 px-1.5 py-0.5 rounded text-[10px]">Qty {b.minQty}+: {form.currency}{b.price}</span>
                      ))}
                    </div>
                  </div>
                ) : <span className="text-[11px] text-zinc-400 italic px-0.5">No wholesale pricing tiers</span>}
              </div>

              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl flex flex-col justify-between gap-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                    <Maximize2 size={14} className="text-cyan-500" /> Logistics Weight
                  </div>
                  <button type="button" onClick={() => setActiveModal("weight")} className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-200 transition-colors">Configure</button>
                </div>
                {form.weightMetrics.grossWeight ? (
                  <div className="bg-cyan-50/40 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 p-2 rounded-lg text-[11px] font-medium border border-cyan-100/40 space-y-0.5">
                    <div>• Gross: <span className="font-bold">{form.weightMetrics.grossWeight} {form.weightMetrics.unit}</span></div>
                    <div>• Net: <span className="font-bold">{form.weightMetrics.netWeight || "N/A"} {form.weightMetrics.unit}</span></div>
                  </div>
                ) : <span className="text-[11px] text-zinc-400 italic px-0.5">No freight metrics tracked</span>}
              </div>

              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl flex flex-col justify-between gap-2.5 shadow-sm sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                    <Globe size={14} className="text-teal-500" /> Provenance Origin
                  </div>
                  <button type="button" onClick={() => setActiveModal("origin")} className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-200 transition-colors">Configure</button>
                </div>
                {form.origin.country ? (
                  <div className="bg-teal-50/40 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 p-2 rounded-lg text-[11px] font-medium border border-teal-100/40 space-y-0.5 flex items-center gap-1.5">
                    <MapPin size={12} />
                    <span>Provenance Country: <span className="font-bold">{form.origin.city && `${form.origin.city}, `}{form.origin.country}</span></span>
                  </div>
                ) : <span className="text-[11px] text-zinc-400 italic px-0.5">No provenance parameters logged</span>}
              </div>
            </div>
          </div>

          {/* MULTI-QUEUE IMAGE WORKFLOW */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Product Images</label>
            <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs py-5 rounded-xl cursor-pointer hover:bg-zinc-100/70 transition-all group">
              {uploading ? (
                <div className="flex flex-col items-center gap-2.5 w-full px-6">
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-zinc-900 dark:bg-zinc-50 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    <Loader2 size={16} className="animate-spin text-zinc-900 dark:text-zinc-50" /> Transferring asset streams... {uploadProgress}%
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

            {(existingImages.length > 0 || previewUrls.length > 0) && (
              <div className="flex gap-2.5 flex-wrap pt-1">
                {existingImages.map((img, i) => (
                  <div key={`exist-${i}`} className="relative w-14 h-14 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm group select-none">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => removeExistingImage(i)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>
                ))}
                {previewUrls.map((img, i) => (
                  <div key={`new-${i}`} className="relative w-14 h-14 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 shadow-sm group select-none">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => removeNewImage(i)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTION ACTIONS */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
            <button type="button" onClick={onCloseOrComplete} disabled={uploading} className="h-9 px-4 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleSaveProduct} disabled={uploading} className="h-9 px-5 bg-zinc-950 hover:bg-zinc-900 dark:bg-zinc-50 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50">
              {uploading && <Loader2 size={14} className="animate-spin" />}
              {editProductData ? "Commit Changes" : "Publish Listing"}
            </button>
          </div>

        </div>
      </div>

      {/* RENDER VARIANT BUILDER MODAL */}
      {activeModal === "variants" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
              <X size={16} />
            </button>
            <VariantBuilderPage
              // @ts-ignore - Bypasses structural mismatch if component updates are pending
              initialAttributes={form.attributes}
              initialVariants={form.variants}
              basePrice={Number(form.basePrice) || 0}
              skuPrefix={form.name ? form.name.substring(0, 3).toUpperCase() : "PRD"}
              onSave={(generatedVariants: any, attributeFiles: any) => {
                setForm({
                  ...form,
                  variants: generatedVariants
                });

                if (attributeFiles) {
                  setChildVariantFiles((prev) => ({
                    ...prev,
                    ...attributeFiles
                  }));
                }
                setActiveModal(null);
              }}
            />
          </div>
        </div>
      )}

      {/* DUMMY BACKDROP CONTAINER FOR AUXILIARY MODALS */}
      {activeModal && activeModal !== "variants" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 capitalize">Configure {activeModal === "bulkPricing" ? "Wholesale Tiers" : activeModal}</h3>

            {activeModal === "measurement" && (
              <div className="space-y-3 text-left">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">Measurement Unit</label>
                  <select value={form.measurement.unit} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 h-9 px-2 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" onChange={(e) => setForm({ ...form, measurement: { ...form.measurement, unit: e.target.value as any } })}>
                    <option value="yard">Yards (Fabric selling baseline)</option>
                    <option value="meter">Meters</option>
                    <option value="kg">Kilograms</option>
                    <option value="liter">Liters</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-500 block mb-1">Price Per Unit ({form.currency})</label>
                    <input type="number" placeholder="0.00" value={form.measurement.pricePerUnit} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 h-9 px-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" onChange={(e) => setForm({ ...form, measurement: { ...form.measurement, pricePerUnit: e.target.value } })} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-500 block mb-1">Minimum Allowed Order</label>
                    <input type="number" placeholder="1" value={form.measurement.minOrder} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 h-9 px-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" onChange={(e) => setForm({ ...form, measurement: { ...form.measurement, minOrder: e.target.value } })} />
                  </div>
                </div>
              </div>
            )}

            {activeModal === "bulkPricing" && (
              <div className="space-y-2 text-left">
                <span className="text-[11px] text-zinc-400 block mb-1">Quick-set basic sample wholesale rate:</span>
                <button type="button" onClick={() => setForm({ ...form, bulkPricing: [{ minQty: 10, price: Number(form.basePrice || form.measurement.pricePerUnit) * 0.9 }] })} className="text-[11px] text-indigo-500 font-bold underline block">Generate Sample Wholesale Tier (Min 10 Items)</button>
                {form.bulkPricing.length > 0 && <div className="text-xs bg-zinc-50 dark:bg-zinc-950 p-2 border dark:border-zinc-800 rounded font-mono">Active Tier: Qty {form.bulkPricing[0].minQty}+ → {form.currency} {form.bulkPricing[0].price}</div>}
              </div>
            )}

            {activeModal === "weight" && (
              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">Gross Metric Weight</label>
                  <input type="number" placeholder="1.5" value={form.weightMetrics.grossWeight} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 h-9 px-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" onChange={(e) => setForm({ ...form, weightMetrics: { ...form.weightMetrics, grossWeight: e.target.value } })} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">Scale Unit</label>
                  <input value={form.weightMetrics.unit} disabled className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 h-9 px-3 rounded-lg text-xs text-zinc-400" />
                </div>
              </div>
            )}

            {activeModal === "origin" && (
              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">Country</label>
                  <input placeholder="Nigeria" value={form.origin.country} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 h-9 px-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" onChange={(e) => setForm({ ...form, origin: { ...form.origin, country: e.target.value } })} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">City/State</label>
                  <input placeholder="Kano" value={form.origin.city} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 h-9 px-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" onChange={(e) => setForm({ ...form, origin: { ...form.origin, city: e.target.value } })} />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setActiveModal(null)} className="h-8 px-4 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 text-xs font-bold rounded-lg">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}