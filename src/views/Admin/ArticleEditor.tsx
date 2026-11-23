"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, ExternalLink, Send, Trash2 } from "lucide-react";
import { api, type BlogInput } from "../../lib/api";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { ImageEditor } from "../../components/admin/ImageEditor";
import { MediaField } from "../../components/admin/media";
import { Button, Card, Field, Notice, PageHeader, StatusPill, inputClass, labelClass, useToast } from "../../components/admin/ui";

const fresh = (): BlogInput => ({ title: "", slug: "", author: "HP Global Infrra", snippet: "", content: "", image_url: "", published_at: new Date().toISOString().slice(0, 10), is_draft: true });
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const wordCount = (html: string) => html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;

export function AdminArticleEditor({ id }: { id: number | null }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<BlogInput | null>(id === null ? fresh() : null);
  const [saved, setSaved] = useState(() => JSON.stringify(fresh()));
  const [slugEdited, setSlugEdited] = useState(id !== null);
  const [saving, setSaving] = useState<null | "draft" | "publish">(null);
  const [error, setError] = useState<string | null>(null);
  const [imageEditor, setImageEditor] = useState<{ src: string; apply: (url: string) => void } | null>(null);

  useEffect(() => {
    if (id === null) return;
    api.getBlog(id).then((article) => {
      const value: BlogInput = { title: article.title, slug: article.slug, author: article.author, snippet: article.snippet, content: article.content, image_url: article.image_url, published_at: article.published_at, is_draft: article.is_draft };
      setForm(value); setSaved(JSON.stringify(value));
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load the article."));
  }, [id]);

  const dirty = !!form && JSON.stringify(form) !== saved;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!form) return error ? <Notice tone="error">{error}</Notice> : <p className="text-[14px] text-ink-muted">Loading article…</p>;
  const isNew = id === null;
  const wasPublished = !isNew && !JSON.parse(saved).is_draft;

  const update = <K extends keyof BlogInput>(key: K, value: BlogInput[K]) => setForm((current) => current && ({ ...current, [key]: value, ...(key === "title" && !slugEdited ? { slug: slugify(String(value)) } : {}) }));
  async function uploadInto(file: File | undefined, apply: (url: string) => void) {
    if (!file) return;
    try { apply((await api.uploadImage(file)).image_url); } catch (reason) { toast(reason instanceof Error ? reason.message : "Unable to upload image.", "error"); }
  }

  async function save(asDraft: boolean) {
    if (!form) return;
    const value = { ...form, is_draft: asDraft };
    setSaving(asDraft ? "draft" : "publish"); setError(null);
    try {
      const article = id === null ? await api.createBlog(value) : await api.updateBlog(id, value);
      const next: BlogInput = { title: article.title, slug: article.slug, author: article.author, snippet: article.snippet, content: article.content, image_url: article.image_url, published_at: article.published_at, is_draft: article.is_draft };
      setForm(next); setSaved(JSON.stringify(next));
      toast(asDraft ? (wasPublished ? "Article unpublished and saved as a draft." : "Draft saved.") : wasPublished ? "Article updated." : "Article published.");
      if (isNew) router.replace(`/admin/articles/${article.id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save the article."); }
    finally { setSaving(null); }
  }
  async function remove() {
    if (id === null || !form || !window.confirm(`Delete “${form.title}”? This cannot be undone.`)) return;
    try { await api.deleteBlog(id); toast("Article deleted."); router.push("/admin/articles"); }
    catch (reason) { toast(reason instanceof Error ? reason.message : "Unable to delete.", "error"); }
  }

  return (
    <div className="pb-10">
      <PageHeader back={{ href: "/admin/articles", label: "All articles" }} title={isNew ? "Write article" : form.title || "Untitled article"}
        actions={<>
          {wasPublished && <Button variant="outline" to={`/blog/${form.slug}`} target="_blank">View <ExternalLink size={15} aria-hidden /></Button>}
          {!wasPublished && <Button variant="outline" disabled={!!saving} onClick={() => void save(true)}>{saving === "draft" ? "Saving…" : "Save draft"}</Button>}
          <Button disabled={!!saving} onClick={() => void save(false)}><Send size={15} aria-hidden />{saving === "publish" ? "Saving…" : wasPublished ? "Update" : "Publish"}</Button>
        </>} />
      {error && <Notice tone="error" onClose={() => setError(null)}>{error}</Notice>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Card>
            <div className="space-y-5">
              <Field label="Title"><input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Article title" className={`${inputClass} font-heading text-[22px] leading-8`} /></Field>
              <Field label="Summary" help="One or two sentences shown on article cards and in search results."><textarea rows={3} value={form.snippet} onChange={(event) => update("snippet", event.target.value)} className={`${inputClass} resize-y`} /></Field>
              <div>
                <div className="flex items-baseline justify-between"><p className={labelClass}>Article text</p><span className="text-[13px] text-ink-muted">{wordCount(form.content)} words</span></div>
                <RichTextEditor value={form.content} onChange={(value) => update("content", value)} placeholder="Write your article here…" minHeight="min-h-[420px]" />
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Publishing" actions={<StatusPill status={form.is_draft ? "draft" : "published"} />}>
            <div className="space-y-4">
              <Field label="Author"><input value={form.author} onChange={(event) => update("author", event.target.value)} className={inputClass} /></Field>
              <Field label="Date shown on the article"><input type="date" value={form.published_at} onChange={(event) => update("published_at", event.target.value)} className={inputClass} /></Field>
              {wasPublished && <button type="button" disabled={!!saving} onClick={() => void save(true)} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink-muted hover:text-ink"><EyeOff size={15} aria-hidden />Unpublish (move to drafts)</button>}
            </div>
          </Card>
          <Card title="Cover image">
            <MediaField stacked className="" label="Image" src={form.image_url} onChange={(url) => update("image_url", url)} onUpload={uploadInto} onEdit={(src, apply) => setImageEditor({ src, apply })} />
          </Card>
          <Card title="Page address">
            <div className="flex items-center rounded-xl border border-line-strong bg-ivory-50 text-[14px] focus-within:border-navy-900">
              <span className="pl-3 text-ink-muted">/blog/</span>
              <input value={form.slug} onChange={(event) => { setSlugEdited(true); update("slug", slugify(event.target.value)); }} aria-label="Page address" className="min-w-0 flex-1 rounded-r-xl bg-white px-2 py-2.5 outline-none" />
            </div>
            <p className="mt-2 text-[13px] text-ink-muted">{wasPublished ? "Changing it breaks links people have already shared." : "Created from the title. You can change it before publishing."}</p>
          </Card>
          {!isNew && <button type="button" onClick={() => void remove()} className="inline-flex items-center gap-1.5 px-1 text-[14px] font-semibold text-danger hover:underline"><Trash2 size={15} aria-hidden />Delete article</button>}
        </aside>
      </div>
      {imageEditor && <ImageEditor src={imageEditor.src} onClose={() => setImageEditor(null)} onSaved={(url) => imageEditor.apply(url)} />}
    </div>
  );
}
