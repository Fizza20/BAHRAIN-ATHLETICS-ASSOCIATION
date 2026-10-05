/** Unsplash CDN resizing for admin thumbnails; other URLs are returned unchanged. */
export function thumb(url: string, w = 400) {
  if (url.startsWith("https://images.unsplash.com/")) return `${url}${url.includes("?") ? "&" : "?"}w=${w}&q=60&auto=format&fit=crop`;
  return url;
}
