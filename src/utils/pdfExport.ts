import { decodeShare } from './crypto';

/**
 * Minimal PDF 1.4 generator. No dependencies.
 * Produces one page per share with QR code image and text.
 */

interface QrImageData {
  readonly pixels: Uint8Array;
  readonly width: number;
  readonly height: number;
}

interface PdfObject {
  readonly header: string;
  readonly streamBytes?: Uint8Array;
}

const PAGE_WIDTH = 595; // A4
const PAGE_HEIGHT = 842;
const QR_SIZE = 200;
const MARGIN = 50;

// ---------------------------------------------------------------------------
// QR rasterization
// ---------------------------------------------------------------------------

async function qrToRgb(shareData: string, size: number): Promise<QrImageData> {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  document.body.appendChild(container);

  try {
    const React = await import('react');
    const ReactDOM = await import('react-dom/client');
    const { QRCodeSVG } = await import('../vendor/qrcode');

    const root = ReactDOM.createRoot(container);
    await new Promise<void>((resolve) => {
      root.render(
        React.createElement(QRCodeSVG, {
          value: shareData,
          size,
          level: 'M',
          includeMargin: true,
          bgColor: '#ffffff',
          fgColor: '#000000',
        }),
      );
      requestAnimationFrame(() => resolve());
    });

    await new Promise((r) => requestAnimationFrame(r));

    const svgElement = container.querySelector('svg');
    if (!svgElement) {
      throw new Error('QR SVG not rendered');
    }

    const svgString = new XMLSerializer().serializeToString(svgElement);
    root.unmount();

    return await rasterizeSvg(svgString, size);
  } finally {
    document.body.removeChild(container);
  }
}

async function rasterizeSvg(svgString: string, size: number): Promise<QrImageData> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const img = new Image();
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to render QR code'));
    };
    img.src = url;
  });

  const imageData = ctx.getImageData(0, 0, size, size);
  const rgba = imageData.data;
  const rgb = new Uint8Array((rgba.length / 4) * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    rgb[j] = rgba[i];
    rgb[j + 1] = rgba[i + 1];
    rgb[j + 2] = rgba[i + 2];
  }

  return { pixels: rgb, width: size, height: size };
}

// ---------------------------------------------------------------------------
// PDF text helpers
// ---------------------------------------------------------------------------

function pdfString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapTextAtWords(text: string, maxChars: number): readonly string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (current.length === 0) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}

// ---------------------------------------------------------------------------
// PDF page content stream
// ---------------------------------------------------------------------------

