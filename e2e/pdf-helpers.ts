import jsQR from 'jsqr'

const QR_SIZE = 200
const RGB_BYTE_LENGTH = QR_SIZE * QR_SIZE * 3 // 120,000

/**
 * Extracts raw RGB image streams from the PDF binary.
 * The PDF serializer (pdfExport.ts) embeds QR codes as uncompressed
 * RGB Image XObjects with a fixed 200x200 size.
 */
export function extractQrRgbStreams(pdfBytes: Buffer): Uint8Array[] {
  const streams: Uint8Array[] = []
  const imageMarker = Buffer.from('/Subtype /Image')
  const streamDelimiter = Buffer.from('stream\n')

  let searchFrom = 0

  while (searchFrom < pdfBytes.length) {
    const markerIdx = pdfBytes.indexOf(imageMarker, searchFrom)
    if (markerIdx === -1) break

    // Find the "stream\n" delimiter after this marker
    const delimIdx = pdfBytes.indexOf(streamDelimiter, markerIdx)
    if (delimIdx === -1) break

    const dataStart = delimIdx + streamDelimiter.length

    if (dataStart + RGB_BYTE_LENGTH > pdfBytes.length) break

    const rgb = new Uint8Array(pdfBytes.buffer, pdfBytes.byteOffset + dataStart, RGB_BYTE_LENGTH)
    streams.push(Uint8Array.from(rgb))

    searchFrom = dataStart + RGB_BYTE_LENGTH
  }

  if (streams.length === 0) {
    throw new Error('No QR image streams found in PDF')
  }

  return streams
}

/**
 * Decodes a QR code from raw RGB pixel data.
 * Expands RGB to RGBA (jsqr requires 4-channel input).
 */
export function decodeQrFromRgb(
  rgb: Uint8Array,
  width: number = QR_SIZE,
  height: number = QR_SIZE,
): string | null {
  const rgba = new Uint8ClampedArray(width * height * 4)
  for (let i = 0, j = 0; i < rgb.length; i += 3, j += 4) {
    rgba[j] = rgb[i]
    rgba[j + 1] = rgb[i + 1]
    rgba[j + 2] = rgb[i + 2]
    rgba[j + 3] = 255
  }

  const result = jsQR(rgba, width, height)
  return result ? result.data : null
}
