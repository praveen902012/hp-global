"use client";

import { useMemo, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { api } from "../../lib/api";

const presets = [{ label: "Wide", value: 16 / 9 }, { label: "Landscape", value: 4 / 3 }, { label: "Square", value: 1 }, { label: "Portrait", value: 3 / 4 }];

export function ImageEditor({ src, onClose, onSaved }: { src: string; onClose: () => void; onSaved: (url: string) => void }) {
  const [ratio, setRatio] = useState(16 / 9);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewStyle = useMemo(() => ({ transform: `scale(${zoom}) rotate(${rotation}deg) scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})` }), [zoom, rotation, flipX, flipY]);
  async function exportImage() {
    setSaving(true); setError(null);
    try {
      const image = new Image(); image.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("This image cannot be edited because its host does not allow browser image access. Upload it first, then edit the uploaded image.")); image.src = src; });
      const maxWidth = 1600; const width = Math.min(maxWidth, image.naturalWidth); const height = Math.round(width / ratio);
      const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
      const context = canvas.getContext("2d"); if (!context) throw new Error("Unable to prepare the image editor.");
      const sourceRatio = image.naturalWidth / image.naturalHeight; let sourceWidth = image.naturalWidth; let sourceHeight = image.naturalHeight;
      if (sourceRatio > ratio) sourceWidth = image.naturalHeight * ratio; else sourceHeight = image.naturalWidth / ratio;
      sourceWidth /= zoom; sourceHeight /= zoom;
      context.translate(width / 2, height / 2); context.rotate((rotation * Math.PI) / 180); context.scale(flipX ? -1 : 1, flipY ? -1 : 1);
      context.drawImage(image, (image.naturalWidth - sourceWidth) / 2, (image.naturalHeight - sourceHeight) / 2, sourceWidth, sourceHeight, -width / 2, -height / 2, width, height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.88));
      if (!blob) throw new Error("Unable to export the edited image.");
      const file = new File([blob], "featured-project.webp", { type: "image/webp" });
      onSaved((await api.uploadImage(file)).image_url); onClose();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to edit image."); }
    finally { setSaving(false); }
  }
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-charcoal/75 p-4" role="dialog" aria-modal="true" aria-label="Image editor"><div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-brand-champagne">Image editor</p><h2 className="text-2xl font-heading text-brand-charcoal">Crop and optimize</h2></div><button type="button" onClick={onClose} className="rounded p-2 text-slate-500 hover:bg-slate-100"><X size={20}/></button></div><div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl bg-slate-950" style={{ aspectRatio: String(ratio) }}><img src={src} alt="Editing preview" className="max-h-full max-w-full object-cover transition-transform duration-150" style={previewStyle}/></div><div className="space-y-5"><div><p className="mb-2 text-sm font-medium text-slate-700">Crop preset</p><div className="grid grid-cols-2 gap-2">{presets.map((preset) => <button key={preset.label} type="button" onClick={() => setRatio(preset.value)} className={`rounded border px-3 py-2 text-sm ${ratio === preset.value ? "border-brand-champagne bg-brand-champagne/10 text-brand-charcoal" : "border-slate-200 text-slate-600"}`}>{preset.label}</button>)}</div></div><label className="block text-sm font-medium text-slate-700">Zoom<input type="range" min="1" max="2.5" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="mt-2 w-full"/></label><label className="block text-sm font-medium text-slate-700">Rotate<input type="range" min="-180" max="180" step="1" value={rotation} onChange={(event) => setRotation(Number(event.target.value))} className="mt-2 w-full"/></label><div className="flex gap-2"><button type="button" onClick={() => setFlipX((value) => !value)} className={`rounded border px-3 py-2 text-sm ${flipX ? "border-brand-champagne bg-brand-champagne/10" : "border-slate-200"}`}>Flip horizontal</button><button type="button" onClick={() => setFlipY((value) => !value)} className={`rounded border px-3 py-2 text-sm ${flipY ? "border-brand-champagne bg-brand-champagne/10" : "border-slate-200"}`}>Flip vertical</button></div><button type="button" onClick={() => { setZoom(1); setRotation(0); setFlipX(false); setFlipY(false); }} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-charcoal"><RotateCcw size={15}/> Reset</button>{error && <p className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}<button type="button" onClick={() => void exportImage()} disabled={saving} className="flex w-full items-center justify-center gap-2 bg-brand-charcoal px-4 py-3 text-sm font-bold text-brand-champagne disabled:opacity-60"><Check size={16}/>{saving ? "Exporting…" : "Export optimized image"}</button></div></div></div></div>;
}
