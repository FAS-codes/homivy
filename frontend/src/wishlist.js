/** Local wishlist — stored in the browser, no account needed. */
const KEY = "homivy-wishlist";

export function getWishlist() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

export const isWished = (slug) => getWishlist().some((p) => p.slug === slug);

export function toggleWish(product) {
  const list = getWishlist();
  const idx = list.findIndex((p) => p.slug === product.slug);
  if (idx >= 0) {
    list.splice(idx, 1);
    localStorage.setItem(KEY, JSON.stringify(list));
    return false;
  }
  list.push({
    slug: product.slug,
    title: product.title,
    image: product.images[0],
    price: product.price,
    category: product.category?.name || "",
  });
  localStorage.setItem(KEY, JSON.stringify(list));
  return true;
}

export function removeWish(slug) {
  localStorage.setItem(KEY, JSON.stringify(getWishlist().filter((p) => p.slug !== slug)));
}
