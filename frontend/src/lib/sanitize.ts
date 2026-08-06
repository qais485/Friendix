import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "a", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "code", "pre", "span", "img", "hr", "table",
  "thead", "tbody", "tr", "th", "td", "div", "sup", "sub", "mark",
];
const ALLOWED_ATTR = [
  "href", "target", "rel", "src", "alt", "className", "title",
  "class", "style", "data-*",
];
const ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto|tel|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z]|$))/iu;

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: ALLOWED_URI_REGEXP as unknown as RegExp,
    ADD_ATTR: ["target"],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  }) as string;
}
