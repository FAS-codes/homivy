/**
 * Meta Pixel event helpers.
 * Base pixel + init live in index.html. PageView is fired from React (App.jsx)
 * so single-page navigations are counted, not just the first load.
 * Purchase fires on Shopify's checkout (checkout.homivy.co.uk) — same pixel ID —
 * so Meta stitches the full funnel together.
 */
function track(event, params) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

export const pageView = () => track("PageView");

export const viewContent = (p) =>
  track("ViewContent", {
    content_ids: [p.slug],
    content_name: p.title,
    content_type: "product",
    value: p.price,
    currency: "GBP",
  });

export const addToCart = (p, qty = 1) =>
  track("AddToCart", {
    content_ids: [p.slug],
    content_name: p.title,
    content_type: "product",
    value: Number((p.price * qty).toFixed(2)),
    currency: "GBP",
  });

export const initiateCheckout = (value, numItems) =>
  track("InitiateCheckout", {
    value: Number((value || 0).toFixed(2)),
    currency: "GBP",
    num_items: numItems,
  });
