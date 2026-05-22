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
  X,
  Layers
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/seller");
      const list = res.data.orders || [];
      setOrders(list);
    } catch (err) {
      console.error("FETCH_ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (endpointPath: string, nextInternalStatus: OrderData["internalStatus"]) => {
    if (!selectedOrder) return;

    try {
      await API.patch(`/orders/${selectedOrder._id}/${endpointPath}`);

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
      case "pending_payment": return "text-orange-600 bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30";
      case "payment_received": return "text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30";
      case "processing": return "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30";
      case "ready_for_pickup": return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30";
      case "unavailable": return "text-red-600 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30";
      default: return "text-slate-500 bg-slate-50 dark:bg-neutral-800 border-slate-100 dark:border-neutral-700";
    }
  };

  if (loading) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 dark:border-neutral-800 dark:border-t-white rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Loading Order Ledger...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* COMPACT SUMMARY STRIP */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-neutral-900 p-3 rounded-xl border border-slate-200/60 dark:border-neutral-800/60">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-slate-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-neutral-300">Live Request Pipeline</span>
        </div>
        <span className="bg-slate-900 text-white dark:bg-white dark:text-black text-[10px] font-black px-2 py-0.5 rounded-md">
          {orders.length} ACTIVE
        </span>
      </div>

      {/* COMPACT ORDER CARD LIST GRID */}
      {orders.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 border border-dashed border-slate-200 dark:border-neutral-800 text-center">
          <ShoppingBag size={24} className="mx-auto mb-2 text-slate-300" />
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">No active orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {orders.map((order) => (
            <div
              key={order._id}
              onClick={() => {
                setSelectedOrder(order);
                setIsModalOpen(true);
              }}
              className="group bg-white dark:bg-neutral-900 p-3.5 rounded-xl border border-slate-200/70 dark:border-neutral-800/70 shadow-sm hover:border-slate-400 dark:hover:border-neutral-600 transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className="flex justify-between items-center mb-2.5">
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusTheme(order.internalStatus)}`}>
                  {order.internalStatus.replace("_", " ")}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-medium">
                  #{order.refNumber}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-tight mb-2 line-clamp-1 uppercase tracking-tight">
                {order.productId?.name || "Unknown Product"}
              </h4>

              <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-neutral-800/60">
                <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium flex items-center gap-1 max-w-[60%] truncate">
                  <User size={11} className="text-slate-400 shrink-0" /> 
                  {order.ownerId?.name ? order.ownerId.name.split(" ")[0] : "Client"}
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  ₦{order.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- FULFILLMENT DIALOG MODAL CARD OVERLAY --- */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[110] bg-black/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-xl overflow-hidden shadow-xl border border-slate-200 dark:border-neutral-800 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center shrink-0">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono font-bold text-slate-400">ORDER REF: #{selectedOrder.refNumber}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setSelectedOrder(null); }} 
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 rounded-md bg-slate-50 dark:bg-neutral-950"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Content Space */}
            <div className="p-4 space-y-4 overflow-y-auto">
              
              {/* Simple Product Block */}
              <div className="flex gap-3 bg-slate-50 dark:bg-neutral-950 p-2.5 rounded-lg border border-slate-100 dark:border-neutral-800/40">
                {selectedOrder.productId?.images?.[0] ? (
                  <img
                    src={selectedOrder.productId.images[0]}
                    className="w-14 h-16 object-cover rounded-md shrink-0 border border-slate-200 dark:border-neutral-800"
                    alt=""
                  />
                ) : (
                  <div className="w-14 h-16 bg-slate-200 dark:bg-neutral-800 rounded-md shrink-0" />
                )}
                <div className="flex flex-col justify-center min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase leading-tight line-clamp-2 mb-1">
                    {selectedOrder.productId?.name}
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-500">
                    Quantity Ordered: <span className="text-slate-900 dark:text-white font-bold">{selectedOrder.quantity}</span>
                  </span>
                </div>
              </div>

              {/* Client & Financial Metadata Data Table */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50/60 dark:bg-neutral-950/40 rounded-lg border border-slate-100 dark:border-neutral-800/50">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase block mb-0.5">Purchaser</span>
                  <span className="font-bold text-slate-800 dark:text-neutral-200 truncate block">{selectedOrder.ownerId?.name || "Unknown"}</span>
                </div>
                <div className="p-2.5 bg-slate-50/60 dark:bg-neutral-950/40 rounded-lg border border-slate-100 dark:border-neutral-800/50">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase block mb-0.5">Payout Aggregate</span>
                  <span className="font-bold text-slate-800 dark:text-neutral-200 block">₦{selectedOrder.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Status workflow blocks */}
              <div className="pt-2 border-t border-slate-100 dark:border-neutral-800/60">
                <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wide block mb-2">Fulfillment Operations</span>
                
                <div className="space-y-2">
                  {selectedOrder.internalStatus === "payment_received" && (
                    <button
                      onClick={() => handleStatusUpdate("start-processing", "processing")}
                      className="w-full bg-slate-900 text-white dark:bg-white dark:text-black py-2.5 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Package size={13} /> Acknowledge & Process
                    </button>
                  )}

                  {selectedOrder.internalStatus === "processing" && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleStatusUpdate("ready-pickuo", "ready_for_pickup")}
                        className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Truck size={13} /> Set Ready for Pickup
                      </button>
                      <button
                        onClick={() => handleStatusUpdate("unavailable", "unavailable")}
                        className="w-full bg-transparent text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <AlertTriangle size={12} /> Mark as Unavailable
                      </button>
                    </div>
                  )}

                  {selectedOrder.internalStatus === "pending_payment" && (
                    <div className="flex items-start gap-2.5 p-2.5 bg-orange-50/50 dark:bg-orange-950/10 rounded-lg border border-orange-100/60 dark:border-orange-900/20 text-orange-700 dark:text-orange-400">
                      <Clock size={14} className="shrink-0 mt-0.5 animate-pulse" />
                      <div className="text-[11px] font-medium leading-tight">
                        <p className="font-bold uppercase text-[9px] tracking-wide">Verification Escrow</p>
                        <p className="opacity-90">Awaiting clearance confirmations from administrators.</p>
                      </div>
                    </div>
                  )}

                  {selectedOrder.internalStatus === "ready_for_pickup" && (
                    <div className="flex items-start gap-2.5 p-2.5 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-lg border border-emerald-100/60 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle size={14} className="shrink-0 mt-0.5" />
                      <div className="text-[11px] font-medium leading-tight">
                        <p className="font-bold uppercase text-[9px] tracking-wide">Manifest Staged</p>
                        <p className="opacity-90">Item package is waiting at the platform node for courier pickup.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Minimalist Footer Tag */}
            <div className="bg-slate-50 dark:bg-neutral-950 p-2 px-4 border-t border-slate-100 dark:border-neutral-800/60 flex items-center gap-1.5 shrink-0">
              <MapPin size={11} className="text-slate-400" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Afri Logistics Node Active</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrderManager;