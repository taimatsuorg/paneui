// No edge: a pale image melts into the surface behind it.
export function Cover({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="aspect-video w-full rounded-lg object-cover" />
}
