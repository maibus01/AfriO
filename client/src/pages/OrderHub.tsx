import { useEffect, useState } from "react";
import {
  Ruler,
  MessageSquare,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  ChevronRight,
  MessageCircle,
  CreditCard,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/User";

// Types derived from your two files
interface OrderData {
  _id: string;
  refNumber: string;
  customerStatus: "pending_payment" | "processing" | "delivered" | "completed";
  quantity: number;
  totalPrice: number;
  productId: {
    name: string;
    images: string[];
    category?: string; // Used to filter fabric vs caps
  };
  createdAt: string;
}

const OrdersHub = () => {
  const [activeTab, setActiveTab] = useState<"requests" | "fabric" | "cap" | "custom">("requests");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Object.defineProperty(window, 'crypto', { value: { getRandomValues: (arr: any) => arr } });
    Promise.all([fetchOrders(), fetchRequests()]).finally(() => setLoading(false));
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/me");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Fetch orders error", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await API.get("/tailor-requests/my");
      setRequests(res.data.data || []);
    } catch (err) {
      console.error("Fetch requests error", err);
    }
  };

  // Helper for Order Statuses
  const getOrderStatusConfig = (status: string) => {
    switch (status) {
      case "pending_payment":
        return { label: "Awaiting Confirmation", color: "text-orange-600 bg-orange-50", icon: <Clock size={12} />, step: 1 };
      case "processing":
        return { label: "In Production", color: "text-blue-600 bg-blue-50", icon: <Package size={12} />, step: 2 };
      case "delivered":
        return { label: "On Its Way", color: "text-purple-600 bg-purple-50", icon: <Truck size={12} />, step: 3 };
      case "completed":
        return { label: "Delivered", color: "text-green-600 bg-green-50", icon: <CheckCircle2 size={12} />, step: 4 };
      default:
        return { label: status, color: "text-gray-600 bg-gray-50", icon: <Package size={12} />, step: 0 };
    }
  };

  // Helper for Request Statuses
  const getRequestStatusStyles = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "pending": return "text-orange-500 bg-orange-50 border-orange-100";
      case "accepted": return "text-blue-600 bg-blue-50 border-blue-100";
      case "in_progress": return "text-purple-600 bg-purple-50 border-purple-100";
      case "completed": return "text-green-600 bg-green-50 border-green-100";
      case "rejected": return "text-red-600 bg-red-50 border-red-100";
      default: return "text-slate-500 bg-slate-50 border-slate-100";
    }
  };

  // --- FILTER LOGIC FOR YOUR 4 HEADINGS ---
  const filteredRequests = requests.filter(r => !r.styleId); // Raw custom tailor requests without custom styles attached
  const customDesigns = requests.filter(r => r.styleId);     // Tailor requests that are linked with a curated style design
  
  const fabricOrders = orders.filter(o => 
    o.productId?.category?.toLowerCase() === "fabric" || 
    o.productId?.name?.toLowerCase().includes("fabric")
  );
  
  const capOrders = orders.filter(o => 
    o.productId?.category?.toLowerCase() === "cap" || 
    o.productId?.name?.toLowerCase().includes("cap") ||
    o.productId?.name?.toLowerCase().includes("hat")
  );

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6 h-screen flex flex-col justify-center items-center">
        <div className="font-black text-slate-300 animate-pulse uppercase tracking-widest text-sm">Loading Wardrobe Hub...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pb-24 min-h-screen bg-white">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
          My Bookings
        </h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Track everything in your closet</p>
      </div>

      {/* 4-WAY NAVIGATION TABS */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar snap-x">
        {[
          { id: "requests", label: "Tailor Requests", count: filteredRequests.length },
          { id: "fabric", label: "Fabrics", count: fabricOrders.length },
          { id: "cap", label: "Caps", count: capOrders.length },
          { id: "custom", label: "Custom Designs", count: customDesigns.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`snap-center shrink-0 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 border ${
              activeTab === tab.id
                ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200"
                : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
            }`}
          >
            {tab.label} <span className={`ml-1 text-[9px] opacity-60`}>({tab.count})</span>
          </button>
        ))}
      </div>

      {/* MAIN CONTAINER PANELS */}
      <div className="space-y-6">
        
        {/* 1. TAILOR REQUESTS TAB */}
        {activeTab === "requests" && (
          <>
            {filteredRequests.length === 0 && <EmptyState message="No current tailoring requests sent" />}
            {filteredRequests.map((req) => (
              <RequestCard key={req._id} req={req} getStatusStyles={getRequestStatusStyles} navigate={navigate} />
            ))}
          </>
        )}

        {/* 2. FABRIC TAB */}
        {activeTab === "fabric" && (
          <>
            {fabricOrders.length === 0 && <EmptyState message="No fabrics in your purchase history" />}
            {fabricOrders.map((order) => (
              <OrderCard key={order._id} order={order} getStatusConfig={getOrderStatusConfig} navigate={navigate} />
            ))}
          </>
        )}

        {/* 3. CAP TAB */}
        {activeTab === "cap" && (
          <>
            {capOrders.length === 0 && <EmptyState message="No traditional caps found" />}
            {capOrders.map((order) => (
              <OrderCard key={order._id} order={order} getStatusConfig={getOrderStatusConfig} navigate={navigate} />
            ))}
          </>
        )}

        {/* 4. CUSTOM DESIGNS FROM TAILOR TAB */}
        {activeTab === "custom" && (
          <>
            {customDesigns.length === 0 && <EmptyState message="No bespoke custom designs initialized" />}
            {customDesigns.map((req) => (
              <RequestCard key={req._id} req={req} getStatusStyles={getRequestStatusStyles} navigate={navigate} />
            ))}
          </>
        )}

      </div>
    </div>
  );
};

