import { useEffect, useState } from "react";
import axios from "axios";
import { Package, Plus, Trash2, X } from "lucide-react";
import MeasurementManager from "../pages/Measurement";
import Request from "./Request";
import MyOrders from "./MyOders";

const API = "http://localhost:5000/api";

// =====================
// TYPES
// =====================

type UserType = {
  name: string;
  email: string;
  phone?: string
  photo?: string;
};

type Closet = {
  _id: string;
  name: string;
  quantity: number;
};

// =====================
// COMPONENT
// =====================

export default function Profile() {
  const token = localStorage.getItem("token");

  const [user, setUser] = useState<UserType | null>(null);
  const [closet, setCloset] = useState<Closet[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState<"closet" | null>(null);

  const [closetForm, setClosetForm] = useState({
    name: "",
    quantity: "",
  });

  // =====================
  // FETCH DATA
  // =====================

  const fetchProfile = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, closetRes] = await Promise.all([
        axios.get(`${API}/auth/me`, { headers }),
        axios.get(`${API}/closet`, { headers }),
      ]);

      setUser(userRes.data.user);
      setCloset(closetRes.data.data || closetRes.data);
    } catch (err) {
      console.error("PROFILE ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =====================
  // CLOSET ACTIONS
  // =====================

  const addCloset = async () => {
    try {
      await axios.post(
        `${API}/closet`,
        {
          name: closetForm.name,
          quantity: Number(closetForm.quantity),
          source: "manual",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setClosetForm({ name: "", quantity: "" });
      setOpenAdd(null);
      fetchProfile();
    } catch (err) {
      console.error("ADD CLOSET ERROR:", err);
    }
  };

  const deleteCloset = async (id: string) => {
    try {
      await axios.delete(`${API}/closet/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCloset((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("DELETE CLOSET ERROR:", err);
    }
  };

  // =====================
  // UI STATES
  // =====================

  if (loading) {
    return <p className="p-10 text-orange-600">Loading profile...</p>;
  }

  if (!user) {
    return <p className="p-10 text-red-500">Failed to load user</p>;
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6 space-y-10">

      {/* HEADER CARD */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg flex gap-6 items-center border border-orange-400/20">

        {/* PHOTO SECTION */}
        <div className="relative group cursor-pointer">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 shadow-md">
            <img
              src={user.photo || "https://via.placeholder.com/80"}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Floating Pencil Button for Photo */}
          <div className="absolute bottom-0 right-0 bg-white text-orange-600 p-1.5 rounded-full shadow-lg border border-orange-100 transition-transform group-hover:scale-110">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>

          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const formData = new FormData();
              formData.append("photo", file);
              try {
                const res = await axios.patch(`${API}/auth/update-me`, formData, {
                  headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
                });
                setUser(res.data.data);
              } catch (err) { console.error("PHOTO UPDATE ERROR:", err); }
            }}
          />
        </div>

        {/* INFO SECTION */}
        <div className="flex-1 min-w-0 space-y-3">

          {/* NAME INPUT WITH PENCIL */}
          <div className="relative group flex items-center">
            <input
              value={user.name}
              onChange={(e) => setUser((prev) => prev ? { ...prev, name: e.target.value } : prev)}
              onBlur={async () => {
                try {
                  await axios.patch(`${API}/auth/update-me`, { name: user.name }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                } catch (err) { console.error("NAME UPDATE ERROR:", err); }
              }}
              className="w-full bg-transparent hover:bg-white/10 focus:bg-white/20 px-2 py-1 rounded-md font-bold text-2xl outline-none transition-all pr-10 border-b border-transparent focus:border-white/40"
              placeholder="Your Name"
            />
            <svg className="absolute right-2 w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>

          {/* EMAIL (Read-only) */}
          <div className="flex items-center gap-2 px-2 text-sm text-orange-50 font-medium">
            <svg className="w-4 h-4 opacity-70" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            {user.email}
          </div>

          {/* PHONE INPUT WITH PENCIL */}
          <div className="relative group flex items-center">
            <input
              value={user.phone || ""}
              onChange={(e) => setUser((prev) => prev ? { ...prev, phone: e.target.value } : prev)}
              onBlur={async () => {
                try {
                  await axios.patch(`${API}/auth/update-me`, { phone: user.phone }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                } catch (err) { console.error("PHONE UPDATE ERROR:", err); }
              }}
              className="w-full bg-transparent hover:bg-white/10 focus:bg-white/20 px-2 py-1 rounded-md text-sm outline-none transition-all pr-10 border-b border-transparent focus:border-white/40"
              placeholder="Add phone number..."
            />
            <svg className="absolute right-2 w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 🔥 MEASUREMENT MANAGER (ONLY SOURCE OF TRUTH) */}
      <MeasurementManager />
      <Request />
      <MyOrders />

      {/* CLOSET */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="flex items-center gap-2 font-bold text-lg">
            <Package /> Closet
          </h2>

          <button
            onClick={() => setOpenAdd("closet")}
            className="flex items-center gap-1 text-sm bg-orange-500 text-white px-3 py-1 rounded"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {closet.length === 0 ? (
          <p className="text-sm text-gray-400">No items yet</p>
        ) : (
          closet.map((c) => (
            <div
              key={c._id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-gray-500">
                  Quantity: {c.quantity}
                </p>
              </div>

              <button
                onClick={() => deleteCloset(c._id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* ADD CLOSET MODAL */}
      {openAdd === "closet" && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-96 space-y-4">

            <div className="flex justify-between items-center">
              <h2 className="font-bold">Add Closet Item</h2>
              <button onClick={() => setOpenAdd(null)}>
                <X />
              </button>
            </div>

            <input
              placeholder="Item name"
              className="border p-2 w-full rounded"
              value={closetForm.name}
              onChange={(e) =>
                setClosetForm({ ...closetForm, name: e.target.value })
              }
            />

            <input
              placeholder="Quantity"
              type="number"
              className="border p-2 w-full rounded"
              value={closetForm.quantity}
              onChange={(e) =>
                setClosetForm({ ...closetForm, quantity: e.target.value })
              }
            />

            <button
              onClick={addCloset}
              className="bg-orange-500 text-white w-full p-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}