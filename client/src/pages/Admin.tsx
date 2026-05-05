import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/User";

const Admin = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [styles, setStyles] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);

    const [tab, setTab] = useState("users");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [u, b, p, s, a] = await Promise.all([
                API.get("/admin/users"),
                API.get("/admin/businesses"),
                API.get("/admin/products"),
                API.get("/admin/styles"),
                API.get("/accounts"),
            ]);

            setUsers(u.data.data || u.data.users || []);
            setBusinesses(b.data.data || b.data.businesses || []);
            setProducts(p.data.data || p.data.products || []);
            setStyles(s.data.data || []);
            setAccounts(a.data.accounts || a.data.data || []);
        } catch (err) {
            console.error("Admin Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto bg-white min-h-screen">
            <h1 className="text-4xl font-black mb-8 tracking-tighter">
                Admin Control
            </h1>

            {/* ===== STATS ===== */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                <div className="p-4 bg-slate-900 text-white rounded-xl text-center">
                    <p className="text-xs uppercase">Users</p>
                    <p className="text-xl font-black">{users.length}</p>
                </div>
                <div className="p-4 bg-slate-900 text-white rounded-xl text-center">
                    <p className="text-xs uppercase">Businesses</p>
                    <p className="text-xl font-black">{businesses.length}</p>
                </div>
                <div className="p-4 bg-slate-900 text-white rounded-xl text-center">
                    <p className="text-xs uppercase">Products</p>
                    <p className="text-xl font-black">{products.length}</p>
                </div>
                <div className="p-4 bg-slate-900 text-white rounded-xl text-center">
                    <p className="text-xs uppercase">Styles</p>
                    <p className="text-xl font-black">{styles.length}</p>
                </div>
                <div className="p-4 bg-slate-900 text-white rounded-xl text-center">
                    <p className="text-xs uppercase">Accounts</p>
                    <p className="text-xl font-black">{accounts.length}</p>
                </div>
            </div>

            <button
                onClick={() => navigate("/admin/accounts")}
                className="mb-6 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold"
            >
                Manage Payment Accounts
            </button>

            <button
                onClick={() => navigate("/admin/orders")}
                className="mb-4 bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
            >
                Manage Orders
            </button>

             <button
                onClick={() => navigate("/admin/styles-request")}
                className="mb-4 bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
            >
                Manage Styles
            </button>

            {/* ===== TABS ===== */}
            <div className="flex gap-2 mb-10 bg-slate-100 p-1.5 rounded-2xl w-fit">
                {["users", "businesses", "products", "styles", "accounts"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                            tab === t
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* ===== CONTENT ===== */}
            {loading ? (
                <div className="animate-pulse font-black text-slate-200">
                    LOADING DATA...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* USERS */}
                    {tab === "users" &&
                        users.map((u) => (
                            <div key={u._id} className="p-6 bg-white border rounded-[2rem] shadow-sm">
                                <p className="font-black">{u.name}</p>
                                <p className="text-sm text-slate-500">{u.email}</p>
                                <span className="text-xs bg-black text-white px-2 py-1 rounded">
                                    {u.role}
                                </span>
                            </div>
                        ))}

                    {/* BUSINESSES */}
                    {tab === "businesses" &&
                        businesses.map((b) => (
                            <div key={b._id} className="p-6 bg-white border rounded-[2rem] shadow-sm">
                                <p className="font-black">{b.name}</p>
                                <p className="text-xs text-orange-600">{b.category}</p>
                                <p className="text-sm">{b.ownerId?.email}</p>
                            </div>
                        ))}

                    {/* PRODUCTS */}
                    {tab === "products" &&
                        products.map((p) => (
                            <div key={p._id} className="p-6 bg-white border rounded-[2rem] shadow-sm">
                                <p className="font-black">{p.name}</p>
                                <p className="font-bold">₦{p.price}</p>
                                <p className="text-xs text-slate-400">
                                    {p.businessId?.name}
                                </p>
                            </div>
                        ))}

                    {/* STYLES */}
                    {tab === "styles" &&
                        styles.map((s) => (
                            <div key={s._id} className="p-6 bg-white border rounded-[2rem] shadow-sm">
                                <img
                                    src={s.image}
                                    alt={s.title}
                                    className="w-full h-40 object-cover rounded-xl mb-4"
                                />
                                <p className="font-black">{s.title}</p>
                                <p className="text-sm text-slate-500 line-clamp-2">
                                    {s.description}
                                </p>
                                <p className="text-xs text-orange-600 mt-2 uppercase">
                                    {s.category}
                                </p>
                                <p className="text-xs text-slate-400 mt-2">
                                    By {s.businessId?.name}
                                </p>
                            </div>
                        ))}

                    {/* ACCOUNTS */}
                    {tab === "accounts" &&
                        accounts.map((acc) => (
                            <div key={acc._id} className="p-6 bg-white border rounded-[2rem] shadow-sm">
                                <p className="font-black">{acc.bankName}</p>
                                <p className="text-orange-600">{acc.accountNumber}</p>
                                <p>{acc.accountName}</p>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default Admin;