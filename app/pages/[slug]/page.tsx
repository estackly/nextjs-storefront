import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EstacklyError } from "@estackly/storefront";
import { estackly } from "@/lib/estackly";

type Params = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  try {
    return await (await estackly()).pages.get(slug);
  } catch (e) {
    if (e instanceof EstacklyError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: (await load((await params).slug)).title };
}

export default async function StorePage({ params }: Params) {
  const page = await load((await params).slug);
  return (
    <article className="prose">
      <h1>{page.title}</h1>
      {page.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    </article>
  );
}
