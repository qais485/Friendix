import { mediaApi } from "@/services/mediaApi";

export async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "video" | "audio" | "raw" = "image"
): Promise<{ url: string; publicId: string }> {
  const { data: signData } = await mediaApi.getCloudinarySignature("friendix", resourceType);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signData.api_key);
  formData.append("timestamp", String(signData.timestamp));
  formData.append("signature", signData.signature);
  formData.append("folder", signData.folder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/${resourceType}/upload`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  const result = await response.json();
  return { url: result.secure_url, publicId: result.public_id };
}
