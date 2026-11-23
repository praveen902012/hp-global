"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, Link2, List, ListOrdered, Quote, Underline, Unlink } from "lucide-react";

const tools: { label: string; command: string; value?: string; icon: React.ReactNode }[] = [
  { label: "Bold", command: "bold", icon: <Bold size={15} /> },
  { label: "Italic", command: "italic", icon: <Italic size={15} /> },
  { label: "Underline", command: "underline", icon: <Underline size={15} /> },
  { label: "Heading", command: "formatBlock", value: "h2", icon: <span className="text-xs font-bold">H2</span> },
  { label: "Subheading", command: "formatBlock", value: "h3", icon: <span className="text-xs font-bold">H3</span> },
  { label: "Paragraph", command: "formatBlock", value: "p", icon: <span className="text-xs font-bold">¶</span> },
  { label: "Bullet list", command: "insertUnorderedList", icon: <List size={15} /> },
  { label: "Numbered list", command: "insertOrderedList", icon: <ListOrdered size={15} /> },
  { label: "Quote", command: "formatBlock", value: "blockquote", icon: <Quote size={15} /> },
  { label: "Add link", command: "link", icon: <Link2 size={15} /> },
  { label: "Remove link", command: "unlink", icon: <Unlink size={15} /> },
];

/** Small WYSIWYG editor (bold, italic, underline, headings, lists, quote, links). Output is sanitized on the server. */
export function RichTextEditor({ value, onChange, placeholder = "Write here…", minHeight = "min-h-40" }: { value: string; onChange: (value: string) => void; placeholder?: string; minHeight?: string }) {
  const editor = useRef<HTMLDivElement>(null);
  useEffect(() => { if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value; }, [value]);

  function format(command: string, formatValue?: string) {
    editor.current?.focus();
    document.execCommand(command, false, formatValue);
    onChange(editor.current?.innerHTML ?? "");
  }
  function addLink() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) { window.alert("Select the text you want to turn into a link first."); return; }
    const href = window.prompt("Link to (e.g. /contact, https://example.com, mailto:info@example.com):", "/");
    if (href && href.trim()) format("createLink", href.trim());
  }

  const tool = "flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 text-ink-muted transition hover:bg-white hover:text-ink";

  return (
    <div className="mt-1.5 overflow-hidden rounded-xl border border-line-strong bg-white focus-within:border-navy-900 focus-within:ring-4 focus-within:ring-gold-200/70">
      <div className="sticky top-0 z-10 flex flex-wrap gap-1 border-b border-line bg-ivory-50 p-1.5">
        {tools.map((item) => <button key={item.label} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => (item.command === "link" ? addLink() : format(item.command, item.value))} title={item.label} aria-label={item.label} className={tool}>{item.icon}</button>)}
      </div>
      <div ref={editor} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" data-placeholder={placeholder}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className={`${minHeight} px-4 py-3 text-[15px] leading-[26px] text-ink outline-none empty:before:text-ink-subtle empty:before:content-[attr(data-placeholder)] [&_p]:mb-3 [&_a]:text-gold-700 [&_a]:underline [&_blockquote]:border-l-[3px] [&_blockquote]:border-gold-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:font-heading [&_h2]:text-[22px] [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:font-heading [&_h3]:text-[19px] [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6`} />
    </div>
  );
}