/* --- SUBCOMPONENTS FOR CLEANLINESS --- */

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
    <ShoppingBag size={40} className="mx-auto text-slate-200 mb-3" />
    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] px-4">{message}</p>
  </div>
);

const OrderCard = ({ order, getStatusConfig, navigate }: { order: OrderData, getStatusConfig: any, navigate: any }) => {
  const config = getStatusConfig(order.customerStatus);
  return (
    <div className="group bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm hover:shadow-xl transition-all duration-500">
      <div className="flex gap-4 mb-5">
        <img src={order.productId?.images?.[0]} alt="" className="w-16 h-20 object-cover rounded-xl bg-slate-50 border border-slate-100" />
        <div className="space-y-1 flex-1">
          <div className="flex justify-between items-start">
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${config.color} flex items-center gap-1`}>
              {config.icon} {config.label}
            </span>
            <p className="text-[9px] font-bold text-slate-300">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <h3 className="text-lg font-black text-slate-900 leading-tight">{order.productId?.name}</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ref: {order.refNumber}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= config.step ? 'bg-slate-900' : 'bg-slate-100'}`} />
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
        <div className="flex gap-6">
          <div>
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Qty</p>
            <p className="text-xs font-black text-slate-900">{order.quantity}x</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Paid</p>
            <p className="text-xs font-black text-slate-900">₦{order.totalPrice.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/support')} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
            <MessageCircle size={18} />
          </button>
          <button className="p-2.5 bg-slate-900 text-white rounded-full group-hover:scale-105 transition-transform">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const RequestCard = ({ req, getStatusStyles, navigate }: { req: any, getStatusStyles: any, navigate: any }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm hover:shadow-xl transition-all duration-500">
      <div className="flex gap-4">
        {req.styleId?.image && (
          <img src={req.styleId?.image} className="w-16 h-20 object-cover rounded-xl bg-slate-50" alt="" />
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getStatusStyles(req.status)}`}>
              {req.status?.replace("_", " ")}
            </span>
            <span className="text-[9px] text-slate-300 font-bold">{new Date(req.createdAt).toLocaleDateString()}</span>
          </div>

          <h3 className="font-black text-slate-900 text-base leading-tight mb-1">
            {req.styleId?.title || "Custom Tailoring Request"}
          </h3>
          <p className="text-[10px] text-slate-400 font-bold mb-3">Tailor: {req.businessId?.name || "Master Tailor"}</p>

          {req.finalPrice && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between mb-3">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase">Total Bid Price</p>
                <p className="text-sm font-black text-slate-900">₦{req.finalPrice.toLocaleString()}</p>
              </div>
              {req.status === "in_progress" || req.status === "completed" ? (
                <span className="text-[8px] font-black text-green-600 uppercase bg-green-50 px-2 py-1 rounded">Paid</span>
              ) : (
                <button 
                  onClick={() => navigate("/request-payment", { state: { request: req } })}
                  className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
                >
                  <CreditCard size={10} /> Pay
                </button>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => navigate("/chat", { state: { requestId: req._id } })} className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1">
              <MessageSquare size={12} /> Chat Tailor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersHub;
