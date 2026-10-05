"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { isUnsplash } from "@/lib/images";

/** Unsplash's imgix CDN resizes and converts to AVIF/WebP itself, so we hand it the work. */
const unsplashLoader: ImageLoader = ({ src, width, quality }) => {
  const u = new URL(src);
  u.searchParams.set("w", String(width));
  u.searchParams.set("q", String(quality ?? 70));
  u.searchParams.set("auto", "format");
  u.searchParams.set("fit", "crop");
  return u.toString();
};

type Props = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  /** Art-directed fallback when no photo exists or it fails to load. */
  fallbackLabel?: string;
  tone?: "dark" | "brand" | "light";
};

/**
 * Every photo on the site goes through here: consistent grading, responsive sizes,
 * lazy loading, and a designed fallback (lane lines + label) instead of a broken image.
 */
export function Photo({ src, alt, className, fallbackLabel, tone = "light", fill = true, sizes = "100vw", ...props }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <PhotoFallback label={fallbackLabel} tone={tone} className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      loader={isUnsplash(src) ? unsplashLoader : undefined}
      onError={() => setFailed(true)}
      className={cn("object-cover photo-grade", className)}
      {...props}
    />
  );
}

export function PhotoFallback({ label, tone = "light", className }: { label?: string; tone?: "dark" | "brand" | "light"; className?: string }) {
  const bg = tone === "brand" ? "bg-brand-800" : tone === "light" ? "bg-pearl" : "bg-ink-900";
  const stroke = tone === "light" ? "stroke-ink-950/10" : "stroke-white/10";
  return (
    <div className={cn("absolute inset-0 overflow-hidden", bg, className)} aria-hidden>
      <svg className={cn("absolute -bottom-1/3 -end-1/4 h-[160%] w-auto", stroke)} viewBox="0 0 400 400" fill="none">
        {Array.from({ length: 9 }).map((_, i) => (
          <circle key={i} cx="400" cy="400" r={120 + i * 32} strokeWidth="1.5" />
        ))}
      </svg>
      {label && (
        <span
          className={cn(
            "absolute bottom-4 start-4 text-3xl font-extrabold leading-none",
            tone === "light" ? "text-ink-950/15" : "text-white/15",
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}
