import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
  const {
    cart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    cartTotal,
  } = useCart();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          🛒 Your Cart
        </h1>

        <Link
          to="/"
          className="text-orange-600 font-medium hover:underline"
        >
          Continue Shopping
        </Link>
      </div>

      {/* EMPTY CART */}
      {cart.length === 0 ? (
        <div className="max-w-5xl mx-auto text-center py-20 bg-white dark:bg-gray-900 rounded-2xl shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Your cart is empty
          </p>

          <Link
            to="/"
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">

          {/* CART ITEMS */}
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm"
              >

                {/* LEFT */}
                <div className="flex items-center gap-4">

                  {/* IMAGE */}
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-lg" />

                  {/* INFO */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </h3>

                    <p className="text-orange-600 font-bold">
                      ${item.price}
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-4">

                  {/* QTY CONTROL */}
                  <div className="flex items-center gap-2 border rounded-lg px-2 py-1 dark:border-gray-700">
                    <button onClick={() => decreaseQty(item._id)}>
                      <Minus size={16} />
                    </button>

                    <span className="text-sm font-medium">
                      {item.quantity}
                    </span>

                    <button onClick={() => increaseQty(item._id)}>
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* REMOVE */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm h-fit">

            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>

            <div className="flex justify-between mb-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white mb-6">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </main>
  );
}