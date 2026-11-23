import type { BlogEntry } from "../../data/blogData";
import { Eyebrow } from "../../components/site/ui";
import { JournalBrowser } from "../../components/blog/JournalBrowser";
import { CtaBand } from "../../components/site/CtaBand";

export function BlogIndex({ blogs }: { blogs: BlogEntry[] }) {
  return (
    <>
      <section className="bg-ivory-100">
        <div className="container-page flex flex-col gap-6 py-12 md:py-[72px]">
          <Eyebrow>The Journal</Eyebrow>
          <h1 className="t-display max-w-[900px] text-ink">Insights for <span className="accent">smarter</span> property decisions</h1>
          <p className="t-body-xl max-w-[600px] text-ink-muted">Market updates, buying guides and investment ideas from the HP Global Infrra team.</p>
        </div>
      </section>
      <section className="bg-white pb-16 pt-8 md:pb-[88px] md:pt-12 lg:pb-[112px]">
        <div className="container-page"><JournalBrowser blogs={blogs} /></div>
      </section>
      <CtaBand title="Have a question about a market?" accent="question" text="Our advisors are happy to talk through any location or project — no obligation." />
    </>
  );
}
