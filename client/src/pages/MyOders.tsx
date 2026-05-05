import { useEffect, useState } from "react";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ChevronRight,
  MessageCircle,
  ShoppingBag
} from "lucide-react";
import API from "../api/User";
import { useNavigate } from "react-router-dom";

interface OrderData {
  _id: string;
  refNumber: string;
  customerStatus: "pending_payment" | "processing" | "delivered" | "completed";
  quantity: number;
  totalPrice: number;
  productId: {
    name: string;
    images: string[];
  };
  createdAt: string;
}

const MyOrders = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/me");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Fetch orders error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending_payment":
        return {
          label: "Awaiting Confirmation",
          color: "text-orange-600 bg-orange-50 border-orange-100",
          icon: <Clock size={14} />,
          step: 1
        };
      case "processing":
        return {
          label: "In Production",
          color: "text-blue-600 bg-blue-50 border-blue-100",
          icon: <Package size={14} />,
          step: 2
        };
      case "delivered":
        return {
          label: "On Its Way",
          color: "text-purple-600 bg-purple-50 border-purple-100",
          icon: <Truck size={14} />,
          step: 3
        };
      case "completed":
        return {
          label: "Delivered & Signed",
          color: "text-green-600 bg-green-50 border-green-100",
          icon: <CheckCircle2 size={14} />,
          step: 4
        };
      default:
        return {
          label: status,
          color: "text-gray-600 bg-gray-50 border-gray-100",
          icon: <Package size={14} />,
          step: 0
        };
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-lg" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-[2rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pb-24 min-h-screen bg-white">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
          Purchase History
        </h1>
        <div className="h-1 w-12 bg-black mt-2 rounded-full" />
      </div>

      {/* LIST */}
      <div className="space-y-6">
        {orders.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-slate-100 rounded-[3rem]">
            <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              No orders found in your wardrobe
            </p>
          </div>
        )}

        {orders.map((o) => {
          const config = getStatusConfig(o.customerStatus);

          return (
            <div
              key={o._id}
              className="group bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-500"
            >
              {/* TOP SECTION */}
             <div className="flex gap-4 mb-6">
  <img
    src={o.productId?.images?.[0]}
    alt="product"
    className="w-20 h-24 object-cover rounded-xl border border-slate-100"
  />

  <div className="space-y-1 flex-1">
    <h3 className="text-xl font-black text-slate-900 leading-tight">
      {o.productId?.name || "Bespoke Request"}
    </h3>

    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
      Ref: {o.refNumber} • {new Date(o.createdAt).toLocaleDateString()}
    </p>
  </div>
</div>

              {/* PROGRESS MINI-BAR (VISUAL CUE) */}
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={`h-1 flex-1 rounded-full transition-colors duration-700 ${i <= config.step ? 'bg-slate-900' : 'bg-slate-100'}`} 
                  />
                ))}
              </div>

              {/* STATS & ACTIONS */}
              <div className="flex justify-between items-center pt-5 border-t border-slate-50">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Items</p>
                    <p className="text-sm font-black text-slate-900">{o.quantity}x</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Paid</p>
                    <p className="text-sm font-black text-slate-900">₦{o.totalPrice.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* HELPLINE BUTTON */}
                  <button 
                    onClick={() => navigate('/support')}
                    className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
                  >
                    <MessageCircle size={20} />
                  </button>
                  
                  <button className="p-3 bg-slate-900 text-white rounded-full group-hover:scale-110 transition-transform shadow-lg shadow-slate-100">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;