import { useEffect, useState } from "react";
import axios from "axios";
import { Package, Scissors } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const API = "https://afrio-api.onrender.com/api";

export default function BusinessDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  // ---------------- AUTH GUARD ----------------
  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/auth");
      return;
    }

    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await axios.get(`${API}/business/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBusiness(res.data.data);
    } catch (err) {
      navigate("/business"); // fallback
    } finally {
      setLoading(false);
    }
  };

  if (!getToken()) return <p>Please login again</p>;
  if (loading) return <p className="p-10">Loading...</p>;
  if (!business) return <p>No business found</p>;

  return (
    <div className="p-6">

      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h1 className="text-xl font-bold">{business.name}</h1>
        <p className="text-gray-500">{business.category}</p>
      </div>

      {business.category === "tailor" && (
        <div>
          <h2 className="flex items-center gap-2 font-bold">
            <Scissors /> Tailor Dashboard
          </h2>
        </div>
      )}

      {business.category === "vendor" && (
        <div>
          <h2 className="flex items-center gap-2 font-bold">
            <Package /> Vendor Dashboard
          </h2>
        </div>
      )}

    </div>
  );
}