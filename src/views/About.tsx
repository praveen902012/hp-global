import { Eyebrow } from "../components/site/ui";
import { CtaBand } from "../components/site/CtaBand";

/** Built-in Our Story page, shown until the page is set up in Admin → Pages. */
export function About() {
  return (
    <>
      <section className="bg-white section-y">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-6">
            <Eyebrow>Our origin</Eyebrow>
            <h1 className="t-h1 text-ink">A commitment to <span className="accent">excellence</span></h1>
            <div className="flex flex-col gap-5 t-body-l text-ink-muted">
              <p>At HP Global Infrra, we are committed to excellence in every facet of real estate. Our services range from investment advisory to property management, focusing on high-end projects that make a difference.</p>
              <p>Our specialised approach includes mixed-use developments, smart solutions and residential excellence, all backed by profound market insights.</p>
              <p className="t-h6 text-ink">Join us in shaping a new era of real estate advancement.</p>
            </div>
          </div>
          <img src="/hero_banner_real_estate_1774769760013.png" alt="HP Global Infrra building" className="h-72 w-full rounded-3xl object-cover md:h-[520px]" />
        </div>
      </section>
      <CtaBand title="Let’s build your portfolio together" accent="together" text="Meet an advisor at our Noida office, or speak over a call or WhatsApp." />
    </>
  );
}
