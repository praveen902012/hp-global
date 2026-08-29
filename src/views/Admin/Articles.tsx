"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Bold, ExternalLink, FilePlus2, FileText, Italic, List, ListOrdered, Pencil, RefreshCw, Trash2, Underline } from "lucide-react";
import Link from "next/link";
import { api, type BlogInput, type ManagedBlog } from "../../lib/api";
import { Button } from "../../components/ui/Button";

const initialForm: BlogInput = {
  title: "",
  slug: "",
  author: "HP Global Infrra",
  snippet: "",
  content: "",
  image_url: "",
  published_at: new Date().toISOString().slice(0, 10),
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value;
  }, [value]);

  function format(command: string, value?: string) {
    editor.current?.focus();
    document.execCommand(command, false, value);
    onChange(editor.current?.innerHTML ?? "");
  }

  const toolClass = "flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100 hover:text-brand-charcoal";

  return (
    <div className="mt-2 overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-brand-champagne focus-within:ring-2 focus-within:ring-brand-champagne/20">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
        <button type="button" onClick={() => format("bold")} title="Bold" aria-label="Bold" className={toolClass}><Bold size={16} /></button>
        <button type="button" onClick={() => format("italic")} title="Italic" aria-label="Italic" className={toolClass}><Italic size={16} /></button>
        <button type="button" onClick={() => format("underline")} title="Underline" aria-label="Underline" className={toolClass}><Underline size={16} /></button>
        <button type="button" onClick={() => format("formatBlock", "h2")} title="Heading" aria-label="Heading" className={`${toolClass} text-xs font-bold`}>H2</button>
        <button type="button" onClick={() => format("insertUnorderedList")} title="Bullet list" aria-label="Bullet list" className={toolClass}><List size={16} /></button>
        <button type="button" onClick={() => format("insertOrderedList")} title="Numbered list" aria-label="Numbered list" className={toolClass}><ListOrdered size={16} /></button>
      </div>
      <div
        ref={editor}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="min-h-72 px-3 py-3 text-sm leading-relaxed text-slate-900 outline-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]"
        data-placeholder="Write your article here..."
      />
    </div>
  );
}

