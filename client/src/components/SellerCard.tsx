import { useNavigate } from "react-router-dom";

type Business = {
  _id: string;
  name: string;
  logo?: string;
  category?: string;
  description?: string;
};

export default function SellerCard({ business }: { business: Business }) {
  const navigate = useNavigate();

  if (!business) return null;

  return (
    <div
      onClick={() => navigate(`/business/${business._id}`)}
      className="flex items-center gap-3 p-3 border rounded-xl bg-white shadow-sm hover:shadow-md cursor-pointer transition"
    >
      {/* LOGO */}
      <img
        src={business.logo || "https://via.placeholder.com/50"}
        className="w-12 h-12 rounded-full object-cover"
      />

      {/* INFO */}
      <div>
        <h3 className="font-semibold">{business.name}</h3>
        <p className="text-xs text-gray-500 capitalize">
          {business.category}
        </p>
      </div>
    </div>
  );
}