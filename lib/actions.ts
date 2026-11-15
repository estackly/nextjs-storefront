"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { EstacklyError, type Cart } from "@estackly/storefront";
import { cartRef, estackly, saveCartRef, saveCurrency } from "./estackly";

export type CartState = { message?: string; ok?: boolean };

async function withCart<T>(fn: (ref: { id: string; token: string }) => Promise<T>): Promise<T | null> {
  const ref = await cartRef();
  if (!ref) return null;
  try {
    return await fn(ref);
  } catch (e) {
    if (e instanceof EstacklyError && e.status === 404) {
      await saveCartRef(null); // expired or unknown: start again
      return null;
    }
    throw e;
  }
}

function warning(cart: Cart | null): string | undefined {
  return cart?.warnings?.[0]?.message;
}

export async function addToCart(_: CartState, form: FormData): Promise<CartState> {
  const line = {
    product_id: Number(form.get("product_id")),
    variant_id: form.get("variant_id") ? Number(form.get("variant_id")) : undefined,
    quantity: Number(form.get("quantity") || 1),
    message: (form.get("message") as string) || undefined,
  };
  const api = await estackly();
  try {
    let cart = await withCart((ref) => api.carts.addLine(ref, line));
    if (!cart) {
      const created = await api.carts.create([line]);
      await saveCartRef({ id: created.id, token: created.token });
      cart = created;
    }
    revalidatePath("/", "layout");
    return { ok: true, message: warning(cart) ?? "Added to your cart." };
  } catch (e) {
    if (e instanceof EstacklyError) return { message: e.message };
    throw e;
  }
}

export async function updateLine(form: FormData) {
  const api = await estackly();
  await withCart((ref) => api.carts.updateLine(ref, String(form.get("line")), Number(form.get("quantity"))));
  revalidatePath("/cart");
}

export async function applyCoupon(_: CartState, form: FormData): Promise<CartState> {
  const api = await estackly();
  const code = String(form.get("code") || "").trim();
  try {
    if (!code) await withCart((ref) => api.carts.removeCoupon(ref));
    else await withCart((ref) => api.carts.applyCoupon(ref, code));
    revalidatePath("/cart");
    return { ok: true };
  } catch (e) {
    if (e instanceof EstacklyError) return { message: e.message };
    throw e;
  }
}

export async function checkout() {
  const api = await estackly();
  const link = await withCart((ref) => api.carts.checkout(ref));
  if (!link) redirect("/cart");
  // The cart now lives in the store's checkout; start a fresh one here.
  await saveCartRef(null);
  redirect(link.checkout_url);
}

export async function setCurrency(form: FormData) {
  await saveCurrency(String(form.get("currency")));
  revalidatePath("/", "layout");
}
