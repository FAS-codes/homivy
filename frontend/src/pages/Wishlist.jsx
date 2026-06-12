import { useState } from "react";
import { Link } from "react-router-dom";
import { money } from "../shopify.js";
import { getWishlist, removeWish } from "../wishlist.js";

export default function Wishlist() {
  const [items, setItems] = useState(getWishlist());

  const remove = (slug) => {
    removeWish(slug);
    setItems(getWishlist());
  };

  if (items.length === 0) {
    return (
      <section className="page-hero" style={{ minHeight: "70vh" }}>
        <div className="hero-bg" />
        <div className="wrap" style={{ textAlign: "center" }}>
          <h1>Your wishlist is empty</h1>
          <p style={{ margin: "16px auto 28px" }}>Tap the heart on any product to save it for later.</p>
          <Link to="/shop" className="btn btn-primary">Browse products <span className="arr">→</span></Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-hero" style={{ paddingBottom: 80 }}>
      <div className="hero-bg" />
      <div className="wrap">
        <h1>Wishlist</h1>
        <p>{items.length} saved item{items.length === 1 ? "" : "s"} — saved on this device.</p>
        <div className="card-box" style={{ marginTop: 28 }}>
          <div className="order-list">
            {items.map((p) => (
              <div className="order-row" key={p.slug}>
                <Link to={`/product/${p.slug}`}><img className="wish-img" src={p.image} alt={p.title} /></Link>
                <div className="order-meta">
                  <Link to={`/product/${p.slug}`}><b>{p.title}</b></Link>
                  <small>{p.category}</small>
                </div>
                <b>{money(p.price)}</b>
                <div className="row-actions">
                  <Link to={`/product/${p.slug}`} className="btn btn-primary btn-sm">View product</Link>
                  <button className="ci-remove" onClick={() => remove(p.slug)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
