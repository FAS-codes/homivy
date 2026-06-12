import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { ACCOUNT_URL } from "../shopify.js";

export default function Header() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <>
      <header className="site-header">
        <div className="wrap bar">
          <Link to="/" className="logo" onClick={close}><span className="dot" />Homivy</Link>
          <nav className="nav-links">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/shop" end>Shop All</NavLink>
            <NavLink to="/shop?cat=bathroom-hygiene-1">Washroom</NavLink>
            <NavLink to="/shop?cat=kitchen-essentials-1">Kitchen</NavLink>
            <NavLink to="/shop?cat=home-decor">Decor</NavLink>
          </nav>
          <div className="header-actions">
            <Link to="/wishlist" className="btn-icon" aria-label="Wishlist">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7.5-4.8-10-9.3C.4 8 2 4.5 5.5 4 7.7 3.7 9.6 4.8 12 7c2.4-2.2 4.3-3.3 6.5-3 3.5.5 5.1 4 3.5 7.7-2.5 4.5-10 9.3-10 9.3z"/></svg>
            </Link>
            <a href={ACCOUNT_URL} className="btn-icon" aria-label="Account" title="My account & orders">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>
            </a>
            <Link to="/cart" className="cart-btn" onClick={close}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 7h12l1.5 13h-15L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
              <span className="lbl">Cart</span>
              <span className="cart-count">{count}</span>
            </Link>
            <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <button className="close-menu" onClick={close}>✕</button>
        <Link to="/" onClick={close}>Home</Link>
        <Link to="/shop" onClick={close}>Shop All</Link>
        <Link to="/cart" onClick={close}>Cart</Link>
        <Link to="/wishlist" onClick={close}>Wishlist</Link>
        <a href={ACCOUNT_URL}>My Account</a>
      </div>
    </>
  );
}
