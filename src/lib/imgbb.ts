const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSize = 2 * 1024 * 1024;

export async function uploadImage(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) throw new Error("Set NEXT_PUBLIC_IMGBB_API_KEY before uploading an image.");
  if (!imageTypes.includes(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP image.");
  }
  if (file.size > maxImageSize) {
    throw new Error("Image must be 2MB or smaller.");
  }

  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    throw new Error(`Image upload failed (HTTP ${response.status}).`);
  }

  const result: unknown = await response.json();
  if (
    typeof result !== "object" ||
    result === null ||
    !("data" in result) ||
    typeof result.data !== "object" ||
    result.data === null ||
    !("url" in result.data) ||
    typeof result.data.url !== "string"
  ) {
    throw new Error("ImgBB returned an invalid image response.");
  }

  return result.data.url;
}
