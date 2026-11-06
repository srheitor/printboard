export interface CompressedImage {
  blob: Blob;
  extension: 'webp' | 'jpg';
}

/**
 * Redimensiona e comprime a imagem no navegador antes do upload,
 * para o repositório não crescer à toa (uma foto de celular de 5 MB vira ~150 KB).
 */
export async function compressImage(file: File, maxSize = 1200, quality = 0.82): Promise<CompressedImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível processar a imagem.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  const webp = await toBlob('image/webp');
  if (webp && webp.type === 'image/webp') return { blob: webp, extension: 'webp' };

  const jpg = await toBlob('image/jpeg');
  if (!jpg) throw new Error('Não foi possível comprimir a imagem.');
  return { blob: jpg, extension: 'jpg' };
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return dataUrl.slice(dataUrl.indexOf(',') + 1);
}
