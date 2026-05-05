import { useEffect, useState } from "react";
import {
  CheckCircle,
  CreditCard,
  Package,
  Truck,
  MessageSquare,
  ExternalLink,
  Hash
} from "lucide-react";
import API from "../api/User";
import { useNavigate } from "react-router-dom";

interface Order {
  _id: string;
  refNumber: string;
  quantity: number;
  totalPrice: number;
  customerStatus: string;
  internalStatus: string;
  productId: {
    name: string;
    images: string[];
  };
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
  businessId: {
    name: string;
  };
  createdAt: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("FETCH ORDERS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // ADMIN ACTIONS
  // ==============================

  const markPaymentReceived = async (id: string) => {
    try {
      await API.patch(`/orders/${id}/payment-received`);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id
            ? {
                ...o,
                internalStatus: "payment_received",
                customerStatus: "processing",
              }
            : o
        )
      );
    } catch (err) {
      alert("Failed to mark payment confirmed");
    }
  };

  const markDelivered = async (id: string) => {
    try {
      await API.patch(`/orders/${id}/delivered`);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id
            ? {
                ...o,
                internalStatus: "delivered",
                customerStatus: "completed",
              }
            : o
        )
      );
    } catch (err) {
      alert("Failed to mark delivered");
    }
  };

  const handleChatWithCustomer = (customerId: string) => {
    // Navigates to your existing chat system
    navigate(`/chat/${customerId}`);
  };

  // ==============================
  // UI STATUS COLORS
  // ==============================

  const statusStyle = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "bg-orange-50 text-orange-600 border-orange-100";
      case "payment_received":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "processing":
        return "bg-purple-50 text-purple-600 border-purple-100";
      case "ready_for_pickup":
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "delivered":
        return "bg-green-50 text-green-600 border-green-100";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "unavailable":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black text-xs tracking-widest uppercase">Syncing Master Ledger</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto bg-[#fafafa] min-h-screen font-sans">
      <div className="mb-12">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">
          Administrative Control
        </h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 ml-1">Order & Payment Verification</p>
      </div>

      <div className="grid gap-8">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group"
          >
            {/* TOP HEADER: ID & PRODUCT */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8">

  {/* LEFT: IMAGE + INFO */}
  <div className="flex gap-5 items-start">
    <img
      src={order.productId?.images?.[0]}
      alt="product"
      className="w-24 h-32 object-cover rounded-2xl border border-slate-100 shadow-sm"
    />

    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        Ref: {order.refNumber}
      </p>

      <h2 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
        {order.productId?.name}
      </h2>
    </div>
  </div>

  {/* RIGHT: DATE */}
  <div className="flex flex-col items-end">
    <p className="text-[10px] font-black text-slate-300 uppercase mb-1">
      Receipt Date
    </p>
    <p className="text-xs font-bold text-slate-600">
      {new Date(order.createdAt).toLocaleString()}
    </p>
  </div>

</div>

            {/* MAIN INFO GRID */}
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Details</p>
                <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                  {order.ownerId?.name} <span className="text-slate-300 font-medium">({order.ownerId?.email})</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fulfillment Business</p>
                <p className="text-sm font-black text-slate-900 underline decoration-slate-200 underline-offset-4">
                  {order.businessId?.name}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Financial Summary</p>
                <p className="text-lg font-black text-slate-900">
                  ₦{order.totalPrice.toLocaleString()} <span className="text-[10px] font-bold text-slate-300">/ {order.quantity} Units</span>
                </p>
              </div>
            </div>

            {/* STATUS BADGES */}
            <div className="flex gap-4 mb-8 pt-6 border-t border-slate-50">
              <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${statusStyle(order.internalStatus)}`}>
                Internal Ledger: {order.internalStatus.replace("_", " ")}
              </div>
              <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${statusStyle(order.customerStatus)}`}>
                Client View: {order.customerStatus.replace("_", " ")}
              </div>
            </div>

            {/* CONTROL PANEL */}
            <div className="flex flex-wrap items-center gap-4">
              {/* PRIMARY ACTION: CONFIRM PAYMENT */}
              {order.internalStatus === "pending_payment" && (
                <button
                  onClick={() => markPaymentReceived(order._id)}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
                >
                  <CreditCard size={16} />
                  Authorize Payment
                </button>
              )}

              {/* PRIMARY ACTION: MARK DELIVERED */}
              {order.internalStatus === "ready_for_pickup" && (
                <button
                  onClick={() => markDelivered(order._id)}
                  className="bg-emerald-600 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                >
                  <Truck size={16} />
                  Complete Delivery
                </button>
              )}

              {/* SECONDARY ACTION: CHAT */}
              <button
                onClick={() => handleChatWithCustomer(order.ownerId?._id)}
                className="bg-white text-slate-900 border-2 border-slate-100 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:border-slate-900 hover:bg-slate-50 transition-all"
              >
                <MessageSquare size={16} />
                Inquiry Chat
              </button>
              
              <div className="flex-1 text-right">
                 <button className="text-slate-300 hover:text-slate-900 transition-colors">
                    <ExternalLink size={18} />
                 </button>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Package size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">
              Zero orders detected in global manifest
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;