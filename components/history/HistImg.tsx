import { PHOTOS } from "@/lib/history";

type Photo = (typeof PHOTOS)[keyof typeof PHOTOS];

/** One of Matt's cut-out photos: a pre-sized WebP pair (public/history), no optimiser needed. */
export function HistImg({ photo, sizes, className, eager }: { photo: Photo; sizes: string; className?: string; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static WebP pair with explicit size
    <img
      src={`${photo.src}-${photo.w}.webp`}
      srcSet={`${photo.src}-800.webp 800w, ${photo.src}-${photo.w}.webp ${photo.w}w`}
      sizes={sizes}
      width={photo.w}
      height={photo.h}
      alt={photo.alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={className}
    />
  );
}
