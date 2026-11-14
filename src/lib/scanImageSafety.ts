const rasterType = /^image\/(?:png|jpeg|gif|webp|avif)$/i;
const localRasterPath = /^(?:\/(?!\/)|\.\/)?[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\/?[a-zA-Z0-9_.-]*\.(?:png|jpe?g|gif|webp|avif)$/i;

/** Reject remote and active image formats before they reach an image element. */
export async function safeScanImageUrl(
  value: unknown,
  origin: string,
  fetchBlob: typeof fetch = fetch,
): Promise<string | null> {
  if (typeof value !== "string") return null;

  if (/^data:image\/(?:png|jpeg|gif|webp|avif);base64,(?:[a-z0-9+/]{4})*(?:[a-z0-9+/]{2}==|[a-z0-9+/]{3}=)?$/i.test(value)) {
    return value;
  }

  if (localRasterPath.test(value) && !value.split("/").some(part => part === "." || part === "..")) {
    try {
      const response = await fetchBlob(value, { redirect: "error", mode: "same-origin" });
      if (!response.ok) return null;
      const blob = await response.blob();
      return rasterType.test(blob.type) ? URL.createObjectURL(blob) : null;
    } catch {
      return null;
    }
  }

  const prefix = `blob:${origin}/`;
  if (!value.startsWith(prefix) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.slice(prefix.length))) {
    return null;
  }

  try {
    const response = await fetchBlob(value);
    if (!response.ok) return null;
    const blob = await response.blob();
    return rasterType.test(blob.type) ? value : null;
  } catch {
    return null;
  }
}
