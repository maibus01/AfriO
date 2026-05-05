import { useNavigate } from "react-router-dom";

type Business = {
  _id: string;
  name: string;
  logo?: string;
  category?: string;
};

export default function BusinessCard({ business }: { business: Business }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/business/${business._id}`)}
      className="flex items-center gap-3 p-3 bg-white rounded-xl shadow cursor-pointer hover:shadow-md transition"
    >
      <img
        src={business.logo || "/placeholder.png"}
        className="w-12 h-12 rounded-full object-cover border"
      />

      <div>
        <h3 className="font-semibold text-sm">{business.name}</h3>
        <p className="text-xs text-gray-500">{business.category}</p>
      </div>
    </div>
  );
}