import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProduct, fetchProducts, money } from "../shopify.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { isWished, toggleWish } from "../wishlist.js";

export default function ProductDetail() {
  const { slug } = useParams();
  const { add, busy } = useCart();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState(null);
  const [wished, setWished] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setImgIdx(0); setQty(1); setNotFound(false); setProduct(null);
    fetchProduct(slug)
      .then(async (p) => {
        if (!p) return setNotFound(true);
        setProduct(p);
        setVariantId((p.variants.find((v) => v.available) || p.variants[0])?.id);
        setWished(isWished(p.slug));
        const rel = await fetchProducts({ category: p.category.slug, first: 5 });
        setRelated(rel.filter((x) => x.slug !== p.slug).slice(0, 4));
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  const variant = useMemo(
    () => product?.variants.find((v) => v.id === variantId) || product?.variants[0],
    [product, variantId]
  );

  // switch main image when a variant with its own image is selected
  useEffect(() => {
    if (variant?.image && product) {
      const idx = product.images.indexOf(variant.image);
      if (idx >= 0) setImgIdx(idx);
    }
  }, [variantId]);

  if (notFound) return <div className="page-loading">Product not found. <Link to="/shop">Back to shop</Link></div>;
  if (!product) return <div className="page-loading">Loading…</div>;

  const price = variant?.price ?? product.price;
  const compare = variant?.comparePrice;
  const save = compare ? Math.round((1 - price / compare) * 100) : 0;
  const out = variant ? !variant.available : product.stock <= 0;
  const hasVariants = product.variants.length > 1;

  const addToCart = async () => {
    try {
      await add(variantId, qty);
      toast(`${product.title} added to cart`);
    } catch (err) { toast(err.message, "error"); }
  };

  const onWish = () => {
    const added = toggleWish(product);
    setWished(added);
    toast(added ? "Added to wishlist" : "Removed from wishlist");
  };

  return (
    <>
      <section className="pdp">
        <div className="wrap">
          <nav className="breadcrumbs">
            <Link to="/">Home</Link> / <Link to={`/shop?cat=${product.category.slug}`}>{product.category.name}</Link> / <span>{product.title}</span>
          </nav>
          <div className="pdp-grid">
            <div>
              <div className="gallery-main">
                {save > 0 && <span className="sale-badge">−{save}%</span>}
                <img src={product.images[imgIdx]} alt={product.fullTitle} key={imgIdx} />
              </div>
              {product.images.length > 1 && (
                <div className="gallery-thumbs">
                  {product.images.map((src, i) => (
                    <button key={i} className={i === imgIdx ? "active" : ""} onClick={() => setImgIdx(i)}>
                      <img src={src} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="pdp-info">
              <span className="p-cat">{product.category.name}</span>
              <h1>{product.fullTitle}</h1>
              <div className="pdp-price-row">
                <span className="pdp-price">{money(price)}</span>
                {save > 0 && <><span className="pdp-compare">{money(compare)}</span><span className="p-save">Save {save}%</span></>}
              </div>
              <p className="pdp-short">{product.description}</p>

              {hasVariants && (
                <div className="variant-block">
                  <span className="variant-label">Options</span>
                  <div className="variant-options">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        className={`variant-btn ${v.id === variantId ? "active" : ""} ${!v.available ? "sold-out" : ""}`}
                        onClick={() => v.available && setVariantId(v.id)}
                        disabled={!v.available}
                      >
                        {v.title || "Default"}{!v.available ? " · sold out" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="stock-line">
                {out ? <span className="stock out">Out of stock</span> : <span className="stock in">✓ In stock</span>}
              </div>
              <div className="buy-row">
                <div className="qty">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <input value={qty} readOnly />
                  <button onClick={() => setQty(qty + 1)}>+</button>
                </div>
                <button className="btn btn-primary add-to-cart" disabled={out || busy} onClick={addToCart}>
                  {out ? "Out of stock" : busy ? "Adding…" : <>Add to cart <span className="arr">→</span></>}
                </button>
                <button className={`btn-icon wish ${wished ? "active" : ""}`} onClick={onWish} aria-label="Toggle wishlist">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M12 21s-7.5-4.8-10-9.3C.4 8 2 4.5 5.5 4 7.7 3.7 9.6 4.8 12 7c2.4-2.2 4.3-3.3 6.5-3 3.5.5 5.1 4 3.5 7.7-2.5 4.5-10 9.3-10 9.3z"/></svg>
                </button>
              </div>
              <div className="trust-row">
                <span>✓ Free shipping over £25</span>
                <span>✓ Secure Shopify checkout</span>
                <span>✓ 30-day returns</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section-head"><div><span className="kicker">Keep exploring</span><h2>You may also like</h2></div></div>
            <div className="product-grid">
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