export function AdminArticles() {
  const [articles, setArticles] = useState<ManagedBlog[]>([]);
  const [form, setForm] = useState<BlogInput>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setArticles(await api.listBlogs());
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load articles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  function updateField<K extends keyof BlogInput>(key: K, value: BlogInput[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "title" && !slugEdited ? { slug: slugify(String(value)) } : {}),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const article = editingId === null
        ? await api.createBlog(form)
        : await api.updateBlog(editingId, form);
      setArticles((current) => editingId === null
        ? [article, ...current]
        : current.map((item) => item.id === article.id ? article : item));
      setForm({ ...initialForm, published_at: new Date().toISOString().slice(0, 10) });
      setEditingId(null);
      setSlugEdited(false);
      setSuccess(editingId === null ? "Article published successfully." : "Article updated successfully.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to publish article.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(article: ManagedBlog) {
    if (!window.confirm(`Delete “${article.title}”? This cannot be undone.`)) return;
    setError(null);
    try {
      await api.deleteBlog(article.id);
      setArticles((current) => current.filter((item) => item.id !== article.id));
      if (editingId === article.id) {
        setEditingId(null);
        setForm({ ...initialForm, published_at: new Date().toISOString().slice(0, 10) });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to delete article.");
    }
  }

  function editArticle(article: ManagedBlog) {
    setEditingId(article.id);
    setForm({
      title: article.title,
      slug: article.slug,
      author: article.author,
      snippet: article.snippet,
      content: article.content,
      image_url: article.image_url,
      published_at: article.published_at,
    });
    setSlugEdited(true);
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNewArticle() {
    setEditingId(null);
    setForm({ ...initialForm, published_at: new Date().toISOString().slice(0, 10) });
    setSlugEdited(false);
    setError(null);
    setSuccess(null);
  }

  const inputClass = "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-champagne focus:ring-2 focus:ring-brand-champagne/20";

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center gap-3">
        <FileText size={28} className="text-brand-champagne" />
        <div>
          <h1 className="text-3xl font-heading text-brand-charcoal">Blog Articles</h1>
          <p className="mt-1 text-gray-500">Create and manage articles published in the Journal.</p>
        </div>
      </div>

      {(error || success) && (
        <div role="status" className={`mb-6 border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {error || success}
        </div>
      )}

      <section className="mb-10 border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
          <FilePlus2 size={20} className="text-brand-champagne" />
          <div>
            <h2 className="text-lg font-heading text-brand-charcoal">{editingId === null ? "New Article" : "Edit Article"}</h2>
            {editingId !== null && <p className="mt-1 text-sm text-slate-500">Update the article and save your changes.</p>}
          </div>
          {editingId !== null && <button type="button" onClick={startNewArticle} className="ml-auto text-sm font-medium text-brand-champagne hover:text-brand-charcoal">Create new article</button>}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">Title
            <input value={form.title} onChange={(event) => updateField("title", event.target.value)} required className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-medium text-slate-700">URL Slug
            <input value={form.slug} onChange={(event) => { setSlugEdited(true); updateField("slug", slugify(event.target.value)); }} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-medium text-slate-700">Author
            <input value={form.author} onChange={(event) => updateField("author", event.target.value)} required className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-medium text-slate-700">Publish Date
            <input type="date" value={form.published_at} onChange={(event) => updateField("published_at", event.target.value)} required className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">Cover Image URL
            <input type="url" value={form.image_url} onChange={(event) => updateField("image_url", event.target.value)} required className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">Excerpt
            <textarea value={form.snippet} onChange={(event) => updateField("snippet", event.target.value)} required rows={3} className={`${inputClass} mt-2 resize-y`} />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">Article Body
            <RichTextEditor value={form.content} onChange={(value) => updateField("content", value)} />
          </label>
          <div className="md:col-span-2">
            <Button type="submit" variant="primary" disabled={saving || !form.slug}>
              {saving ? (editingId === null ? "Publishing..." : "Saving...") : (editingId === null ? "Publish Article" : "Save Changes")}
            </Button>
          </div>
        </form>
      </section>

      <section className="border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-heading text-brand-charcoal">Published Articles</h2>
          <button type="button" onClick={() => void loadArticles()} title="Refresh articles" aria-label="Refresh articles" className="flex h-9 w-9 items-center justify-center text-slate-500 hover:text-brand-charcoal">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading articles...</p>
        ) : articles.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No published articles yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-brand-light-grey">
                <tr><th className="p-4">Article</th><th className="p-4">Author</th><th className="p-4">Date</th><th className="w-36 p-4 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-slate-100 last:border-0">
                    <td className="p-4"><p className="font-medium text-brand-charcoal">{article.title}</p><p className="mt-1 text-xs text-slate-400">/{article.slug}</p></td>
                    <td className="p-4 text-slate-600">{article.author}</td>
                    <td className="p-4 whitespace-nowrap text-slate-600">{new Date(`${article.published_at}T00:00:00`).toLocaleDateString()}</td>
                    <td className="p-4"><div className="flex justify-end gap-1">
                      <button type="button" onClick={() => editArticle(article)} title="Edit article" aria-label="Edit article" className="flex h-9 w-9 items-center justify-center text-slate-500 hover:text-brand-champagne"><Pencil size={17} /></button>
                      <Link href={`/blog/${article.slug}`} target="_blank" title="View article" aria-label="View article" className="flex h-9 w-9 items-center justify-center text-slate-500 hover:text-brand-champagne"><ExternalLink size={17} /></Link>
                      <button type="button" onClick={() => void handleDelete(article)} title="Delete article" aria-label="Delete article" className="flex h-9 w-9 items-center justify-center text-slate-500 hover:text-red-600"><Trash2 size={17} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
