"use client";

import { useActionState, useMemo, useState } from "react";
import type { ProductDetail } from "@estackly/storefront";
import { addToCart, type CartState } from "@/lib/actions";

export function AddToCart({ product }: { product: ProductDetail }) {
  const [state, action, pending] = useActionState<CartState, FormData>(addToCart, {});
  const optionNames = useMemo(
    () => [...new Set(product.variants.flatMap((v) => Object.keys(v.options)))],
    [product.variants],
  );
  const [chosen, setChosen] = useState<Record<string, string>>(() => {
    const first = product.variants.find((v) => v.in_stock) ?? product.variants[0];
    return first ? { ...first.options } : {};
  });
  const variant = product.variants.find((v) => optionNames.every((n) => v.options[n] === chosen[n]));
  const price = variant?.price ?? product.price;
  const compare = variant ? variant.compare_at_price : product.compare_at_price;
  const inStock = variant ? variant.in_stock : product.in_stock;

  return (
    <form action={action} className="buy">
      <p className="price big">
        {price.formatted}
        {compare && <s>{compare.formatted}</s>}
      </p>
      <input type="hidden" name="product_id" value={product.id} />
      {variant && <input type="hidden" name="variant_id" value={variant.id} />}
      {optionNames.map((name) => {
        const values = [...new Set(product.variants.map((v) => v.options[name]).filter(Boolean))];
        return (
          <fieldset key={name} className="opts">
            <legend>{name}</legend>
            {values.map((val) => (
              <label key={val} className={chosen[name] === val ? "on" : ""}>
                <input type="radio" name={`opt-${name}`} value={val} checked={chosen[name] === val}
                  onChange={() => setChosen({ ...chosen, [name]: val })} />
                {val}
              </label>
            ))}
          </fieldset>
        );
      })}
      <label className="qty">
        Quantity
        <input type="number" name="quantity" min={product.min_order_quantity || 1} max={product.max_order_quantity ?? 99}
          defaultValue={product.min_order_quantity || 1} />
      </label>
      <button className="btn" disabled={pending || !inStock || (optionNames.length > 0 && !variant)}>
        {!inStock ? "Sold out" : pending ? "Adding…" : "Add to cart"}
      </button>
      {state.message && <p className={state.ok ? "ok" : "err"} role="status">{state.message}</p>}
    </form>
  );
}
