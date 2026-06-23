/**
 * Analytics pixels — Meta + TikTok.
 * Base pixels + init live in index.html. Page views are fired from React
 * (App.jsx) so single-page navigations are counted, not just the first load.
 * Purchase fires on Shopify's checkout (checkout.homivy.co.uk) for both pixels.
 */
function fb(event, params) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}
function tt(event, params) {
  if (typeof window !== "undefined" && window.ttq && typeof window.ttq.track === "function") {
    window.ttq.track(event, params);
  }
}

export const pageView = () => {
  fb("PageView");
  if (typeof window !== "undefined" && window.ttq && typeof window.ttq.page === "function") {
    window.ttq.page();
  }
};

export const viewContent = (p) => {
  fb("ViewContent", {
    content_ids: [p.slug],
    content_name: p.title,
    content_type: "product",
    value: p.price,
    currency: "GBP",
  });
  tt("ViewContent", {
    contents: [{ content_id: p.slug, content_name: p.title, content_type: "product", price: p.price, quantity: 1 }],
    value: p.price,
    currency: "GBP",
  });
};

export const addToCart = (p, qty = 1) => {
  const value = Number((p.price * qty).toFixed(2));
  fb("AddToCart", {
    content_ids: [p.slug],
    content_name: p.title,
    content_type: "product",
    value,
    currency: "GBP",
  });
  tt("AddToCart", {
    contents: [{ content_id: p.slug, content_name: p.title, content_type: "product", price: p.price, quantity: qty }],
    value,
    currency: "GBP",
  });
};

export const initiateCheckout = (value, numItems) => {
  const v = Number((value || 0).toFixed(2));
  fb("InitiateCheckout", { value: v, currency: "GBP", num_items: numItems });
  tt("InitiateCheckout", { value: v, currency: "GBP", contents: [{ quantity: numItems }] });
};