function buildPageContentStream(
  share: string,
  meta: { readonly index: number; readonly total: number; readonly threshold: number },
  imageRef: string,
  description?: string,
): Uint8Array {
  let y = PAGE_HEIGHT - MARGIN;
  let stream = '';

  // --- TESSSERA header ---
  y -= 18;
  stream += 'BT\n';
  stream += `/F1 18 Tf\n`;
  stream += `${MARGIN} ${y} Td\n`;
  stream += `(${pdfString('TESSSERA')}) Tj\n`;
  stream += 'ET\n';

  // --- Share X of Y ---
  y -= 18;
  stream += 'BT\n';
  stream += `/F1 12 Tf\n`;
  stream += `${MARGIN} ${y} Td\n`;
  stream += `(${pdfString(`Share ${meta.index} of ${meta.total}`)}) Tj\n`;
  stream += 'ET\n';

  // --- Requires N shares ---
  y -= 16;
  stream += 'BT\n';
  stream += `/F1 10 Tf\n`;
  stream += `${MARGIN} ${y} Td\n`;
  stream += `(${pdfString(`Requires ${meta.threshold} shares to recover`)}) Tj\n`;
  stream += 'ET\n';

  // --- Separator line ---
  y -= 10;
  stream += `${MARGIN} ${y} m ${PAGE_WIDTH - MARGIN} ${y} l 0.5 w S\n`;

  // --- Description (multi-line, word-wrapped) ---
  if (description) {
    const descLines = wrapTextAtWords(description, 85);
    y -= 16;
    stream += 'BT\n';
    stream += `/F1 10 Tf\n`;
    stream += `${MARGIN} ${y} Td\n`;
    for (const line of descLines) {
      stream += `(${pdfString(line)}) Tj\n`;
      stream += '0 -14 Td\n';
      y -= 14;
    }
    stream += 'ET\n';
  }

  // --- Instructional text ---
  const othersNeeded = meta.threshold - 1;
  const instructionLines = wrapTextAtWords(
    `This is a piece of a TESSSERA document. Combine it with ${othersNeeded} other ${othersNeeded === 1 ? 'part' : 'parts'} to reveal the secret.`,
    90,
  );
  y -= 16;
  stream += 'BT\n';
  stream += `/F1 9 Tf\n`;
  stream += `${MARGIN} ${y} Td\n`;
  for (const line of instructionLines) {
    stream += `(${pdfString(line)}) Tj\n`;
    stream += '0 -13 Td\n';
    y -= 13;
  }
  stream += 'ET\n';

  // --- URL ---
  y -= 4;
  stream += 'BT\n';
  stream += `/F2 9 Tf\n`;
  stream += `${MARGIN} ${y} Td\n`;
  stream += `(${pdfString('https://github.com/grawinkel/tesssera')}) Tj\n`;
  stream += 'ET\n';

  // --- Separator line ---
  y -= 14;
  stream += `${MARGIN} ${y} m ${PAGE_WIDTH - MARGIN} ${y} l 0.5 w S\n`;

  // --- QR Code (centered) ---
  y -= QR_SIZE + 10;
  const qrX = (PAGE_WIDTH - QR_SIZE) / 2;
  stream += `q\n${QR_SIZE} 0 0 ${QR_SIZE} ${qrX} ${y} cm\n/${imageRef} Do\nQ\n`;

  // --- Share text (monospace, wrapped at 72 chars) ---
  const maxCharsPerLine = 72;
  const shareLines: readonly string[] = Array.from(
    { length: Math.ceil(share.length / maxCharsPerLine) },
    (_, j) => share.slice(j * maxCharsPerLine, (j + 1) * maxCharsPerLine),
  );

  y -= 20;
  stream += 'BT\n';
  stream += `/F2 7 Tf\n`;
  stream += `${MARGIN} ${y} Td\n`;
  for (const line of shareLines) {
    stream += `(${pdfString(line)}) Tj\n`;
    stream += '0 -10 Td\n';
    y -= 10;
  }
  stream += 'ET\n';

  // --- Footer ---
  stream += 'BT\n';
  stream += `/F1 8 Tf\n`;
  stream += `${MARGIN} ${MARGIN} Td\n`;
  stream += `(${pdfString('Generated by TESSSERA')}) Tj\n`;
  stream += 'ET\n';

  return new TextEncoder().encode(stream);
}

// ---------------------------------------------------------------------------
// PDF serializer
// ---------------------------------------------------------------------------

