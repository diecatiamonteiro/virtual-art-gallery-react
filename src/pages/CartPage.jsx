import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { toast } from "react-hot-toast";

export default function CartPage() {
  const navigate = useNavigate();
  const {
    currentUser,
    cart,
    removeFromCart,
    updateCartItemQuantity,
    calculateTotal,
  } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch fresh artwork data for each cart item
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!cart.length) {
        setLoading(false);
        return;
      }

      try {
        const freshCartItems = await Promise.all(
          cart.map(async (item) => {
            const artworkDoc = await getDoc(doc(db, "artworks", item.id));
            if (artworkDoc.exists()) {
              const artworkData = artworkDoc.data();
              return {
                ...item,
                user: artworkData.user,
                title: artworkData.title || artworkData.alt_description,
                imageUrl: artworkData.imageUrl || artworkData.urls?.regular,
              };
            }
            return item;
          })
        );
        setCartItems(freshCartItems);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        toast.error("Error loading cart items");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [cart]);

  // Handle checkout process
  const handleCheckout = () => {
    if (!currentUser) {
      const wantsToSignIn = window.confirm(
        "Would you like to sign in? Click OK to sign in or Cancel to continue as guest."
      );
      if (wantsToSignIn) {
        navigate("/login", {
          state: {
            returnTo: "/cart",
            message: "Sign in to complete your purchase",
          },
        });
        return;
      }
    }
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="pt-12 pb-20 px-4 container mx-auto min-h-screen">
        Loading...
      </div>
    );
  }

  // Show empty cart state
  if (cart.length === 0) {
    return (
      <div className="pt-12 pb-20 px-4 container mx-auto min-h-screen">
        <h1 className="text-3xl font-bold text-center mb-8">Shopping Cart</h1>
        <div className="text-center py-12">
          <p className="text-gray-500">Your cart is empty</p>
          <button
            onClick={() => navigate("/for-art-lovers")}
            className="mt-4 bg-blue-700 font-bold text-white px-12 py-3 rounded-3xl hover:bg-blue-800 transition-colors duration-300"
          >
            Explore Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12 pb-20 px-4 container mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {/* Back button */}
      <button
        onClick={() => navigate("/for-art-lovers")}
        className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
      >
        <MdArrowBack /> Continue Shopping
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1000px] mx-auto">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded"
              />
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold">
                    {item.title.charAt(0).toUpperCase() +
                      item.title.slice(1).toLowerCase()}
                  </h3>
                  <p className="text-gray-600">
                    {item.user?.name || "Unknown Artist"}
                  </p>
                  <span className="font-bold text-lg">
                    €{parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col items-right gap-4 pt-2">
                  <div className="flex justify-between sm:justify-end items-center flex-1 gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateCartItemQuantity(
                            item.id,
                            (item.quantity || 1) - 1
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() =>
                          updateCartItemQuantity(
                            item.id,
                            (item.quantity || 1) + 1
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  {(item.quantity || 1) > 1 && (
                    <p className="text-sm text-gray-500 sm:text-right">
                      Subtotal: €
                      {(parseFloat(item.price) * (item.quantity || 1)).toFixed(
                        2
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>€{calculateTotal()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>€{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
            onClick={handleCheckout}
          >
            {currentUser ? "Proceed to Checkout" : "Checkout as Guest"}
          </button>

          {/* Sign in prompt for guests */}
          {!currentUser && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              Have an account?{" "}
              <button
                onClick={() =>
                  navigate("/login", {
                    state: { returnTo: "/cart" },
                  })
                }
                className="text-blue-600 hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
