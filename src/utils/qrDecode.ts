/**
 * Decode a QR code from an image file or ImageData.
 * Uses BarcodeDetector API (Chrome 83+, Edge 83+, Safari 17.2+)
 * with jsQR fallback for Firefox and older browsers.
 */
import jsQR from 'jsqr';

interface BarcodeDetectorResult {
  readonly rawValue: string;
}

interface BarcodeDetectorClass {
  new (options: { formats: string[] }): {
    detect(source: ImageBitmapSource): Promise<BarcodeDetectorResult[]>;
  };
}

declare const BarcodeDetector: BarcodeDetectorClass | undefined;

const hasBarcodeDetector = typeof BarcodeDetector !== 'undefined';

export async function decodeQRFromFile(file: File): Promise<string> {
  // Try native BarcodeDetector first
  if (hasBarcodeDetector) {
    try {
      const detector = new BarcodeDetector!({ formats: ['qr_code'] });
      const bitmap = await createImageBitmap(file);
      const codes = await detector.detect(bitmap);
      bitmap.close();
      if (codes.length > 0) {
        return codes[0]!.rawValue;
      }
      throw new Error('No QR code found in image');
    } catch (err) {
      if (err instanceof Error && err.message === 'No QR code found in image') {
        throw err;
      }
      // BarcodeDetector failed, fall through to jsQR
    }
  }

  // Fallback: jsQR via canvas
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const result = jsQR(imageData.data, canvas.width, canvas.height);
  if (result) {
    return result.data;
  }
  throw new Error('No QR code found in image');
}

export function decodeQRFromImageData(imageData: ImageData): string | null {
  const result = jsQR(imageData.data, imageData.width, imageData.height);
  return result ? result.data : null;
}

export { hasBarcodeDetector };
