"use client";

import { useActionState } from "react";
import { applyCoupon, type CartState } from "@/lib/actions";

export function CouponForm({ code }: { code: string | null }) {
  const [state, action, pending] = useActionState<CartState, FormData>(applyCoupon, {});
  return (
    <form action={action} className="coupon">
      <input name="code" defaultValue={code ?? ""} placeholder="Discount code" aria-label="Discount code" />
      <button className="btn-ghost" disabled={pending}>{code ? "Update" : "Apply"}</button>
      {state.message && <p className="err" role="status">{state.message}</p>}
    </form>
  );
}
