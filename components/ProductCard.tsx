import Link from "next/link";
import type { Product } from "@estackly/storefront";

export function ProductCard({ p }: { p: Product }) {
  return (
    <li className="card">
      <Link href={`/products/${p.slug ?? p.id}`}>
        <div className="card-img">
          {p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy" /> : <span>{p.name}</span>}
        </div>
        <h3>{p.name}</h3>
        <p className="price">
          {p.in_stock ? p.price.formatted : "Sold out"}
          {p.in_stock && p.compare_at_price && <s>{p.compare_at_price.formatted}</s>}
        </p>
      </Link>
    </li>
  );
}
