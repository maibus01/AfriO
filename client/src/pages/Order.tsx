import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  MessageCircle,
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import API from "../api/User";

// ============================================================================
// DYNAMIC ENVIRONMENT BASEURL PATCH
// Preserves Axios instance methods while shifting endpoints dynamically.
// ============================================================================
if (typeof window !== "undefined") {
  API.defaults.baseURL = window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://afrio-api.onrender.com/api";
}

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State Management
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [copied, setCopied] = useState(false);

  // Destructure variation properties passed down from the Selector state
  const { product, items = [], notes, calculatedPrice, quantity } = location.state || {};
  
  const totalPrice = calculatedPrice || (product ? (product.measurement?.pricePerUnit || product.basePrice) * quantity : 0);

  // ============================================================================
  // 1. AUTHENTICATION PROTECTION CHECK
  // ============================================================================
  useEffect(() => {
    const token = localStorage.getItem("token"); 

    if (!token) {
      alert("Please log in to finalize your purchase.");
      navigate("/auth", { state: { from: location.state } });
    }
  }, [navigate, location.state]);

  // ============================================================================
  // 2. FETCH PAYMENT ROUTING ACCOUNTS
  // ============================================================================
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await API.get("/accounts");
        const accountData = res.data.accounts || [];
        setAccounts(accountData);

        if (accountData.length > 0) {
          setSelectedAccount(accountData[0]);
        }
      } catch (err) {
        console.error("Failed to load payment accounts", err);
      } finally {
        setLoading(false);
      }
    };

    if (product) fetchAccounts();
  }, [product]);

  // ============================================================================
  // 3. CREATE ORDER & INITIALIZE WHATSAPP HANDOFF
  // ============================================================================
  const handleCompleteOrder = async () => {
    if (!selectedAccount) {
      alert("Please select a payment account");
      return;
    }

    try {
      setProcessingOrder(true);

      // Maps state variables directly into the document format required by your backend schema
      const formattedItemsForBackend = items.map((item: any) => ({
        variantId: item.variant._id,
        sku: item.variant.sku || "",
        quantity: item.qty,
        options: item.variant.options || {}
      }));

      const res = await API.post("/orders", {
        productId: product._id,
        businessId: product.businessId?._id || product.businessId,
        items: formattedItemsForBackend, 
        notes,
        totalPrice, 
        platformAccountId: selectedAccount._id,
      });

      const refNumber = res.data.order.refNumber || res.data.order._id.slice(-6).toUpperCase();

      // Formats full structured items breakdown into a readable block list for the WhatsApp text
      const itemDetailsSummary = items && items.length > 0
        ? items.map((i: any) => {
            const optionsStr = Object.entries(i.variant.options || {})
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ");
            return `• ${i.variant.sku || 'Item'} (${optionsStr}) x ${i.qty}`;
          }).join("\n")
        : `Quantity: ${quantity}`;

      const rawMessage = `💎 *AFRIO ORDER RECEIPT*\n\n*Ref Number:* ${refNumber}\n*Product:* ${product.name}\n\n*Selected Variations:*\n${itemDetailsSummary}\n\n*Total Amount:* ₦${totalPrice.toLocaleString()}\n\n*Payment To:* ${selectedAccount.bankName}\nNote: I have made the transfer. Please verify.`;

      const message = encodeURIComponent(rawMessage);
      const phone = "2349027456061";

      // iOS Safari Compatibility Check
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      
      if (isIOS) {
        // Direct assignment to bypass pop-up blockers and trigger deep-linking safely
        window.location.href = `whatsapp://send?phone=${phone}&text=${message}`;
      } else {
        // Universal web application route link for Android / Desktop clients
        window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${message}`, "_blank");
      }

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
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-black select-none">
        <ShoppingBag size={48} className="text-neutral-200 dark:text-neutral-800 mb-4" />
        <p className="font-black text-neutral-400 dark:text-neutral-500 uppercase text-[10px] tracking-widest">
          No active order
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-amber-500 font-bold transition-transform active:scale-95 text-sm"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 dark:bg-black min-h-screen pb-40 select-none touch-manipulation">
      {/* HEADERBAR */}
      <div className="p-4 flex items-center gap-4 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800/60 sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="text-slate-900 dark:text-white p-1 rounded-lg active:bg-neutral-100 dark:active:bg-neutral-800 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-black text-base text-slate-900 dark:text-white tracking-tight">Checkout Summary</h1>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        
        {/* FULL MULTI-VARIATION ITEM SUMMARY PREVIEW CARD */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800/60 shadow-xs space-y-4">
          <div>
            <p className="text-[9px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-1">
              Base Product Model
            </p>
            <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight">{product.name}</h3>
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800/60 pt-3 space-y-2.5">
            <p className="text-[9px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest">
              Selected Item Configuration Breakdown
            </p>
            
            {items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs bg-neutral-50 dark:bg-neutral-950 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/40">
                <div className="space-y-0.5">
                  <span className="font-black text-slate-800 dark:text-neutral-200 block uppercase">
                    {item.variant?.sku || `Variant Unit #${idx + 1}`}
                  </span>
                  <div className="flex flex-wrap gap-x-2 text-[11px] text-slate-400 font-medium">
                    {Object.entries(item.variant?.options || {}).map(([key, value]: any) => (
                      <span key={key}>{key}: <b className="text-slate-600 dark:text-neutral-300 font-semibold">{value}</b></span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-black text-slate-700 dark:text-neutral-300 block">× {item.qty}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    ₦{(item.variant?.price || product.basePrice || 0).toLocaleString()} each
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800/60 pt-3 flex justify-between items-end">
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Total Bulk Volume</p>
              <p className="text-xs font-black text-slate-700 dark:text-neutral-300 mt-0.5">{quantity} aggregate units</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Summary Cost</p>
              <p className="text-xl font-black text-amber-500">₦{totalPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* BANK ACCOUNTS CONTAINER */}
        <div className="space-y-2">
          <p className="text-[9px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest ml-1">
            Choose Preferred Bank
          </p>

          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-amber-500" size={24} />
            </div>
          ) : (
            accounts.map((acc) => (
              <div
                key={acc._id}
                onClick={() => setSelectedAccount(acc)}
                className={`p-4 bg-white dark:bg-neutral-900 border-2 rounded-xl transition-all cursor-pointer ${
                  selectedAccount?._id === acc._id
                    ? "border-amber-500 shadow-xs"
                    : "border-transparent opacity-60"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold text-slate-800 dark:text-neutral-100 text-sm">{acc.bankName}</p>
                  {selectedAccount?._id === acc._id && (
                    <div className="w-3 h-3 bg-amber-500 rounded-full border border-white dark:border-neutral-900 shadow-xs" />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 tracking-wider">{acc.accountNumber}</p>
              </div>
            ))
          )}
        </div>

        {/* TRANSFER CARD INFO */}
        {selectedAccount && (
          <div className="bg-slate-900 dark:bg-neutral-900 rounded-2xl p-5 text-white relative overflow-hidden border border-transparent dark:border-neutral-800/80 shadow-xl">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <CreditCard className="text-slate-600 dark:text-neutral-700" size={24} />
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  <ShieldCheck size={12} /> SECURE CHANNEL
                </div>
              </div>

              <p className="text-[9px] opacity-40 uppercase tracking-widest font-black mb-1">
                Account Number Reference
              </p>

              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-black tracking-wider font-mono text-amber-400">
                  {selectedAccount.accountNumber}
                </h2>

                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-white/5 dark:bg-neutral-800 rounded-lg hover:bg-white/10 transition-all active:scale-90"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <Copy size={14} className="text-slate-300" />
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start border-t border-white/5 dark:border-neutral-800 pt-4">
                <div>
                  <p className="text-[9px] opacity-40 uppercase tracking-widest font-black mb-0.5">Bank Hub</p>
                  <p className="font-bold text-xs text-slate-200">{selectedAccount.bankName}</p>
                </div>
                
                <div className="sm:text-right max-w-full sm:max-w-[65%]">
                  <p className="text-[9px] opacity-40 uppercase tracking-widest font-black mb-0.5">Beneficiary Account Name</p>
                  <p className="font-bold text-xs text-slate-100 break-words leading-tight whitespace-normal">
                    {selectedAccount.accountName}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          </div>
        )}

        {/* SECURITY INFO CALLOUT */}
        <div className="p-4 bg-amber-500/5 dark:bg-amber-950/10 rounded-xl border border-amber-500/20 flex gap-3 items-start">
          <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500 mt-0.5">
            <ShieldCheck size={16} />
          </div>
          <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
            <b className="font-bold text-amber-600 dark:text-amber-400">Verifying Transfer:</b> Please process the absolute balance total shown above, then trigger the confirmation button below to hand off your transaction ledger copy securely via WhatsApp.
          </p>
        </div>
      </div>

      {/* FOOTER ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-neutral-100 dark:border-neutral-900 z-[9999] shadow-[0_-8px_24px_rgba(0,0,0,0.02)]">
        <div className="max-w-xl mx-auto w-full">
          <button
            onClick={handleCompleteOrder}
            disabled={processingOrder || !selectedAccount}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-400 text-white py-3.5 rounded-xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm shadow-emerald-900/10"
          >
            {processingOrder ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <>
                <MessageCircle size={16} fill="currentColor" />
                Send Payment Receipt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;