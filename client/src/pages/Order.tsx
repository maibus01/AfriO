import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Copy, Check, MessageCircle,
  ShoppingBag, ShieldCheck, CreditCard, Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import API from "../api/User";

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State Management
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [copied, setCopied] = useState(false);

  // Destructure incoming data
  const { product, quantity, notes } = location.state || {};
  const totalPrice = product ? product.price * quantity : 0;

  // =========================
  // 1. FETCH ACCOUNTS ON LOAD
  // =========================
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await API.get("/accounts");
        const accountData = res.data.accounts || [];
        setAccounts(accountData);
        if (accountData.length > 0) setSelectedAccount(accountData[0]);
      } catch (err) {
        console.error("Failed to load payment accounts");
      } finally {
        setLoading(false);
      }
    };

    if (product) fetchAccounts();
  }, [product]);

  // =========================
  // 2. CREATE ORDER + WHATSAPP
  // =========================
  const handleCompleteOrder = async () => {
    if (!selectedAccount) return alert("Please select a payment account");

    try {
      setProcessingOrder(true);

      // Save order to DB first to get a real Order ID
      const res = await API.post("/orders", {
        productId: product._id,
        businessId: product.businessId?._id || product.businessId,
        quantity,
        notes,
        totalPrice,
        platformAccountId: selectedAccount._id,
      });

      const orderId = res.data.order._id;

      // Format WhatsApp Message
      const message = encodeURIComponent(
        `💎 *LUXEE ORDER RECEIPT*\n\n` +
        `*Order ID:* ${orderId.slice(-6).toUpperCase()}\n` +
        `*Product:* ${product.name}\n` +
        `*Quantity:* ${quantity}\n` +
        `*Total Amount:* ₦${totalPrice.toLocaleString()}\n\n` +
        `*Payment To:* ${selectedAccount.bankName}\n` +
        `*Note:* I have made the transfer. Please verify.`
      );

      const phone = "2349027456061";
      window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`, "_blank");

    } catch (err: any) {
      console.error("Order Creation Error:", err);
      alert(err.response?.data?.message || "Connection error. Try again.");
    } finally {
      setProcessingOrder(false);
    }
  };

  const copyToClipboard = () => {
    if (!selectedAccount) return;
    navigator.clipboard.writeText(selectedAccount.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBag size={48} className="text-slate-200 mb-4" />
        <p className="font-black text-slate-400 uppercase text-xs">No active order</p>
        <button onClick={() => navigate("/")} className="mt-4 text-orange-600 font-bold">Return to Shop</button>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-screen pb-24">
      {/* HEADER */}
      <div className="p-6 flex items-center gap-4 bg-white border-b sticky top-0 z-10">
        <button onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="font-black text-lg">Checkout</h1>
      </div>

      <div className="max-w-xl mx-auto p-5 space-y-5">
        
        {/* STEP 1: ORDER SUMMARY */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</p>
              <h3 className="font-bold text-slate-800">{product.name}</h3>
              <p className="text-sm text-slate-500">Qty: {quantity}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
              <p className="text-xl font-black text-orange-600">₦{totalPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* STEP 2: ACCOUNT SELECTION */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Payment Method</p>
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-300" /></div>
          ) : (
            accounts.map((acc) => (
              <div
                key={acc._id}
                onClick={() => setSelectedAccount(acc)}
                className={`p-4 bg-white border-2 rounded-2xl transition-all cursor-pointer ${
                  selectedAccount?._id === acc._id ? "border-orange-500 shadow-md" : "border-transparent opacity-60"
                }`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-bold text-slate-800">{acc.bankName}</p>
                  {selectedAccount?._id === acc._id && <div className="w-4 h-4 bg-orange-500 rounded-full border-4 border-orange-100" />}
                </div>
                <p className="text-sm text-slate-600">{acc.accountNumber}</p>
              </div>
            ))
          )}
        </div>

        {/* STEP 3: TRANSFER CARD */}
        {selectedAccount && (
          <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <CreditCard className="text-slate-700" size={32} />
                <ShieldCheck className="text-green-400" size={24} />
              </div>
              
              <p className="text-xs opacity-50 uppercase tracking-tighter mb-1">Account Number</p>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-3xl font-black tracking-tight">{selectedAccount.accountNumber}</h2>
                <button onClick={copyToClipboard} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                </button>
              </div>

              <div className="flex justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-[10px] opacity-50 uppercase">Bank</p>
                  <p className="font-bold text-sm">{selectedAccount.bankName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] opacity-50 uppercase">Account Name</p>
                  <p className="font-bold text-sm truncate max-w-[150px]">{selectedAccount.accountName}</p>
                </div>
              </div>
            </div>
            {/* Design Element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
          </div>
        )}

        <div className="p-4 bg-orange-50 rounded-2xl flex gap-3 items-start">
          <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><ShieldCheck size={18} /></div>
          <p className="text-xs text-orange-800 leading-relaxed">
            <b>Secure Order:</b> Transfer the exact amount shown above, then click the button below to send your receipt on WhatsApp for confirmation.
          </p>
        </div>
      </div>

      {/* FIXED FOOTER BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
        <button
          onClick={handleCompleteOrder}
          disabled={processingOrder || !selectedAccount}
          className="max-w-xl mx-auto w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-transform active:scale-[0.98] disabled:bg-slate-300 shadow-lg shadow-green-200"
        >
          {processingOrder ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <MessageCircle size={20} fill="currentColor" />
              SEND PAYMENT RECEIPT
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderPage;