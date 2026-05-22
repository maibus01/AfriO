import { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus, Trash2, Search, Edit3,
  LayoutGrid, ClipboardList, X, Loader2
} from "lucide-react";
import BusinessHero from "../components/BusinessHero";
import SellerOrderManager from "./SellersOrder"; 

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
  { value: "plumbing", label: "Plumbing & Repairs" },
  { value: "shoes_bags", label: "Shoes & Bags" },
  { value: "cosmetics_beauty", label: "Cosmetics & Beauty" },
  { value: "groceries", label: "Groceries & Food" },
  { value: "automotive", label: "Automotive Parts" },
  { value: "sports_fitness", label: "Sports & Fitness" },
  { value: "health_wellness", label: "Health & Wellness" },
  { value: "books_stationery", label: "Books & Stationery" },
  { value: "jewelry_watches", label: "Jewelry & Watches" },
  { value: "construction_hardware", label: "Hardware" },
  { value: "services", label: "Professional Services" },
  { value: "other", label: "Others" },
];

type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  images: string[];
};

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState<"inventory" | "orders">("inventory");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [business, setBusiness] = useState<any>(null);
  
  // New granular image upload progress states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "clothes",
    stock: "",
    description: "",
    images: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bizRes, prodRes] = await Promise.all([
          axios.get(`${API}/business`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/products/me`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const vendor = bizRes.data.data.find((b: any) => b.category === "vendor");
        setBusiness(vendor || null);
        setProducts(prodRes.data.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const createProduct = async () => {
    if (!business?._id) return;

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      images: form.images, 
      businessId: business._id,
    };

    try {
      const res = await axios.post(`${API}/products`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((prev) => [res.data.data, ...prev]);

      setOpen(false);
      setForm({
        name: "",
        price: "",
        category: "clothes",
        stock: "",
        description: "",
        images: [], 
      });
    } catch (err) {
      console.error("Create product error:", err);
    }
  };

  const uploadProductImage = async (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await axios.patch(`${API}/auth/update-me`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data?.user?.photo; 
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      return null;
    }
  };

  // Safe multi-file uploader context with automated pseudo-percent trackers
  const handleImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(10);

    const uploaded: string[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
      setUploadProgress(Math.round((i / totalFiles) * 100) + 10);
      const url = await uploadProductImage(files[i]);
      if (url) uploaded.push(url);
    }

    setUploadProgress(100);
    setTimeout(() => {
      if (editMode) {
        setEditMode({ ...editMode, images: [...(editMode.images || []), ...uploaded] });
      } else {
        setForm({ ...form, images: [...form.images, ...uploaded] });
      }
      setUploading(false);
      setUploadProgress(0);
    }, 400);
  };

  const updateProduct = async () => {
    if (!editMode) return;
    const { _id, __v, ...editableFields } = editMode as any;

    const payload = {
      ...editableFields,
      price: Number(editMode.price), 
      stock: Number(editMode.stock), 
    };

    try {
      const res = await axios.patch(`${API}/products/${_id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(prev =>
        prev.map(p => (p._id === _id ? res.data.data : p))
      );

      setEditMode(null);
    } catch (err) {
      console.error("Update product error:", err);
      if (axios.isAxiosError(err) && err.response) {
        alert(`Server rejected update: ${err.response.data?.message || err.message}`);
      }
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this product from your shop?")) return;
    try {
      await axios.delete(`${API}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) { 
      console.error("Delete product error:", err); 
    }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const getCategoryLabel = (value: string) => {
    const cat = CATEGORIES.find(c => c.value === value);
    return cat ? cat.label : value;
  };

  if (loading) return (
    <div className="w-full min-h-screen bg-white dark:bg-neutral-950 flex flex-col items-center p-4 space-y-6">
      <div className="w-full max-w-7xl h-36 bg-slate-100 dark:bg-neutral-900 rounded-2xl animate-pulse" />
      <div className="w-full max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(idx => (
          <div key={idx} className="h-64 bg-slate-100 dark:bg-neutral-900 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );

  return (
    // pb-24 safeguards layout visibility over your APK custom overlay bottom appbars
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 pb-24 md:pb-12">
      {business && <BusinessHero business={business} />}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">

        {/* --- NAVIGATION AND ACTIONS --- */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
          <div className="flex bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl w-full sm:w-auto border border-slate-200/40 dark:border-neutral-800/40">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 sm:w-36 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'inventory' ? 'bg-white text-slate-900 dark:bg-neutral-800 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              <LayoutGrid size={14} /> Inventory
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 sm:w-36 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'orders' ? 'bg-white text-slate-900 dark:bg-neutral-800 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              <ClipboardList size={14} /> Sales Orders
            </button>
          </div>

          {activeTab === "inventory" && (
            <button
              onClick={() => setOpen(true)}
              className="bg-slate-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus size={14} /> Add Product
            </button>
          )}
        </div>

        {/* --- CONTENT AREA --- */}
        {activeTab === "orders" ? (
          <div className="animate-in fade-in duration-200">
            <SellerOrderManager />
          </div>
        ) : (
          <div className="animate-in fade-in duration-200 space-y-4">
            {/* SEARCH BAR */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                placeholder="Find a product..."
                className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 h-9 pl-9 pr-4 rounded-lg outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-all text-xs font-medium"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* SMALLER COMPACT PRODUCTS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filtered.map((p) => (
                <div key={p._id} className="group bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-slate-200/60 dark:border-neutral-800/60 shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    {/* Compact Image Window */}
                    <div className="relative h-36 bg-slate-50 dark:bg-neutral-950 overflow-hidden">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-neutral-800" />
                      )}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 max-w-[90%]">
                        <span className="bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-medium text-white tracking-wide truncate inline-block max-w-full">
                          {getCategoryLabel(p.category)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide w-fit ${p.stock > 5 ? 'bg-slate-100 text-slate-800 dark:bg-neutral-800 dark:text-neutral-200' : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'}`}>
                          Qty: {p.stock}
                        </span>
                      </div>
                    </div>

                    {/* Compact Card Details Layout */}
                    <div className="p-2.5 space-y-1">
                      <h2 className="font-bold text-slate-900 dark:text-white text-xs leading-tight line-clamp-1 uppercase">{p.name}</h2>
                      <p className="text-slate-900 dark:text-white font-mono font-bold text-sm">₦{p.price.toLocaleString()}</p>
                      <p className="text-slate-500 dark:text-neutral-400 text-[11px] line-clamp-2 min-h-[28px] leading-tight">
                        {p.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Operational Action Panel */}
                  <div className="p-2.5 pt-0">
                    <div className="flex gap-1.5 pt-2 border-t border-slate-100 dark:border-neutral-800/50">
                      <button onClick={() => setEditMode(p)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-50 dark:bg-neutral-950 text-slate-600 dark:text-neutral-400 rounded-md text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all border border-slate-100 dark:border-neutral-800/40">
                        <Edit3 size={11} /> Edit
                      </button>
                      <button onClick={() => deleteProduct(p._id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 rounded-md text-[10px] font-bold hover:bg-red-100 dark:hover:bg-red-950/30 transition-all border border-red-100/40 dark:border-red-900/20">
                        <Trash2 size={11} /> Del
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {(open || editMode) && (
        <div className="fixed inset-0 z-[100] bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-xl overflow-hidden shadow-xl border border-slate-100 dark:border-neutral-800 animate-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{editMode ? "Modify Product" : "New Listing"}</h2>
              <button onClick={() => { setOpen(false); setEditMode(null); }} className="p-1 text-slate-400 hover:text-slate-600 rounded-md"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wide">Title</label>
                  <input
                    value={editMode ? editMode.name : form.name}
                    className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 h-9 px-3 rounded-md outline-none text-xs focus:border-slate-400"
                    onChange={(e) => editMode ? setEditMode({ ...editMode, name: e.target.value }) : setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wide">Price (₦)</label>
                  <input
                    type="number"
                    value={editMode ? editMode.price : form.price}
                    className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 h-9 px-3 rounded-md outline-none text-xs focus:border-slate-400"
                    onChange={(e) => editMode ? setEditMode({ ...editMode, price: Number(e.target.value) }) : setForm({ ...form, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wide">Category</label>
                  <select
                    value={editMode ? editMode.category : form.category}
                    className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 h-9 px-2 rounded-md outline-none text-xs focus:border-slate-400 appearance-none font-medium"
                    onChange={(e) => editMode ? setEditMode({ ...editMode, category: e.target.value }) : setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wide">Stock Count</label>
                  <input
                    type="number"
                    value={editMode ? editMode.stock : form.stock}
                    className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 h-9 px-3 rounded-md outline-none text-xs focus:border-slate-400"
                    onChange={(e) => editMode ? setEditMode({ ...editMode, stock: Number(e.target.value) }) : setForm({ ...form, stock: e.target.value })}
                  />
                </div>
              </div>

              {/* Dynamic Live Media Gallery and Percentage Block */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wide">Product Media Assets</label>
                
                <label className="w-full flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950 text-[11px] text-slate-500 py-3 rounded-lg cursor-pointer font-bold hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors relative min-h-[50px]">
                  {uploading ? (
                    <div className="flex flex-col items-center gap-1.5 w-full px-4">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-neutral-300">
                        <Loader2 size={14} className="animate-spin text-slate-900 dark:text-white" />
                        <span>Uploading Gallery Assets... {uploadProgress}%</span>
                      </div>
                      {/* Operational Progress Tracker Bar Container */}
                      <div className="w-full h-1 bg-slate-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-slate-900 dark:bg-white transition-all duration-300 rounded-full" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span>Click to upload images</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    className="hidden"
                    onChange={(e) => handleImagesUpload(e.target.files)}
                  />
                </label>

                <div className="flex gap-1.5 flex-wrap mt-2">
                  {(editMode ? editMode.images : form.images).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className="w-10 h-10 rounded-md object-cover border border-slate-200 dark:border-neutral-800"
                      alt=""
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wide">Description Summary</label>
                <textarea
                  value={editMode ? editMode.description : form.description}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-2 rounded-md outline-none text-xs focus:border-slate-400 resize-none"
                  onChange={(e) => editMode ? setEditMode({ ...editMode, description: e.target.value }) : setForm({ ...form, description: e.target.value })}
                />
              </div>

              <button
                onClick={editMode ? updateProduct : createProduct}
                disabled={uploading}
                className="w-full bg-slate-900 text-white dark:bg-white dark:text-black py-2 rounded-md text-xs font-bold shadow-sm hover:opacity-90 transition-all mt-1 disabled:opacity-40"
              >
                {editMode ? "Save Changes" : "Confirm Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}