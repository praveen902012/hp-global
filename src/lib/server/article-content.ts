const allowedTags = new Set(["p", "br", "div", "h2", "h3", "blockquote", "ul", "ol", "li", "strong", "b", "em", "i", "u"]);

/** Keeps the formatting produced by the admin editor while removing executable markup. */
export function sanitizeArticleHtml(value: string) {
  return value
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/<(script|style|iframe|object|embed|form|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\/?([a-z0-9-]+)(?:\s[^>]*)?>/gi, (tag, name: string) => {
      if (!allowedTags.has(name.toLowerCase())) return "";
      return tag.startsWith("</") ? `</${name.toLowerCase()}>` : `<${name.toLowerCase()}>`;
    })
    .trim();
}
