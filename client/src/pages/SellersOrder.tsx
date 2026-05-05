import { useEffect, useState } from "react";
import {
  User,
  Package,
  Clock,
  Truck,
  ShoppingBag,
  Eye,
  AlertTriangle,
  CheckCircle,
  MapPin,
  ChevronRight
} from "lucide-react";
import API from "../api/User";

interface OrderData {
  _id: string;
  refNumber: string;
  internalStatus:
  | "pending_payment"
  | "payment_received"
  | "processing"
  | "ready_for_pickup"
  | "unavailable"
  | "delivered";
  customerStatus:
  | "pending_payment"
  | "processing"
  | "delivered"
  | "completed";
  quantity: number;
  totalPrice: number;
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
  productId: {
    _id: string;
    name: string;
    images: string[];
    price: number;
  };
  createdAt: string;
}

const SellerOrderManager = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/seller");
      const list = res.data.orders || [];
      setOrders(list);
      if (list.length > 0) setSelectedOrder(list[0]);
    } catch (err) {
      console.error("FETCH_ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * CORE STATUS LOGIC
   * Maps the UI action to your specific backend router paths
   */
  const handleStatusUpdate = async (endpointPath: string, nextInternalStatus: OrderData["internalStatus"]) => {
    if (!selectedOrder) return;

    try {
      // Hits routes like: /orders/:id/start-processing or /orders/:id/ready-pickuo
      await API.patch(`/orders/${selectedOrder._id}/${endpointPath}`);

      // Optimistic UI Update
      const updatedList = orders.map((o) =>
        o._id === selectedOrder._id ? { ...o, internalStatus: nextInternalStatus } : o
      );

      setOrders(updatedList);
      setSelectedOrder({ ...selectedOrder, internalStatus: nextInternalStatus });

    } catch (err) {
      console.error("UPDATE_ERROR:", err);
      alert("Action failed. Please verify backend route connectivity.");
    }
  };

  const getStatusTheme = (status: string) => {
    switch (status) {
      case "pending_payment": return "text-orange-600 bg-orange-50 border-orange-100";
      case "payment_received": return "text-blue-600 bg-blue-50 border-blue-100";
      case "processing": return "text-indigo-600 bg-indigo-50 border-indigo-100";
      case "ready_for_pickup": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "unavailable": return "text-red-600 bg-red-50 border-red-100";
      default: return "text-slate-500 bg-slate-50 border-slate-100";
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="font-black uppercase tracking-[0.2em] text-slate-400 text-xs text-center">Syncing Seller Ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-screen p-4 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">Orders</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 ml-1">Fulfillment Command Center</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="bg-slate-900 text-white p-2 rounded-xl">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Live Queue</p>
              <p className="text-sm font-black text-slate-900">{orders.length} Active Requests</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">

          {/* ORDER LIST (LEFT) */}
          <div className="lg:col-span-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {orders.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-10 border-2 border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No orders found</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`group relative p-6 rounded-[2.2rem] border-2 transition-all duration-300 cursor-pointer ${selectedOrder?._id === order._id
                      ? "border-slate-900 bg-white shadow-xl -translate-y-1"
                      : "border-transparent bg-white hover:border-slate-200 shadow-sm"
                    }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${getStatusTheme(order.internalStatus)}`}>
                      {order.internalStatus.replace("_", " ")}
                    </span>
                    <p className="text-[10px] text-slate-300 font-black tracking-widest">
                      #{order.refNumber}
                    </p>
                  </div>
                  <h4 className="font-black text-slate-900 text-lg leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                    {order.productId?.name}
                  </h4>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                      <User size={12} className="text-slate-400" /> {order.ownerId?.name.split(" ")[0]}
                    </span>
                    <span className="font-black text-slate-900">₦{order.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FULFILLMENT PANEL (RIGHT) */}
          <div className="lg:col-span-8">
            {selectedOrder ? (
              <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">

                <div className="p-8 md:p-12">
                  {/* PRODUCT SUMMARY */}
                  <div className="flex flex-col md:flex-row gap-10 mb-12">
                    <div className="relative group self-start">
                      <img
                        src={selectedOrder.productId?.images?.[0]}
                        className="w-40 h-52 object-cover rounded-[2.5rem] shadow-2xl group-hover:scale-[1.02] transition-transform duration-500 cursor-zoom-in"
                        onClick={() => setPreview(selectedOrder.productId?.images?.[0])}
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg">
                        <Eye size={16} className="text-slate-900" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full">QUANTITY: {selectedOrder.quantity}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Clock size={12} /> {new Date(selectedOrder.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-6">
                        {selectedOrder.productId?.name}
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                          <p className="text-sm font-black text-slate-800">{selectedOrder.ownerId?.name}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Payout Amount</p>
                          <p className="text-sm font-black text-slate-800">₦{selectedOrder.totalPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LOGISTICS ACTIONS */}
                  <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <Truck size={16} className="text-indigo-600" /> Dispatch Workflow
                    </h4>

                    <div className="space-y-4">
                      {/* STATE: PAYMENT RECEIVED -> START PROCESSING */}
                      {selectedOrder.internalStatus === "payment_received" && (
                        <button
                          onClick={() => handleStatusUpdate("start-processing", "processing")}
                          className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl"
                        >
                          <Package size={18} /> Acknowledge & Start Processing
                        </button>
                      )}

                      {/* STATE: PROCESSING -> READY FOR PICKUP or UNAVAILABLE */}
                      {selectedOrder.internalStatus === "processing" && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <button
                            onClick={() => handleStatusUpdate("ready-pickuo", "ready_for_pickup")}
                            className="bg-emerald-600 text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-100"
                          >
                            <Truck size={18} /> Ready for Pickup
                          </button>
                          <button
                            onClick={() => handleStatusUpdate("unavailable", "unavailable")}
                            className="bg-white text-red-600 border-2 border-red-50 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-red-50 transition-all flex items-center justify-center gap-3"
                          >
                            <AlertTriangle size={18} /> Mark Unavailable
                          </button>
                        </div>
                      )}

                      {/* STATE: PENDING PAYMENT */}
                      {selectedOrder.internalStatus === "pending_payment" && (
                        <div className="flex items-center gap-4 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                          <Clock className="text-orange-500 animate-pulse" />
                          <div>
                            <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest">Hold Order</p>
                            <p className="text-xs font-bold text-orange-500/80">Awaiting payment verification from administration.</p>
                          </div>
                        </div>
                      )}

                      {/* STATE: READY FOR PICKUP */}
                      {selectedOrder.internalStatus === "ready_for_pickup" && (
                        <div className="flex items-center gap-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700">
                          <CheckCircle />
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-widest">Manifest Signed</p>
                            <p className="text-xs font-bold">Item is waiting at the dispatch center for Afri Logistics.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* FOOTER METRICS */}
                <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center">
                      <MapPin size={16} className="text-white/40" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Tracking Active</p>
                  </div>
                  <ChevronRight className="text-white/20" />
                </div>

              </div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center text-slate-200">
                <ShoppingBag size={80} className="mb-6 opacity-5" />
                <p className="font-black uppercase text-[10px] tracking-[0.5em]">Select order to fulfill</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULLSCREEN PREVIEW */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          className="fixed inset-0 bg-slate-950/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md cursor-zoom-out"
        >
          <img
            src={preview}
            className="max-h-full max-w-full rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300"
          />
        </div>
      )}
    </div>
  );
};

export default SellerOrderManager;