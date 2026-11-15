import Link from "next/link";
import { estackly, getStore } from "@/lib/estackly";
import { ProductCard } from "@/components/ProductCard";

export default async function Home() {
  const api = await estackly();
  const [store, banners, featured, newest] = await Promise.all([
    getStore(),
    api.banners("home_top"),
    api.products.list({ featured: true, limit: 8 }),
    api.products.list({ sort: "newest", limit: 8 }),
  ]);
  const hero = banners[0];
  const picks = featured.data.length ? featured.data : newest.data;

  return (
    <>
      <section className="hero" style={hero?.image_url ? { backgroundImage: `url(${hero.image_url})` } : undefined}>
        <div>
          <h1>{hero?.title ?? store.name}</h1>
          {(hero?.subtitle ?? store.tagline) && <p>{hero?.subtitle ?? store.tagline}</p>}
          <Link className="btn" href={hero?.link_url ?? "/products"}>{hero?.link_label ?? "Shop now"}</Link>
        </div>
      </section>
      <h2 className="section-title">{featured.data.length ? "Featured" : "New in"}</h2>
      <ul className="grid">{picks.map((p) => <ProductCard key={p.id} p={p} />)}</ul>
      <p className="more"><Link href="/products">See all {featured.page.total || newest.page.total} products</Link></p>
    </>
  );
}
