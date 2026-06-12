/**
 * Shopify Storefront API client.
 * All storefront data (products, collections, cart) comes from here.
 * Checkout and customer accounts are handled by Shopify's hosted pages.
 */
const DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN;
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
const API = `https://${DOMAIN}/api/2024-10/graphql.json`;

export const SHOP_URL = import.meta.env.VITE_SHOP_URL || `https://${DOMAIN}`;
export const ACCOUNT_URL = `${SHOP_URL}/account`;
export const money = (n) => "£" + Number(n || 0).toFixed(2);

export async function gql(query, variables = {}) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
}

/* ---------------- categories (collections) ---------------- */
// our 4 storefront categories → Shopify collection handles
export const CATEGORIES = [
  { slug: "home-decor", name: "Home Decor", tagline: "Details that make a house a home" },
  { slug: "bathroom-hygiene-1", name: "Washroom & Hygiene", tagline: "A fresher, cleaner bathroom every day" },
  { slug: "kitchen-essentials-1", name: "Kitchen Essentials", tagline: "Smart tools for effortless cooking" },
  { slug: "household-essentials", name: "Household Essentials", tagline: "Everyday solutions that just work" },
];
export const catBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);

const typeToCategory = {
  "Bathroom & Hygiene": "bathroom-hygiene-1",
  "Kitchen Essentials": "kitchen-essentials-1",
  "Household Essentials": "household-essentials",
};

/* ---------------- product adapter ---------------- */
const PRODUCT_FRAGMENT = `
  fragment P on Product {
    id title handle description productType availableForSale
    featuredImage { url }
    images(first: 10) { edges { node { url } } }
    priceRange { minVariantPrice { amount } maxVariantPrice { amount } }
    compareAtPriceRange { maxVariantPrice { amount } }
    variants(first: 25) {
      edges { node {
        id title availableForSale
        price { amount } compareAtPrice { amount }
        image { url }
      } }
    }
  }
`;

function adaptProduct(node) {
  if (!node) return null;
  const variants = node.variants.edges.map(({ node: v }) => ({
    id: v.id,
    title: v.title === "Default Title" ? null : v.title.replace(/^[-\s]+/, ""),
    price: +v.price.amount,
    comparePrice: v.compareAtPrice ? +v.compareAtPrice.amount : null,
    available: v.availableForSale,
    image: v.image?.url || null,
  }));
  const minPrice = +node.priceRange.minVariantPrice.amount;
  const maxPrice = +node.priceRange.maxVariantPrice.amount;
  const catSlug = typeToCategory[(node.productType || "").split(",")[0].trim()] || "home-decor";
  return {
    _id: node.id,
    slug: node.handle,
    title: node.title.split(/ – | — /)[0].trim(),
    fullTitle: node.title,
    description: node.description,
    images: node.images.edges.map((e) => e.node.url),
    price: minPrice,
    maxPrice,
    priceVaries: maxPrice > minPrice,
    comparePrice: variants[0]?.comparePrice || (+node.compareAtPriceRange.maxVariantPrice.amount || null),
    stock: node.availableForSale ? 1 : 0,
    category: catBySlug(catSlug),
    variants,
  };
}

/* ---------------- product queries ---------------- */
const SORT_MAP = {
  featured: { sortKey: "BEST_SELLING", reverse: false },
  newest: { sortKey: "CREATED_AT", reverse: true },
  "price-asc": { sortKey: "PRICE", reverse: false },
  "price-desc": { sortKey: "PRICE", reverse: true },
  name: { sortKey: "TITLE", reverse: false },
};
const COLLECTION_SORT_MAP = {
  featured: { sortKey: "BEST_SELLING", reverse: false },
  newest: { sortKey: "CREATED", reverse: true },
  "price-asc": { sortKey: "PRICE", reverse: false },
  "price-desc": { sortKey: "PRICE", reverse: true },
  name: { sortKey: "TITLE", reverse: false },
};

