import { Fragment } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getCart } from "@/lib/estackly";
import { checkout, updateLine } from "@/lib/actions";
import { CouponForm } from "@/components/CouponForm";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const cart = await getCart();
  if (!cart || cart.lines.length === 0) {
    return (
      <div className="empty">
        <h1>Your cart is empty</h1>
        <Link className="btn" href="/products">Start shopping</Link>
      </div>
    );
  }
  const t = cart.totals;

  return (
    <div className="cart">
      <div>
        <h1>Cart</h1>
        {cart.warnings?.map((w) => <p key={w.line} className="err">{w.message}</p>)}
        <ul className="lines">
          {cart.lines.map((l) => (
            <li key={l.key}>
              {l.image_url && <img src={l.image_url} alt="" />}
              <div>
                <b>{l.name}</b>
                {l.message && <p className="muted">{l.message_label ?? "Message"}: {l.message}</p>}
                <p className="muted">{l.unit_price.formatted} each</p>
                <form action={updateLine} className="qty-row">
                  <input type="hidden" name="line" value={l.key} />
                  <input type="number" name="quantity" min={0} max={l.max_quantity} defaultValue={l.quantity} aria-label={`Quantity of ${l.name}`} />
                  <button className="link">Update</button>
                </form>
                <form action={updateLine}>
                  <input type="hidden" name="line" value={l.key} />
                  <input type="hidden" name="quantity" value="0" />
                  <button className="link">Remove</button>
                </form>
              </div>
              <b>{l.line_total.formatted}</b>
            </li>
          ))}
        </ul>
      </div>
      <aside className="summary">
        <dl>
          <dt>Subtotal</dt><dd>{t.subtotal.formatted}</dd>
          {t.discount.amount_minor > 0 && <><dt>Discount</dt><dd>−{t.discount.formatted}</dd></>}
          {t.requires_shipping && <><dt>Shipping</dt><dd>{t.shipping_pending ? "At checkout" : t.shipping.formatted}</dd></>}
          {t.tax_lines.map((x) => (
            <Fragment key={x.label}><dt>{x.label}{x.included && " (included)"}</dt><dd>{x.amount.formatted}</dd></Fragment>
          ))}
          <dt className="total">Total</dt><dd className="total">{t.grand_total.formatted}</dd>
        </dl>
        {cart.coupon?.message && <p className={cart.coupon.accepted ? "ok" : "err"}>{cart.coupon.message}</p>}
        <CouponForm code={cart.coupon?.automatic ? null : cart.coupon?.code ?? null} />
        <form action={checkout}>
          <button className="btn wide">Checkout</button>
        </form>
        <p className="muted small">Payment and delivery details are taken on the store&apos;s secure checkout.</p>
      </aside>
    </div>
  );
}
