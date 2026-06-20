import { useEffect, useState } from "react";
import {
  CheckCircle,
  CreditCard,
  Package,
  Truck,
  MessageSquare,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import API from "../api/User";
import { useNavigate } from "react-router-dom";

interface VariantItem {
  _id: string;
  variantId?: string | {
    _id: string;
    sku?: string;
    options?: Record<string, string>;
    images?: string[]; // Maps to 'images' string array structure from db variant doc
  };
  sku: string; // From snapshot row in order.items
  unitPrice: number;
  quantity: number;
  image?: string;
}

interface Order {
  _id: string;
  refNumber: string;
  items: VariantItem[];
  totalQuantity?: number; // DB uses totalQuantity
  totalPrice: number;
  customerStatus: string;
  internalStatus: string;
  productId?: {
    name: string;
    images: string[];
  };
  ownerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
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
      const list = res.data.orders || res.data.data || res.data || [];
      setOrders(list);
    } catch (err) {
      console.error("FETCH ORDERS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const markPaymentReceived = async (id: string) => {
    try {
      await API.patch(`/orders/${id}/payment-received`);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, internalStatus: "payment_received", customerStatus: "processing" } : o
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
          o._id === id ? { ...o, internalStatus: "delivered", customerStatus: "completed" } : o
        )
      );
    } catch (err) {
      alert("Failed to mark delivered");
    }
  };

  const handleChatWithCustomer = (customerId: string) => {
    navigate(`/chat/${customerId}`);
  };

  const handleWhatsAppReminder = (order: Order) => {
    const refNum = order.refNumber || order._id.slice(-6).toUpperCase();
    const customerPhone = order.ownerId?.phone || ""; 
    
    let itemsManifestDescription = order.productId?.name || "Items";
    if (order.items && order.items.length > 0) {
      itemsManifestDescription = order.items
        .map(i => `${order.productId?.name || "Product"} (${i.sku})`)
        .join(", ");
    }
    
    const rawMessage = `Hello ${order.ownerId?.name || "Customer"},

We noticed you placed an order for *${itemsManifestDescription}* (Ref: ${refNum}), but we haven't received your transfer confirmation receipt yet.

*Total Amount:* ₦${order.totalPrice.toLocaleString()}

Please reply with your payment receipt here so we can process your package immediately. Thank you!`;

    const message = encodeURIComponent(rawMessage);
    window.open(`https://api.whatsapp.com/send?phone=${customerPhone.replace(/\D/g, "")}&text=${message}`, "_blank");
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "pending_payment": return "bg-orange-50 text-orange-600 border-orange-100";
      case "payment_received": return "bg-blue-50 text-blue-600 border-blue-100";
      case "processing": return "bg-purple-50 text-purple-600 border-purple-100";
      case "ready_for_pickup": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "delivered": return "bg-green-50 text-green-600 border-green-100";
      case "completed": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "unavailable": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  const getVariantImage = (subItem: VariantItem, parentProductImg: string): string => {
    if (subItem.image) return subItem.image;
    if (subItem.variantId && typeof subItem.variantId === "object" && subItem.variantId.images?.length) {
      return subItem.variantId.images[0];
    }
    return parentProductImg;
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
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">Administrative Control</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 ml-1">Order & Payment Verification</p>
      </div>

      <div className="grid gap-8">
        {orders.map((order) => {
          const baseCatalogImage = order.productId?.images?.[0] || "";
          const displayUnits = order.totalQuantity || order.items?.reduce((acc, item) => acc + item.quantity, 0) || 1;

          return (
            <div key={order._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8">
                <div className="flex-1 space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Ref: {order.refNumber}
                  </p>

                  <div className="flex flex-col gap-3.5">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((subItem, idx) => {
                        const computedImageTarget = getVariantImage(subItem, baseCatalogImage);

                        return (
                          <div key={subItem._id || idx} className="flex gap-4 items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100 max-w-xl">
                            {computedImageTarget ? (
                              <img src={computedImageTarget} alt="variant-sku" className="w-14 h-16 object-cover rounded-xl border border-slate-200/60 bg-white shrink-0" />
                            ) : (
                              <div className="w-14 h-16 bg-slate-200 rounded-xl shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">
                                {order.productId?.name || "Catalog Inventory Item"}
                              </h2>
                              <p className="text-xs font-mono font-bold text-amber-600 mt-0.5">
                                SKU Variant: {subItem.sku}
                              </p>
                            </div>
                            <div className="text-right px-2">
                              <span className="text-xs font-black text-slate-400 bg-slate-200/60 px-2 py-1 rounded-md">
                                x{subItem.quantity}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-slate-400 italic">No items found</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:items-end shrink-0">
                  <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Receipt Date</p>
                  <p className="text-xs font-bold text-slate-600">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Details</p>
                  <p className="text-sm font-black text-slate-900 truncate">{order.ownerId?.name || "Unknown client"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fulfillment Business</p>
                  <p className="text-sm font-black text-slate-900 underline decoration-slate-200 underline-offset-4">{order.businessId?.name || "Platform Direct"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Financial Summary</p>
                  <p className="text-lg font-black text-slate-900">
                    ₦{order.totalPrice.toLocaleString()} <span className="text-[10px] font-bold text-slate-300">/ {displayUnits} Units Total</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-8 pt-6 border-t border-slate-50">
                <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${statusStyle(order.internalStatus)}`}>
                  Internal Ledger: {order.internalStatus.replace("_", " ")}
                </div>
                <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${statusStyle(order.customerStatus)}`}>
                  Client View: {order.customerStatus.replace("_", " ")}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {order.internalStatus === "pending_payment" && (
                  <button onClick={() => markPaymentReceived(order._id)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-blue-600 transition-all shadow-lg shadow-blue-100">
                    <CreditCard size={16} /> Authorize Payment
                  </button>
                )}
                {order.internalStatus === "ready_for_pickup" && (
                  <button onClick={() => markDelivered(order._id)} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                    <Truck size={16} /> Complete Delivery
                  </button>
                )}
                {order.internalStatus === "pending_payment" && (
                  <button onClick={() => handleWhatsAppReminder(order)} className="bg-green-600 text-white border-2 border-green-600 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-green-700 hover:border-green-700 transition-all shadow-lg shadow-green-100">
                    <MessageCircle size={16} fill="currentColor" /> WhatsApp Reminder
                  </button>
                )}
                <button onClick={() => handleChatWithCustomer(order.ownerId?._id)} className="bg-white text-slate-900 border-2 border-slate-100 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:border-slate-900 hover:bg-slate-50 transition-all">
                  <MessageSquare size={16} /> Inquiry Chat
                </button>
                <div className="flex-1 text-right">
                   <button className="text-slate-300 hover:text-slate-900 transition-colors">
                      <ExternalLink size={18} />
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

export default AdminOrders;