export async function fetchProducts({ category = "all", q = "", sort = "featured", first = 48 } = {}) {
  if (category !== "all") {
    const { sortKey, reverse } = COLLECTION_SORT_MAP[sort] || COLLECTION_SORT_MAP.featured;
    const data = await gql(
      `${PRODUCT_FRAGMENT}
      query ($handle: String!, $first: Int!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
        collection(handle: $handle) {
          products(first: $first, sortKey: $sortKey, reverse: $reverse) { edges { node { ...P } } }
        }
      }`,
      { handle: category, first, sortKey, reverse }
    );
    let products = (data.collection?.products.edges || []).map((e) => adaptProduct(e.node));
    if (q) products = products.filter((p) => p.fullTitle.toLowerCase().includes(q.toLowerCase()));
    return products;
  }
  const { sortKey, reverse } = SORT_MAP[sort] || SORT_MAP.featured;
  const data = await gql(
    `${PRODUCT_FRAGMENT}
    query ($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
      products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) { edges { node { ...P } } }
    }`,
    { first, query: q ? `title:*${q}*` : null, sortKey, reverse }
  );
  return data.products.edges.map((e) => adaptProduct(e.node));
}

export async function fetchProduct(handle) {
  const data = await gql(
    `${PRODUCT_FRAGMENT} query ($handle: String!) { product(handle: $handle) { ...P } }`,
    { handle }
  );
  return adaptProduct(data.product);
}

export async function fetchCollections() {
  const data = await gql(`
    query { collections(first: 20) { edges { node { handle title description image { url } } } } }
  `);
  const byHandle = Object.fromEntries(data.collections.edges.map((e) => [e.node.handle, e.node]));
  return CATEGORIES.map((c) => ({
    ...c,
    image: byHandle[c.slug]?.image?.url || null,
  }));
}

/* ---------------- cart ---------------- */
const CART_FRAGMENT = `
  fragment C on Cart {
    id checkoutUrl totalQuantity
    cost { subtotalAmount { amount } totalAmount { amount } }
    lines(first: 50) { edges { node {
      id quantity
      cost { totalAmount { amount } }
      merchandise { ... on ProductVariant {
        id title
        price { amount }
        image { url }
        product { title handle featuredImage { url } }
      } }
    } } }
  }
`;

function adaptCart(cart) {
  if (!cart) return null;
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    count: cart.totalQuantity,
    subtotal: +cart.cost.subtotalAmount.amount,
    total: +cart.cost.totalAmount.amount,
    lines: cart.lines.edges.map(({ node }) => ({
      id: node.id,
      qty: node.quantity,
      lineTotal: +node.cost.totalAmount.amount,
      variantId: node.merchandise.id,
      variantTitle: node.merchandise.title === "Default Title" ? null : node.merchandise.title.replace(/^[-\s]+/, ""),
      price: +node.merchandise.price.amount,
      image: node.merchandise.image?.url || node.merchandise.product.featuredImage?.url || "",
      title: node.merchandise.product.title.split(/ – | — /)[0].trim(),
      handle: node.merchandise.product.handle,
    })),
  };
}

async function cartMutation(mutation, variables) {
  const data = await gql(`${CART_FRAGMENT} ${mutation}`, variables);
  const result = Object.values(data)[0];
  if (result.userErrors?.length) throw new Error(result.userErrors[0].message);
  return adaptCart(result.cart);
}

export const cartApi = {
  create: () => cartMutation(`mutation { cartCreate { cart { ...C } userErrors { message } } }`, {}),
  fetch: async (id) => {
    const data = await gql(`${CART_FRAGMENT} query ($id: ID!) { cart(id: $id) { ...C } }`, { id });
    return adaptCart(data.cart);
  },
  addLine: (cartId, merchandiseId, quantity) =>
    cartMutation(
      `mutation ($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...C } userErrors { message } } }`,
      { cartId, lines: [{ merchandiseId, quantity }] }
    ),
  updateLine: (cartId, lineId, quantity) =>
    cartMutation(
      `mutation ($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...C } userErrors { message } } }`,
      { cartId, lines: [{ id: lineId, quantity }] }
    ),
  removeLine: (cartId, lineId) =>
    cartMutation(
      `mutation ($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...C } userErrors { message } } }`,
      { cartId, lineIds: [lineId] }
    ),
};
