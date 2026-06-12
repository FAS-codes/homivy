import { createContext, useContext, useEffect, useState } from "react";
import { cartApi } from "../shopify.js";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export const FREE_SHIP_THRESHOLD = 25;

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [busy, setBusy] = useState(false);

  // restore existing Shopify cart on load
  useEffect(() => {
    const id = localStorage.getItem("homivy-cart-id");
    if (!id) return;
    cartApi.fetch(id)
      .then((c) => (c ? setCart(c) : localStorage.removeItem("homivy-cart-id")))
      .catch(() => localStorage.removeItem("homivy-cart-id"));
  }, []);

  const ensureCart = async () => {
    if (cart) return cart;
    const c = await cartApi.create();
    localStorage.setItem("homivy-cart-id", c.id);
    setCart(c);
    return c;
  };

  const add = async (variantId, qty = 1) => {
    setBusy(true);
    try {
      const c = await ensureCart();
      const updated = await cartApi.addLine(c.id, variantId, qty);
      setCart(updated);
      return updated;
    } finally { setBusy(false); }
  };

  const setLineQty = async (lineId, qty) => {
    if (!cart) return;
    setBusy(true);
    try {
      const updated = qty <= 0
        ? await cartApi.removeLine(cart.id, lineId)
        : await cartApi.updateLine(cart.id, lineId, qty);
      setCart(updated);
    } finally { setBusy(false); }
  };

  const checkout = () => {
    if (cart?.checkoutUrl) window.location.href = cart.checkoutUrl;
  };

  return (
    <CartContext.Provider value={{
      cart, busy, add, setLineQty, checkout,
      count: cart?.count || 0,
      subtotal: cart?.subtotal || 0,
      lines: cart?.lines || [],
    }}>
      {children}
    </CartContext.Provider>
  );
}
