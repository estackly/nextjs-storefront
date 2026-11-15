import type { Metadata } from "next";
import Link from "next/link";
import { getCart, getCategories, getPages, getStore } from "@/lib/estackly";
import { setCurrency } from "@/lib/actions";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore();
  return {
    title: { default: store.name, template: `%s | ${store.name}` },
    description: store.tagline ?? undefined,
    icons: store.favicon_url ? [{ url: store.favicon_url }] : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [store, cart, categories, pages] = await Promise.all([
    getStore(),
    getCart(),
    getCategories(),
    getPages(),
  ]);
  const currency = cart?.currency ?? store.base_currency;

  return (
    <html lang={store.locale.split("-")[0] || "en"}>
      <body style={{ ["--brand" as string]: store.colors.primary, ["--accent" as string]: store.colors.accent }}>
        <header className="top">
          <div className="wrap top-in">
            <Link href="/" className="logo">
              {store.logo_url ? <img src={store.logo_url} alt={store.name} /> : store.name}
            </Link>
            <nav className="cats" aria-label="Categories">
              <Link href="/products">Shop all</Link>
              {categories.slice(0, 6).map((c) => (
                <Link key={c.id} href={`/products?category=${c.slug}`}>{c.name}</Link>
              ))}
            </nav>
            <div className="tools">
              <form action="/products" role="search">
                <input name="q" type="search" placeholder="Search" aria-label="Search products" />
              </form>
              {store.currencies.length > 1 && (
                <form action={setCurrency}>
                  <select name="currency" defaultValue={currency} aria-label="Currency">
                    {store.currencies.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <button type="submit" className="link">Set</button>
                </form>
              )}
              <Link href="/cart" className="cart-link">Cart ({cart?.item_count ?? 0})</Link>
            </div>
          </div>
        </header>
        {store.test_mode && <p className="test-bar">This store is in test mode. Orders are not charged.</p>}
        <main className="wrap">{children}</main>
        <footer className="foot">
          <div className="wrap foot-in">
            <div>
              <strong>{store.name}</strong>
              {store.contact.email && <p><a href={`mailto:${store.contact.email}`}>{store.contact.email}</a></p>}
              {store.contact.phone && <p>{store.contact.phone}</p>}
            </div>
            <ul>
              {pages.filter((p) => p.in_footer || p.policy_type).map((p) => (
                <li key={p.slug}><Link prefetch={false} href={`/pages/${p.slug}`}>{p.title}</Link></li>
              ))}
            </ul>
          </div>
        </footer>
      </body>
    </html>
  );
}
