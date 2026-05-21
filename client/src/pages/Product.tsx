import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  Search,
  Edit3,
  LayoutGrid,
  ClipboardList,
  X,
  UploadCloud,
  ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import BusinessHero from "../components/BusinessHero";
import SellerOrderManager from "./SellersOrder";

const API =
  import.meta.env.VITE_API_URL || "https://afrio-api.onrender.com/api";

type ProductImage = { url: string; publicId: string };
type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  images: ProductImage[];
};

type Toast = { type: "success" | "error"; msg: string } | null;

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState<"inventory" | "orders">(
    "inventory",
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [business, setBusiness] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  // form
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "fabric",
    stock: "",
    description: "",
  });

  // image state (separate for new uploads + kept existing)
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [keptImages, setKeptImages] = useState<ProductImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem("token");

  // -------- toast helper --------
  const flash = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // -------- fetch --------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bizRes, prodRes] = await Promise.all([
          axios.get(`${API}/business`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/products/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const vendor = bizRes.data.data.find(
          (b: any) => b.category === "vendor",
        );
        setBusiness(vendor || null);
        setProducts(prodRes.data.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        flash("error", "Could not load your shop");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // -------- modal lifecycle --------
  const resetModal = () => {
    setOpen(false);
    setEditMode(null);
    setForm({
      name: "",
      price: "",
      category: "fabric",
      stock: "",
      description: "",
    });
    setNewFiles([]);
    setKeptImages([]);
  };

  // when editMode is set, seed the form
  useEffect(() => {
    if (editMode) {
      setForm({
        name: editMode.name,
        price: String(editMode.price),
        category: editMode.category,
        stock: String(editMode.stock),
        description: editMode.description || "",
      });
      setKeptImages(editMode.images || []);
      setNewFiles([]);
    }
  }, [editMode]);

  // -------- image handling --------
  const handleFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      const valid = arr.filter((f) => {
        if (!f.type.startsWith("image/")) {
          flash("error", `${f.name} is not an image`);
          return false;
        }
        if (f.size > 5 * 1024 * 1024) {
          flash("error", `${f.name} exceeds 5MB`);
          return false;
        }
        return true;
      });
      const total = keptImages.length + newFiles.length + valid.length;
      if (total > 6) {
        flash("error", "Max 6 images per product");
        return;
      }
      setNewFiles((prev) => [...prev, ...valid]);
    },
    [keptImages.length, newFiles.length],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const removeNewFile = (idx: number) =>
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));

  const removeKeptImage = (publicId: string) =>
    setKeptImages((prev) => prev.filter((img) => img.publicId !== publicId));

  // -------- submit --------
  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("price", form.price);
    fd.append("category", form.category);
    fd.append("stock", form.stock);
    fd.append("description", form.description);
    if (business?._id) fd.append("businessId", business._id);
    newFiles.forEach((f) => fd.append("images", f));
    if (editMode) {
      fd.append(
        "keepImageIds",
        JSON.stringify(keptImages.map((i) => i.publicId)),
      );
    }
    return fd;
  };

  const validate = () => {
    if (!form.name.trim()) return "Product name is required";
    if (!form.price || Number(form.price) <= 0) return "Enter a valid price";
    if (!form.stock || Number(form.stock) < 0)
      return "Enter a valid stock quantity";
    if (!editMode && newFiles.length === 0) return "Add at least one image";
    if (editMode && keptImages.length + newFiles.length === 0)
      return "Keep or add at least one image";
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) return flash("error", err);

    setSubmitting(true);
    try {
      if (editMode) {
        const res = await axios.patch(
          `${API}/products/${editMode._id}`,
          buildFormData(),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        setProducts((prev) =>
          prev.map((p) => (p._id === editMode._id ? res.data.data : p)),
        );
        flash("success", "Product updated");
      } else {
        const res = await axios.post(`${API}/products`, buildFormData(), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setProducts((prev) => [res.data.data, ...prev]);
        flash("success", "Product listed");
      }
      resetModal();
    } catch (e: any) {
      flash("error", e.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Remove this product from your shop?")) return;
    try {
      await axios.delete(`${API}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
      flash("success", "Product removed");
    } catch {
      flash("error", "Could not remove product");
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {business && <BusinessHero business={business} />}

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl font-semibold text-sm animate-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* NAV */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="bg-slate-200/60 p-1.5 rounded-[2rem] flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 md:w-48 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "inventory"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LayoutGrid size={16} /> Inventory
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 md:w-48 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "orders"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ClipboardList size={16} /> Sales Orders
            </button>
          </div>

          {activeTab === "inventory" && (
            <button
              onClick={() => setOpen(true)}
              className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Product
            </button>
          )}
        </div>

        {activeTab === "orders" ? (
          <SellerOrderManager />
        ) : (
          <>
            {/* SEARCH */}
            <div className="relative group max-w-md mb-8">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors"
                size={20}
              />
              <input
                placeholder="Find a product..."
                className="w-full bg-white border-2 border-slate-100 h-14 pl-12 pr-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-medium"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* EMPTY STATE */}
            {filtered.length === 0 && (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center">
                <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-semibold mb-1">
                  {search
                    ? "No products match that search"
                    : "Your shop is empty"}
                </p>
                <p className="text-slate-400 text-sm">
                  {search
                    ? "Try another term"
                    : "Tap 'Add Product' to list your first item"}
                </p>
              </div>
            )}

            {/* GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filtered.map((p) => (
                <div
                  key={p._id}
                  className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    {p.images?.[0]?.url ? (
                      <img
                        src={p.images[0].url}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={p.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                        {p.category}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                          p.stock > 5
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        Qty: {p.stock}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="font-bold text-slate-900 text-lg leading-tight">
                        {p.name}
                      </h2>
                      <p className="text-orange-600 font-black text-lg">
                        ₦{p.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-slate-500 text-xs line-clamp-2 mb-6 min-h-[32px]">
                      {p.description ||
                        "Premium quality supplies for master artisans."}
                    </p>
                    <div className="flex gap-2 pt-4 border-t border-slate-50">
                      <button
                        onClick={() => setEditMode(p)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all"
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      {(open || editMode) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">
                {editMode ? "Edit Product" : "New Product"}
              </h2>
              <button
                onClick={resetModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X />
              </button>
            </div>

            <div className="p-8 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* IMAGE UPLOADER */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                  Product Images ({keptImages.length + newFiles.length}/6)
                </label>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all text-center ${
                    dragOver
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 bg-slate-50 hover:border-orange-300"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files && handleFiles(e.target.files)
                    }
                  />
                  <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700">
                    Drop images here or{" "}
                    <span className="text-orange-600">browse</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PNG, JPG, WEBP · up to 5MB · max 6 images
                  </p>
                </div>

                {(keptImages.length > 0 || newFiles.length > 0) && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                    {keptImages.map((img) => (
                      <div
                        key={img.publicId}
                        className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100"
                      >
                        <img
                          src={img.url}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                        <button
                          onClick={() => removeKeptImage(img.publicId)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 className="text-white" size={18} />
                        </button>
                      </div>
                    ))}
                    {newFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                        <span className="absolute top-1 left-1 bg-orange-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                          New
                        </span>
                        <button
                          onClick={() => removeNewFile(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 className="text-white" size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TEXT FIELDS */}
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />
                <Field
                  label="Price (₦)"
                  type="number"
                  value={form.price}
                  onChange={(v) => setForm({ ...form, price: v })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                    Category
                  </label>
                  <select
                    value={form.category}
                    className="w-full bg-slate-50 border-none h-14 px-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="fabric">Fabric</option>
                    <option value="shoes">Shoes</option>
                    <option value="caps">Caps</option>
                    <option value="machines">Machines</option>
                  </select>
                </div>
                <Field
                  label="Stock Qty"
                  type="number"
                  value={form.stock}
                  onChange={(v) => setForm({ ...form, stock: v })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                  Product Story
                </label>
                <textarea
                  value={form.description}
                  className="w-full bg-slate-50 border-none p-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 h-24"
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <button
                onClick={submit}
                disabled={submitting}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="animate-spin" size={16} />}
                {submitting
                  ? "Uploading..."
                  : editMode
                    ? "Save Product Changes"
                    : "Confirm & List Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Small text-field component to dedupe markup
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        className="w-full bg-slate-50 border-none h-14 px-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
