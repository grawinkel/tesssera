/**
 * Minimal PDF image extractor for TESSSERA-generated PDFs.
 * Finds raw RGB image XObjects and decodes QR codes from them using jsQR.
 *
 * This parser is intentionally narrow — it handles the known PDF structure
 * produced by pdfExport.ts (uncompressed RGB image streams). It does NOT
 * handle arbitrary PDFs, compressed streams, or JPEG/PNG images.
 */
import jsQR from 'jsqr';

interface ImageStream {
  readonly width: number;
  readonly height: number;
  readonly rgb: Uint8Array;
}

function findAllOccurrences(haystack: Uint8Array, needle: Uint8Array): readonly number[] {
  const positions: number[] = [];
  for (let i = 0; i <= haystack.length - needle.length; i++) {
    let match = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      positions.push(i);
    }
  }
  return positions;
}

function extractNumber(text: string, key: string): number | null {
  const pattern = new RegExp(`/${key}\\s+(\\d+)`);
  const match = text.match(pattern);
  return match ? Number(match[1]) : null;
}

function extractImageStreams(pdfBytes: Uint8Array): readonly ImageStream[] {
  const encoder = new TextEncoder();
  const streamMarker = encoder.encode('stream\n');
  const endstreamMarker = encoder.encode('\nendstream');

  const decoder = new TextDecoder('latin1');
  const streamPositions = findAllOccurrences(pdfBytes, streamMarker);
  const images: ImageStream[] = [];

  for (const streamStart of streamPositions) {
    // Look backward from the stream marker to find the object dictionary
    const dictSearchStart = Math.max(0, streamStart - 512);
    const dictRegion = decoder.decode(pdfBytes.slice(dictSearchStart, streamStart));

    // Only process image XObjects
    if (!dictRegion.includes('/Subtype /Image')) {
      continue;
    }

    const width = extractNumber(dictRegion, 'Width');
    const height = extractNumber(dictRegion, 'Height');
    const length = extractNumber(dictRegion, 'Length');

    if (width === null || height === null || length === null) {
      continue;
    }

    const expectedRgbLength = width * height * 3;
    if (length !== expectedRgbLength) {
      continue;
    }

    const dataStart = streamStart + streamMarker.length;
    const dataEnd = dataStart + length;

    if (dataEnd > pdfBytes.length) {
      continue;
    }

    // Verify endstream marker follows
    const endCheck = pdfBytes.slice(dataEnd, dataEnd + endstreamMarker.length);
    const isValidEnd = endCheck.length === endstreamMarker.length &&
      endCheck.every((b, i) => b === endstreamMarker[i]);

    if (!isValidEnd) {
      continue;
    }

    images.push({
      width,
      height,
      rgb: pdfBytes.slice(dataStart, dataEnd),
    });
  }

  return images;
}

function rgbToRgba(rgb: Uint8Array, width: number, height: number): Uint8ClampedArray {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let i = 0, j = 0; i < rgb.length; i += 3, j += 4) {
    rgba[j] = rgb[i];
    rgba[j + 1] = rgb[i + 1];
    rgba[j + 2] = rgb[i + 2];
    rgba[j + 3] = 255;
  }
  return rgba;
}

/**
 * Extract QR code data from a TESSSERA-generated PDF file.
 * Returns all decoded QR strings found in the PDF (one per page/image).
 */
export async function decodeQRFromPDF(file: File): Promise<readonly string[]> {
  const buffer = await file.arrayBuffer();
  const pdfBytes = new Uint8Array(buffer);
  const images = extractImageStreams(pdfBytes);

  const results: string[] = [];

  for (const image of images) {
    const rgba = rgbToRgba(image.rgb, image.width, image.height);
    const qr = jsQR(rgba, image.width, image.height);
    if (qr) {
      results.push(qr.data);
    }
  }

  if (results.length === 0) {
    throw new Error('No QR code found in PDF');
  }

  return results;
}

/**
 * Check if a file is a PDF based on its type or extension.
 */
export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}
