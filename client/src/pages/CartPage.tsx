import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShieldCheck, Truck, Receipt } from "lucide-react";

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  const navigate = useNavigate();

  // Sends the entire item block array seamlessly over to the Checkout view
  const handleCheckoutNavigation = () => {
  if (cart.length === 0) return;

  // Pack the entire dynamic list of products securely into the router state
  const checkoutPayload = {
    isCartCheckout: true,
    items: cart.map(item => ({
      _id: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      merchantName: item.merchantName || "Verified Seller",
    })),
    totalPrice: cartTotal,
  };

  // Route directly to your single manual bank transfer ledger page
  navigate("/order", { state: checkoutPayload });
};

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-100 pb-32 select-none touch-manipulation">
      
      {/* --- FLOATING HEADER ACTION BAR --- */}
      <nav className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-slate-50/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200/20 dark:border-neutral-900">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-slate-900 dark:text-white rounded-xl shadow-sm active:scale-95 transition-transform border border-slate-200/40 dark:border-neutral-800"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Review Your Bag</h1>
        <Link
          to="/"
          className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-amber-500 hover:opacity-80 transition-opacity"
        >
          Shop
        </Link>
      </nav>

      {/* --- MAIN BAG CONTAINER --- */}
      <div className="max-w-7xl mx-auto pt-24 px-4 md:px-6">
        {cart.length === 0 ? (
          
          /* --- EMPTY BAG PRESENTATION STATE --- */
          <div className="flex flex-col items-center justify-center text-center py-20 px-4 max-w-md mx-auto">
            <div className="w-20 h-20 bg-slate-100 dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-neutral-600 mb-6">
              <ShoppingBag size={36} />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight mb-2">Your bag is empty</h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed mb-8">
              Add premium lines, custom tailored items, or designs from verified local merchants to get started.
            </p>
            <Link
              to="/"
              className="w-full bg-neutral-900 dark:bg-amber-500 text-white dark:text-black py-4 rounded-xl font-black text-center text-sm transition-all active:scale-98"
            >
              Shop Collection
            </Link>
          </div>

        ) : (

          /* --- ACTIVE ITEMS SPLIT VIEW --- */
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* COMPACT ITEMS COLUMN (LEFT) */}
            <div className="w-full lg:w-2/3 space-y-4">
              {cart.map((item) => {
                const itemImg = item.image || "";
                
                return (
                  <div 
                    key={item._id}
                    className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800/60 p-4 rounded-2xl shadow-sm flex gap-4"
                  >
                    {/* Media Node */}
                    <div className="w-24 h-24 bg-slate-50 dark:bg-neutral-950 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-neutral-800/40">
                      {itemImg ? (
                        <img src={itemImg} className="w-full h-full object-cover" alt={item.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400 dark:text-neutral-600 font-bold uppercase bg-slate-100 dark:bg-neutral-950">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Meta Fields Content Area */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                              {item.name}
                            </h3>
                            {item.merchantName && (
                              <p className="text-[10px] text-slate-400 font-bold dark:text-neutral-500 mt-0.5">
                                Merchant: {item.merchantName}
                              </p>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => removeFromCart(item._id)}
                            className="text-slate-300 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Interactive Adjustment Section */}
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50 dark:border-neutral-800/40">
                        <p className="text-base font-black text-orange-600 dark:text-amber-500">
                          ₦{item.price?.toLocaleString()}
                        </p>

                        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-neutral-950 p-1 rounded-lg border border-slate-100 dark:border-neutral-800/40">
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 bg-white dark:bg-neutral-900 rounded-md shadow-sm flex items-center justify-center text-slate-500 dark:text-neutral-400 border dark:border-neutral-800 disabled:opacity-30 active:scale-90 transition-transform"
                          >
                            <Minus size={12} />
                          </button>
                          
                          <span className="font-black text-xs w-4 text-center text-slate-800 dark:text-neutral-200">
                            {item.quantity}
                          </span>
                          
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-7 h-7 bg-neutral-900 dark:bg-amber-500 rounded-md shadow-sm flex items-center justify-center text-white dark:text-black active:scale-90 transition-transform"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* ORDER VALUE MATRIX BOX (RIGHT SIDEBAR) */}
            <div className="w-full lg:w-1/3 bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800/60 p-5 md:p-6 rounded-2xl shadow-sm space-y-5 lg:sticky lg:top-24">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 dark:text-neutral-500">
                Order Summary
              </h3>

              {/* Breakdown Details */}
              <div className="space-y-3 text-xs font-bold text-slate-500 dark:text-neutral-400 border-b border-slate-100 dark:border-neutral-800/60 pb-4">
                <div className="flex justify-between">
                  <span>Subtotal Amount</span>
                  <span className="text-slate-900 dark:text-neutral-200">₦{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><Truck size={13} /> Logistic Courier</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black uppercase text-[10px] tracking-wider">Free Delivery</span>
                </div>
              </div>

              {/* Cumulative Combined Valuation */}
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Total aggregate</span>
                <span className="text-xl font-black text-orange-600 dark:text-amber-500">
                  ₦{cartTotal.toLocaleString()}
                </span>
              </div>

              {/* Master Checkout Button Navigation Trigger */}
              <button
                onClick={handleCheckoutNavigation}
                className="w-full bg-slate-900 hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-black py-4 rounded-xl font-black text-xs tracking-widest uppercase transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
              >
                <Receipt size={14} />
                View Account Details & Pay
              </button>

              {/* Legal and Escrow Protection Subtext */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-wider pt-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Escrow Covered Payment Channel</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}