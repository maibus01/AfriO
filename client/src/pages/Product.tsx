import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Plus, Trash2, Search, Edit3, 
  LayoutGrid, ClipboardList, X,
} from "lucide-react";
import BusinessHero from "../components/BusinessHero";
import SellerOrderManager from "./SellersOrder"; // Your new Order file

const API = "http://localhost:5000/api";

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

  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "fabric",
    stock: "",
    description: "",
    images: "",
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
      images: form.images.split(",").map((i) => i.trim()),
      businessId: business._id,
    };

    try {
      const res = await axios.post(`${API}/products`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => [res.data.data, ...prev]);
      setOpen(false);
      setForm({ name: "", price: "", category: "fabric", stock: "", description: "", images: "" });
    } catch (err) { console.log(err); }
  };

  const updateProduct = async () => {
    if (!editMode) return;
    try {
      const res = await axios.patch(`${API}/products/${editMode._id}`, editMode, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(prev => prev.map(p => (p._id === editMode._id ? res.data.data : p)));
      setEditMode(null);
    } catch (err) { console.log(err); }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Remove this product from your shop?")) return;
    try {
      await axios.delete(`${API}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) { console.log(err); }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {business && <BusinessHero business={business} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- NAVIGATION TABS --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="bg-slate-200/60 p-1.5 rounded-[2rem] flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 md:w-48 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid size={16} /> Inventory
            </button>
            <button 
              onClick={() => setActiveTab("orders")}
              className={`flex-1 md:w-48 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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

        {/* --- CONTENT AREA --- */}
        {activeTab === "orders" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <SellerOrderManager />
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {/* SEARCH BAR */}
            <div className="relative group max-w-md mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={20} />
              <input
                placeholder="Find a product..."
                className="w-full bg-white border-2 border-slate-100 h-14 pl-12 pr-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-medium"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* PRODUCTS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filtered.map((p) => (
                <div key={p._id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                  <div className="relative h-56 overflow-hidden">
                    <img src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                        {p.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${p.stock > 5 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        Qty: {p.stock}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="font-bold text-slate-900 text-lg leading-tight">{p.name}</h2>
                      <p className="text-orange-600 font-black text-lg">₦{p.price.toLocaleString()}</p>
                    </div>
                    
                    <p className="text-slate-500 text-xs line-clamp-2 mb-6 min-h-[32px]">
                      {p.description || "Premium quality supplies for master artisans."}
                    </p>

                    <div className="flex gap-2 pt-4 border-t border-slate-50">
                      <button onClick={() => setEditMode(p)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all">
                        <Edit3 size={14} /> Edit
                      </button>
                      <button onClick={() => deleteProduct(p._id)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all">
                        <Trash2 size={14} /> Delete
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
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">{editMode ? "Edit Product" : "New Product"}</h2>
              <button onClick={() => { setOpen(false); setEditMode(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
            </div>
            
            <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Name</label>
                  <input
                    value={editMode ? editMode.name : form.name}
                    className="w-full bg-slate-50 border-none h-14 px-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                    onChange={(e) => editMode ? setEditMode({...editMode, name: e.target.value}) : setForm({...form, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Price (₦)</label>
                  <input
                    type="number"
                    value={editMode ? editMode.price : form.price}
                    className="w-full bg-slate-50 border-none h-14 px-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                    onChange={(e) => editMode ? setEditMode({...editMode, price: Number(e.target.value)}) : setForm({...form, price: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                  <select
                    className="w-full bg-slate-50 border-none h-14 px-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                    onChange={(e) => editMode ? setEditMode({...editMode, category: e.target.value}) : setForm({...form, category: e.target.value})}
                  >
                    <option value="fabric">Fabric</option>
                    <option value="shoes">Shoes</option>
                    <option value="caps">Caps</option>
                    <option value="machines">Machines</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Stock Qty</label>
                  <input
                    type="number"
                    value={editMode ? editMode.stock : form.stock}
                    className="w-full bg-slate-50 border-none h-14 px-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                    onChange={(e) => editMode ? setEditMode({...editMode, stock: Number(e.target.value)}) : setForm({...form, stock: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Image Link(s)</label>
                <input
                  placeholder="Link 1, Link 2..."
                  value={editMode ? editMode.images.join(",") : form.images}
                  className="w-full bg-slate-50 border-none h-14 px-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                  onChange={(e) => editMode ? setEditMode({...editMode, images: e.target.value.split(",")}) : setForm({...form, images: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Product Story</label>
                <textarea
                  value={editMode ? editMode.description : form.description}
                  className="w-full bg-slate-50 border-none p-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 h-24"
                  onChange={(e) => editMode ? setEditMode({...editMode, description: e.target.value}) : setForm({...form, description: e.target.value})}
                />
              </div>

              <button
                onClick={editMode ? updateProduct : createProduct}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200"
              >
                {editMode ? "Save Product Changes" : "Confirm & List Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}