function serializePdf(objects: readonly PdfObject[]): Uint8Array {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  let byteOffset = 0;

  function writeStr(s: string): void {
    const bytes = encoder.encode(s);
    chunks.push(bytes);
    byteOffset += bytes.length;
  }

  writeStr('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  const objectOffsets: number[] = [];

  for (let i = 0; i < objects.length; i++) {
    objectOffsets.push(byteOffset);
    const obj = objects[i];
    writeStr(`${i + 1} 0 obj\n${obj.header}\n`);
    if (obj.streamBytes) {
      writeStr('stream\n');
      chunks.push(obj.streamBytes);
      byteOffset += obj.streamBytes.length;
      writeStr('\nendstream\n');
    }
    writeStr('endobj\n');
  }

  const xrefOffset = byteOffset;
  writeStr(`xref\n0 ${objects.length + 1}\n`);
  writeStr('0000000000 65535 f \n');
  for (const offset of objectOffsets) {
    writeStr(`${String(offset).padStart(10, '0')} 00000 n \n`);
  }

  writeStr(`trailer\n<<\n/Size ${objects.length + 1}\n/Root 1 0 R\n>>\n`);
  writeStr(`startxref\n${xrefOffset}\n%%EOF\n`);

  const totalSize = chunks.reduce((sum, c) => sum + c.length, 0);
  const pdfBytes = new Uint8Array(totalSize);
  let pos = 0;
  for (const chunk of chunks) {
    pdfBytes.set(chunk, pos);
    pos += chunk.length;
  }

  return pdfBytes;
}

// ---------------------------------------------------------------------------
// Single-share PDF builder
// ---------------------------------------------------------------------------

export async function buildSingleSharePDF(
  share: string,
  index: number,
  threshold: number,
  total: number,
  description?: string,
): Promise<Uint8Array> {
  const qrImage = await qrToRgb(share, QR_SIZE);
  const meta = { index, total, threshold };

  const objects: PdfObject[] = [];

  function addObject(header: string, streamBytes?: Uint8Array): number {
    objects.push({ header, streamBytes });
    return objects.length;
  }

  addObject('<<\n/Type /Catalog\n/Pages 2 0 R\n>>');
  addObject('');
  const pagesObjIdx = 1;

  const imgObjNum = addObject(
    `<<\n/Type /XObject\n/Subtype /Image\n/Width ${QR_SIZE}\n/Height ${QR_SIZE}\n/ColorSpace /DeviceRGB\n/BitsPerComponent 8\n/Length ${qrImage.pixels.length}\n>>`,
    qrImage.pixels,
  );

  const streamBytes = buildPageContentStream(share, meta, 'Im0', description);
  const contentObjNum = addObject(
    `<<\n/Length ${streamBytes.length}\n>>`,
    streamBytes,
  );

  const font1ObjNum = addObject(
    '<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>',
  );
  const font2ObjNum = addObject(
    '<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Courier\n>>',
  );

  const resourcesObjNum = addObject(
    `<<\n/Font <<\n/F1 ${font1ObjNum} 0 R\n/F2 ${font2ObjNum} 0 R\n>>\n/XObject <<\n/Im0 ${imgObjNum} 0 R\n>>\n>>`,
  );

  const pageObjNum = addObject(
    `<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}]\n/Contents ${contentObjNum} 0 R\n/Resources ${resourcesObjNum} 0 R\n>>`,
  );

  objects[pagesObjIdx] = {
    header: `<<\n/Type /Pages\n/Kids [${pageObjNum} 0 R]\n/Count 1\n>>`,
  };

  return serializePdf(objects);
}

// ---------------------------------------------------------------------------
// Download helpers
// ---------------------------------------------------------------------------

export function triggerDownload(bytes: Uint8Array | string, filename: string, mimeType: string): void {
  const part: BlobPart = typeof bytes === 'string'
    ? bytes
    : new Uint8Array(bytes);
  const blob = new Blob([part], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildFilename(index: number, total: number, ext: string, description?: string): string {
  const safeName = description
    ? description.slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').toLowerCase()
    : 'share';
  return `tesssera-${safeName}-share-${index}-of-${total}.${ext}`;
}

export function getShareFilename(index: number, total: number, ext: string, description?: string): string {
  return buildFilename(index, total, ext, description);
}

export async function exportSingleSharePDF(
  share: string,
  index: number,
  threshold: number,
  total: number,
  description?: string,
): Promise<void> {
  const pdfBytes = await buildSingleSharePDF(share, index, threshold, total, description);
  triggerDownload(pdfBytes, buildFilename(index, total, 'pdf', description), 'application/pdf');
}

export async function exportAllSharesPDF(
  shares: readonly string[],
  threshold: number,
  total: number,
  description?: string,
): Promise<void> {
  for (const shareStr of shares) {
    const meta = decodeShare(shareStr);
    await exportSingleSharePDF(shareStr, meta.index, threshold, total, description);
  }
}
