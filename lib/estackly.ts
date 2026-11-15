import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { createStorefrontClient, type CartRef } from "@estackly/storefront";

const privateKey = process.env.ESTACKLY_PRIVATE_KEY;
const publicKey = process.env.ESTACKLY_PUBLIC_KEY;
if (!privateKey && !publicKey) throw new Error("Set ESTACKLY_PRIVATE_KEY in .env.local (see .env.example)");

// Every call runs on this server, so a private key is safe here and is not
// limited per visitor IP (a public key would see all shoppers as one IP).
const base = createStorefrontClient({ privateKey, publicKey: privateKey ? undefined : publicKey, apiUrl: process.env.ESTACKLY_API_URL });

// Store details, categories and pages change rarely: cache them for 5 minutes.
const cached = base.with({ fetchOptions: { next: { revalidate: 300 } } });

const CART = "estackly_cart";
const CURRENCY = "estackly_currency";

/** The client for this request, in the shopper's chosen currency. */
export async function estackly() {
  const currency = (await cookies()).get(CURRENCY)?.value;
  return currency ? base.with({ currency }) : base;
}

export const getStore = cache(() => cached.store());
export const getCategories = cache(() => cached.categories.list());
export const getPages = cache(() => cached.pages.list());

export async function cartRef(): Promise<CartRef | null> {
  const raw = (await cookies()).get(CART)?.value;
  if (!raw) return null;
  const [id, token] = raw.split(".", 2);
  return id && token ? { id, token } : null;
}

export async function saveCartRef(ref: CartRef | null) {
  const jar = await cookies();
  if (!ref) jar.delete(CART);
  else jar.set(CART, `${ref.id}.${ref.token}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
}

export async function saveCurrency(currency: string) {
  (await cookies()).set(CURRENCY, currency, { sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
}

/** The shopper's cart, or null when there is none or it expired. */
export async function getCart() {
  const ref = await cartRef();
  if (!ref) return null;
  try {
    return await (await estackly()).carts.get(ref);
  } catch {
    return null;
  }
}
