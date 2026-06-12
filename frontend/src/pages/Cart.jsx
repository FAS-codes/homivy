import { Link } from "react-router-dom";
import { money } from "../shopify.js";
import { useCart, FREE_SHIP_THRESHOLD } from "../context/CartContext.jsx";

export default function Cart() {
  const { lines, setLineQty, subtotal, checkout, busy } = useCart();
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);

  if (lines.length === 0) {
    return (
      <section className="page-hero" style={{ minHeight: "70vh" }}>
        <div className="hero-bg" />
        <div className="wrap" style={{ textAlign: "center" }}>
          <h1>Your cart is empty</h1>
          <p style={{ margin: "16px auto 28px" }}>Beautiful home essentials are waiting for you.</p>
          <Link to="/shop" className="btn btn-primary">Start shopping <span className="arr">→</span></Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-hero" style={{ paddingBottom: 80 }}>
      <div className="hero-bg" />
      <div className="wrap">
        <h1>Your Cart</h1>
        <div className="cart-layout">
          <div className="cart-list">
            <div className="ship-progress card-box">
              <div className="msg">
                {remaining > 0 ? <>Add <b>{money(remaining)}</b> more for <b>free shipping</b></> : <>🎉 You've unlocked <b>free shipping</b>!</>}
              </div>
              <div className="ship-bar"><i style={{ width: pct + "%" }} /></div>
            </div>
            {lines.map((l) => (
              <div className="cart-item card-box" key={l.id}>
                <Link to={`/product/${l.handle}`}><img src={l.image} alt={l.title} /></Link>
                <div className="ci-info">
                  <Link to={`/product/${l.handle}`} className="ci-title">{l.title}</Link>
                  {l.variantTitle && <small className="muted">{l.variantTitle}</small>}
                  <div className="ci-price">{money(l.price)} each</div>
                  <div className="ci-controls">
                    <div className="ci-qty">
                      <button disabled={busy} onClick={() => setLineQty(l.id, l.qty - 1)}>−</button>
                      <span>{l.qty}</span>
                      <button disabled={busy} onClick={() => setLineQty(l.id, l.qty + 1)}>+</button>
                    </div>
                    <button className="ci-remove" disabled={busy} onClick={() => setLineQty(l.id, 0)}>Remove</button>
                  </div>
                </div>
                <div className="ci-line-total">{money(l.lineTotal)}</div>
              </div>
            ))}
          </div>
          <aside className="summary card-box">
            <h3>Order Summary</h3>
            <div className="sum-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="sum-row"><span>Shipping</span><span>Calculated at checkout</span></div>
            <div className="sum-row total"><span>Total</span><span>{money(subtotal)}</span></div>
            <small className="muted">Discount codes, shipping and payment are handled on the next step — Shopify's secure checkout.</small>
            <button className="btn btn-lime checkout-btn" disabled={busy} onClick={checkout}>
              Secure checkout <span className="arr">→</span>
            </button>
            <Link to="/shop" className="continue-link">← Continue shopping</Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
