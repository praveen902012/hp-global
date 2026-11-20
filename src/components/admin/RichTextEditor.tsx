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

  const tool = "flex h-8 min-w-8 items-center justify-center rounded px-1.5 text-slate-600 transition hover:bg-white hover:text-brand-charcoal";

  return (
    <div className="mt-1.5 overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-brand-champagne focus-within:ring-2 focus-within:ring-brand-champagne/20">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-1.5">
        {tools.map((item) => <button key={item.label} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => (item.command === "link" ? addLink() : format(item.command, item.value))} title={item.label} aria-label={item.label} className={tool}>{item.icon}</button>)}
      </div>
      <div ref={editor} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" data-placeholder={placeholder}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className={`${minHeight} px-3 py-3 text-sm leading-relaxed text-slate-900 outline-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] [&_a]:text-blue-700 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-brand-champagne [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:text-lg [&_h2]:font-bold [&_h3]:font-bold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6`} />
    </div>
  );
}
