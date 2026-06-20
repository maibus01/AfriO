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

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State Management
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [copied, setCopied] = useState(false);

  // =========================================================================
  // EXTRACT VARIANT DATA FROM ROUTING STATE
  // =========================================================================
  // Added: variantPrice and variantImage extracted from the router state snapshot
  const { 
    product, 
    variantId, 
    sku, 
    variantOptions, 
    quantity, 
    notes, 
    calculatedPrice,
    variantPrice, 
    variantImage 
  } = location.state || {};
  
  const totalPrice = calculatedPrice || (product ? (product.measurement?.pricePerUnit || product.basePrice) * quantity : 0);
  
  // Determine item display price: Variant specific price, fallback to calculated split, fallback to product base
  const unitPriceDisplay = variantPrice || (calculatedPrice ? calculatedPrice / quantity : (product?.measurement?.pricePerUnit || product?.basePrice || 0));
  
  // Determine item thumbnail image: Variant snapshot image, fallback to product main display image
  const displayImage = variantImage || product?.image || product?.images?.[0] || null;

  // 1. FETCH ACCOUNTS ON LOAD
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
        console.error("Failed to load payment accounts");
      } finally {
        setLoading(false);
      }
    };

    if (product) fetchAccounts();
  }, [product]);

  // =========================================================================
  // 2. CREATE ORDER (WITH VARIANT SAVE LOGIC) + WHATSAPP HANDOFF
  // =========================================================================
  const handleCompleteOrder = async () => {
    if (!selectedAccount) {
      alert("Please select a payment account");
      return;
    }

    try {
      setProcessingOrder(true);

      const res = await API.post("/orders", {
        productId: product._id,
        variantId: variantId || null,
        sku: sku || "",
        unitPrice: totalPrice / quantity,
        businessId: product.businessId?._id || product.businessId,
        quantity,
        notes,
        totalPrice,
        platformAccountId: selectedAccount._id,
      });

      const refNumber = res.data.order.refNumber || res.data.order._id.slice(-6).toUpperCase();

      const variantSpecText = variantOptions 
        ? Object.entries(variantOptions).map(([key, val]) => `\n*${key}:* ${val}`).join("")
        : "";

      const rawMessage = `💎 *%F0%9F%92%8E AFRIO ORDER RECEIPT*\n\n*Ref Number:* ${refNumber}\n*Product:* ${product.name}${variantSpecText}\n*SKU:* ${sku || "N/A"}\n*Quantity:* ${quantity}\n*Total Amount:* ₦${totalPrice.toLocaleString()}\n\n*Payment To:* ${selectedAccount.bankName}\nNote: I have made the transfer. Please verify.`;

      const message = encodeURIComponent(rawMessage);
      const phone = "2349027456061";

      window.open(
        `https://api.whatsapp.com/send?phone=${phone}&text=${message}`,
        "_blank"
      );
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
        
        {/* ORDER OVERVIEW CARD */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800/60 shadow-xs">
          <p className="text-[9px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-3">
            Items Package
          </p>

          <div className="flex gap-4 items-start">
            {/* 📸 SKU PICTURE BLOCK */}
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={product.name} 
                className="w-20 h-20 object-cover rounded-xl border border-neutral-200/60 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center text-neutral-400 flex-shrink-0">
                <ShoppingBag size={20} />
              </div>
            )}

            {/* SKU META DETAILS & PRICES BLOCK */}
            <div className="space-y-1 flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 dark:text-neutral-100 text-sm line-clamp-2 leading-tight">
                {product.name}
              </h3>
              
              {sku && (
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono bg-neutral-50 dark:bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-200/20 w-fit">
                  SKU: {sku}
                </p>
              )}

              {variantOptions && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {Object.entries(variantOptions).map(([key, value]: any) => (
                    <span key={key} className="text-[9px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 px-1.5 py-0.5 rounded uppercase tracking-wide">
                      {key}: {value}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="pt-1 flex items-baseline gap-2 text-xs text-slate-500 dark:text-neutral-400">
                <span>Qty: <b className="text-slate-800 dark:text-white font-bold">{quantity}</b></span>
                <span>•</span>
                <span>Unit: ₦{unitPriceDisplay.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* TOTAL AGGREGATE PANEL BAR */}
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest">
              Total aggregate
            </span>
            <p className="text-lg font-black text-amber-500">
              ₦{totalPrice.toLocaleString()}
            </p>
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
                    <div className="w-3 h-3 bg-amber-500 rounded-full border border-white dark:border-neutral-900 shadow-xs flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs font-mono font-bold text-slate-600 dark:text-neutral-300 tracking-wider break-all">
                  {acc.accountNumber}
                </p>
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

              <div className="flex items-center justify-between gap-3 bg-black/20 p-3 rounded-xl border border-white/5 mb-6">
                <h2 className="text-xl sm:text-2xl font-black tracking-wide font-mono text-amber-400 select-all break-all min-w-0">
                  {selectedAccount.accountNumber}
                </h2>

                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-white/5 dark:bg-neutral-800 rounded-lg hover:bg-white/10 transition-all active:scale-90 flex-shrink-0"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <Copy size={14} className="text-slate-300" />
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start border-t border-white/5 dark:border-neutral-800 pt-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] opacity-40 uppercase tracking-widest font-black mb-0.5">Bank Hub</p>
                  <p className="font-bold text-xs text-slate-200 truncate">{selectedAccount.bankName}</p>
                </div>
                
                <div className="sm:text-right flex-1 min-w-0">
                  <p className="text-[9px] opacity-40 uppercase tracking-widest font-black mb-0.5">Beneficiary Account Name</p>
                  <p className="font-bold text-xs text-slate-100 break-words tracking-tight leading-tight whitespace-normal">
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