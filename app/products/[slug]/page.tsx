import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EstacklyError } from "@estackly/storefront";
import { estackly } from "@/lib/estackly";
import { AddToCart } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";

type Params = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const api = await estackly();
  try {
    return /^\d+$/.test(slug) ? await api.products.get(Number(slug)) : await api.products.bySlug(slug);
  } catch (e) {
    if (e instanceof EstacklyError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await load((await params).slug);
  return { title: p.meta_title ?? p.name, description: p.meta_description ?? p.summary ?? undefined };
}

export default async function ProductPage({ params }: Params) {
  const p = await load((await params).slug);
  const api = await estackly();
  const [related, reviews] = await Promise.all([api.products.related(p.id, 4), api.products.reviews(p.id, { limit: 5 })]);

  return (
    <>
      <div className="pdp">
        <div className="gallery">
          {(p.images.length ? p.images : p.image_url ? [{ url: p.image_url, thumb_url: p.image_url, options: {} }] : []).map((img, i) => (
            <img key={img.url} src={img.url} alt={i === 0 ? p.name : ""} loading={i === 0 ? "eager" : "lazy"} />
          ))}
        </div>
        <div className="info">
          {p.brand && <p className="muted">{p.brand.name}</p>}
          <h1>{p.name}</h1>
          {p.rating && <p className="muted">★ {p.rating.average.toFixed(1)} ({p.rating.count})</p>}
          <AddToCart product={p} />
          {p.description_html && <div className="desc" dangerouslySetInnerHTML={{ __html: p.description_html }} />}
        </div>
      </div>
      {reviews.data.length > 0 && (
        <section>
          <h2 className="section-title">Reviews</h2>
          {reviews.data.map((r) => (
            <article key={r.id} className="review">
              <p>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)} {r.title && <b>{r.title}</b>}</p>
              {r.body && <p>{r.body}</p>}
              <p className="muted">{r.author ?? "Shopper"}{r.verified_purchase && " · Verified purchase"}</p>
            </article>
          ))}
        </section>
      )}
      {related.length > 0 && (
        <section>
          <h2 className="section-title">You may also like</h2>
          <ul className="grid">{related.map((r) => <ProductCard key={r.id} p={r} />)}</ul>
        </section>
      )}
    </>
  );
}
