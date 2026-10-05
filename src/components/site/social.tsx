import { cn } from "@/lib/utils";
import { organisation } from "@/db/seed-data/real";

// Lucide v1 dropped brand marks, so these are minimal inline glyphs.
const icons = {
  instagram: (
    <path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.9-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM12 4.6c2.4 0 2.7 0 3.6.1 2.4.1 3.6 1.2 3.7 3.7.1.9.1 1.2.1 3.6s0 2.7-.1 3.6c-.1 2.4-1.3 3.6-3.7 3.7-.9.1-1.2.1-3.6.1s-2.7 0-3.6-.1c-2.5-.1-3.6-1.3-3.7-3.7-.1-.9-.1-1.2-.1-3.6s0-2.7.1-3.6C4.8 6 5.9 4.8 8.4 4.7c.9-.1 1.2-.1 3.6-.1ZM12 3c-2.4 0-2.7 0-3.7.1C5 3.2 3.2 5 3.1 8.3 3 9.3 3 9.6 3 12s0 2.7.1 3.7C3.2 19 5 20.8 8.3 20.9c1 .1 1.3.1 3.7.1s2.7 0 3.7-.1c3.3-.1 5.1-1.9 5.2-5.2.1-1 .1-1.3.1-3.7s0-2.7-.1-3.7C20.8 5 19 3.2 15.7 3.1 14.7 3 14.4 3 12 3Z" />
  ),
  facebook: <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.2-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" />,
  x: <path d="M17.6 3.5h2.9l-6.3 7.2 7.4 9.8h-5.8l-4.5-5.9-5.2 5.9H3.2l6.7-7.7L2.8 3.5h5.9l4.1 5.4 4.8-5.4Zm-1 15.3h1.6L7.5 5.1H5.8l10.8 13.7Z" />,
  tiktok: <path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z" />,
};

const labels = { instagram: "Instagram", facebook: "Facebook", x: "X (Twitter)", tiktok: "TikTok" } as const;

export function SocialLinks({ className, tone = "default" }: { className?: string; tone?: "inverse" | "default" }) {
  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {(Object.keys(icons) as (keyof typeof icons)[]).map((k) => (
        <li key={k}>
          <a
            href={organisation.social[k]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`BAA on ${labels[k]}`}
            className={cn(
              "flex size-11 items-center justify-center rounded-xs transition-colors",
              tone === "inverse" ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-ink-600 hover:bg-pearl hover:text-brand-600",
            )}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
              {icons[k]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
