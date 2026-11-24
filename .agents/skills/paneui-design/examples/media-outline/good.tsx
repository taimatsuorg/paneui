// A neutral inset hairline keeps a light photo's edge on a white card.
export function Cover({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="aspect-video w-full rounded-lg object-cover media-outline" />
}
