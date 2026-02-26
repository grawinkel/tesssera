/**
 * Generates per-share escape pod HTML files.
 *
 * Imports the pre-built escape pod HTML (built by `npm run build:offline`)
 * and injects a specific share into it so the resulting HTML file opens
 * pre-loaded with that share's data and QR code.
 */
import { triggerDownload, getShareFilename } from './pdfExport';

let escapePodTemplate: string | null = null;

async function getTemplate(): Promise<string> {
  if (escapePodTemplate) {
    return escapePodTemplate;
  }

  try {
    const mod = await import('virtual:escape-pod-html');
    escapePodTemplate = mod.default;
    if (!escapePodTemplate) {
      throw new Error('empty');
    }
    return escapePodTemplate;
  } catch {
    throw new Error(
      'Escape pod template not found. Run `npm run build:offline` first.',
    );
  }
}

function buildShareEscapePod(template: string, share: string): string {
  const shareJson = JSON.stringify(share);
  const injection = `window.__TESSSERA_PRELOADED_SHARE__ = ${shareJson};`;
  return template.replace('// __TESSSERA_SHARE_PLACEHOLDER__', injection);
}

export async function downloadShareEscapePod(
  share: string,
  index: number,
  total: number,
  description?: string,
): Promise<void> {
  const template = await getTemplate();
  const html = buildShareEscapePod(template, share);
  const filename = getShareFilename(index, total, 'html', description);
  triggerDownload(html, filename, 'text/html');
}
