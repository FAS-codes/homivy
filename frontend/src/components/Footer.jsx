import { Link } from "react-router-dom";
import { ACCOUNT_URL, SHOP_URL } from "../shopify.js";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Link to="/" className="logo"><span className="dot" />Homivy</Link>
            <p className="about">Homivy helps you create a cleaner, more organized, and beautiful home — with essentials designed for everyday life.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link to="/shop?cat=bathroom-hygiene-1">Washroom & Hygiene</Link></li>
              <li><Link to="/shop?cat=kitchen-essentials-1">Kitchen Essentials</Link></li>
              <li><Link to="/shop?cat=home-decor">Home Decor</Link></li>
              <li><Link to="/shop?cat=household-essentials">Household Essentials</Link></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li><a href={ACCOUNT_URL}>My Orders</a></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/cart">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><a href={`${SHOP_URL}/policies/shipping-policy`}>Shipping Policy</a></li>
              <li><a href={`${SHOP_URL}/policies/refund-policy`}>Returns & Refunds</a></li>
              <li><a href={`${SHOP_URL}/policies/privacy-policy`}>Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-mega">HOMIVY</div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Homivy. All rights reserved.</span>
          <span>Free UK shipping over £25</span>
        </div>
      </div>
    </footer>
  );
}
