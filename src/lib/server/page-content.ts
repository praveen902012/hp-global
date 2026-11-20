import { isValidMenuHref } from "../../data/siteMenu";

const allowedTags = new Set(["p", "br", "div", "h2", "h3", "blockquote", "ul", "ol", "li", "strong", "b", "em", "i", "u", "a"]);

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function decodeAttribute(value: string) {
  return value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

/**
 * Sanitizes rich text from the page editor: keeps basic formatting and links
 * (site paths, http(s), mailto:, tel:) and strips every attribute except a safe href.
 */
export function sanitizePageHtml(value: string) {
  return value
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/<(script|style|iframe|object|embed|form|svg|math|template|noscript|textarea|select)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\/?([a-z0-9-]+)((?:\s[^>]*)?)>/gi, (tag, rawName: string, attributes: string) => {
      const name = rawName.toLowerCase();
      if (!allowedTags.has(name)) return "";
      if (tag.startsWith("</")) return `</${name}>`;
      if (name !== "a") return `<${name}>`;
      const match = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attributes || "");
      const href = decodeAttribute((match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim());
      if (!href || !isValidMenuHref(href)) return "<a>";
      const external = /^https?:/i.test(href);
      return `<a href="${escapeAttribute(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>`;
    })
    // Escape any "<" that is not the start of a tag produced above (e.g. an unterminated tag).
    .replace(/<(?!\/?(?:p|br|div|h2|h3|blockquote|ul|ol|li|strong|b|em|i|u|a)(?:>|\s))/gi, "&lt;")
    .trim();
}
