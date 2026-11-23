/** Accessible accordion built on <details>; the first item can start open. */
export function Faq({ items, dark = false, openFirst = true }: { items: { question: string; answer: string }[]; dark?: boolean; openFirst?: boolean }) {
  return (
    <div className={`divide-y border-y ${dark ? "divide-navy-700 border-navy-700" : "divide-line border-line"}`}>
      {items.map((item, index) => (
        <details key={`${item.question}-${index}`} open={openFirst && index === 0} className="group py-5">
          <summary className={`flex cursor-pointer list-none items-center justify-between gap-6 t-h6 [&::-webkit-details-marker]:hidden ${dark ? "text-white" : "text-ink"}`}>
            {item.question}
            <span aria-hidden className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[18px] leading-none transition-colors ${dark ? "bg-navy-800 text-white group-open:bg-gold-400 group-open:text-navy-900" : "bg-ivory-100 text-ink group-open:bg-gold-200"}`}><span className="group-open:hidden">+</span><span className="hidden group-open:inline">−</span></span>
          </summary>
          <p className={`mt-3 whitespace-pre-line t-body ${dark ? "text-slate-300" : "text-ink-muted"}`}>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
