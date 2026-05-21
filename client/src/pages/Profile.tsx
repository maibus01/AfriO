import { useEffect, useState } from "react";
import axios from "axios";
import { Package, Plus, Trash2, X } from "lucide-react";
import MeasurementManager from "../pages/Measurement";

const API =
  import.meta.env.VITE_API_URL || "https://afrio-api.onrender.com/api";

// =====================
// TYPES
// =====================
type UserType = {
  name: string;
  email: string;
  phone?: string;
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

  const [preview, setPreview] = useState<string | null>(null);

  // =====================
  // FETCH PROFILE
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
  // UPDATE PROFILE IMAGE
  // =====================
  const uploadPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);

    try {
      // 💡 Remowed manual Content-Type header so Axios calculates form boundaries safely
      const res = await axios.patch(`${API}/auth/update-me`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error("PHOTO UPLOAD ERROR:", err);
    }
  };

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
        },
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
      {/* HEADER */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl flex gap-6 items-center">
        {/* PHOTO */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30">
            <img
              src={preview || user.photo || "https://via.placeholder.com/80"}
              className="w-full h-full object-cover"
              alt="profile"
            />
          </div>

          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              setPreview(URL.createObjectURL(file));
              uploadPhoto(file);
            }}
          />
        </div>

        {/* INFO */}
        <div className="flex-1 space-y-2">
          <input
            value={user.name}
            onChange={(e) =>
              setUser((prev) =>
                prev ? { ...prev, name: e.target.value } : prev,
              )
            }
            onBlur={async () => {
              // 💡 Text must be packaged as FormData because backend router forces Multer parsing
              const data = new FormData();
              data.append("name", user.name);

              try {
                await axios.patch(`${API}/auth/update-me`, data, {
                  headers: { Authorization: `Bearer ${token}` },
                });
              } catch (err) {
                console.error("NAME UPDATE ERROR:", err);
              }
            }}
            className="bg-transparent text-2xl font-bold outline-none"
          />

          <p className="text-sm">{user.email}</p>

          <input
            value={user.phone || ""}
            onChange={(e) =>
              setUser((prev) =>
                prev ? { ...prev, phone: e.target.value } : prev,
              )
            }
            onBlur={async () => {
              // 💡 Text must be packaged as FormData because backend router forces Multer parsing
              const data = new FormData();
              data.append("phone", user.phone || "");

              try {
                await axios.patch(`${API}/auth/update-me`, data, {
                  headers: { Authorization: `Bearer ${token}` },
                });
              } catch (err) {
                console.error("PHONE UPDATE ERROR:", err);
              }
            }}
            className="bg-transparent text-sm outline-none"
            placeholder="Add phone"
          />
        </div>
      </div>

      {/* MEASUREMENTS */}
      <MeasurementManager />

      {/* CLOSET */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="flex justify-between">
          <h2 className="flex items-center gap-2 font-bold">
            <Package /> Closet
          </h2>

          <button
            onClick={() => setOpenAdd("closet")}
            className="bg-orange-500 text-white px-3 py-1 rounded"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {closet.length === 0 ? (
          <p className="text-gray-400 text-sm">No items yet</p>
        ) : (
          closet.map((c) => (
            <div
              key={c._id}
              className="flex justify-between border p-3 rounded"
            >
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-gray-500">Quantity: {c.quantity}</p>
              </div>

              <button onClick={() => deleteCloset(c._id)}>
                <Trash2 className="text-red-500" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {openAdd === "closet" && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-96 space-y-3">
            <div className="flex justify-between">
              <h2>Add Item</h2>
              <button onClick={() => setOpenAdd(null)}>
                <X />
              </button>
            </div>

            <input
              placeholder="Name"
              value={closetForm.name}
              onChange={(e) =>
                setClosetForm({ ...closetForm, name: e.target.value })
              }
              className="border p-2 w-full"
            />

            <input
              placeholder="Quantity"
              type="number"
              value={closetForm.quantity}
              onChange={(e) =>
                setClosetForm({ ...closetForm, quantity: e.target.value })
              }
              className="border p-2 w-full"
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
