import Link from "next/link";
import type { Metadata } from "next";
import type { ProductSort } from "@estackly/storefront";
import { estackly } from "@/lib/estackly";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = { title: "Shop" };

const sorts: [ProductSort, string][] = [
  ["featured", "Featured"],
  ["newest", "Newest"],
  ["price_asc", "Price: low to high"],
  ["price_desc", "Price: high to low"],
  ["rating", "Top rated"],
];

type Search = { category?: string; q?: string; sort?: ProductSort; cursor?: string };

export default async function Products({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const api = await estackly();
  const [list, category] = await Promise.all([
    api.products.list({ category: sp.category, q: sp.q, sort: sp.sort, cursor: sp.cursor, limit: 24 }),
    sp.category ? api.categories.get(sp.category).catch(() => null) : null,
  ]);
  const next = new URLSearchParams({ ...sp, cursor: list.page.next_cursor ?? "" } as Record<string, string>);

  return (
    <>
      <div className="list-head">
        <h1>{sp.q ? `Results for “${sp.q}”` : category?.name ?? "All products"}</h1>
        <form className="sort">
          {sp.category && <input type="hidden" name="category" value={sp.category} />}
          {sp.q && <input type="hidden" name="q" value={sp.q} />}
          <select name="sort" defaultValue={sp.sort ?? "featured"} aria-label="Sort">
            {sorts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button type="submit" className="link">Sort</button>
        </form>
      </div>
      {category && category.children.length > 0 && (
        <nav className="chips" aria-label="Sub-categories">
          {category.children.map((c) => <Link key={c.id} href={`/products?category=${c.slug}`}>{c.name}</Link>)}
        </nav>
      )}
      <p className="muted">{list.page.total} products</p>
      {list.data.length ? (
        <ul className="grid">{list.data.map((p) => <ProductCard key={p.id} p={p} />)}</ul>
      ) : (
        <p>Nothing matches yet. <Link href="/products">See everything</Link>.</p>
      )}
      {list.page.has_more && <p className="more"><Link href={`/products?${next}`}>Next page</Link></p>}
    </>
  );
}
