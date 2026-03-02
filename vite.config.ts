/// <reference types="vitest/config" />
import { resolve } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { defineConfig, type Plugin } from 'vite'
import { execFileSync } from 'node:child_process'
import react from '@vitejs/plugin-react'

function getVendorHashes(): Record<string, string> {
  const files: Record<string, string> = {
    'secrets/shamir.ts': resolve(__dirname, 'src/vendor/secrets/shamir.ts'),
    'qrcode/qrcode-esm.js': resolve(__dirname, 'src/vendor/qrcode/qrcode-esm.js'),
  }
  const hashes: Record<string, string> = {}
  for (const [key, filePath] of Object.entries(files)) {
    try {
      const content = readFileSync(filePath)
      hashes[key] = createHash('sha256').update(content).digest('hex')
    } catch {
      hashes[key] = 'file not found'
    }
  }
  return hashes
}

function getGitCommit(): string {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      encoding: 'utf-8',
    }).trim()
  } catch {
    return 'unknown'
  }
}

// Inject CSP meta tag only in production builds.
// In dev mode, Vite's HMR requires inline scripts and WebSocket connections
// which CSP would block.
function cspPlugin(): Plugin {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: mediastream:",
    "media-src 'self' mediastream:",
    "connect-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; ')

  return {
    name: 'inject-csp',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(
          '<head>',
          `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`,
        )
      },
    },
    apply: 'build',
  }
}

/**
 * Virtual module plugin that serves the pre-built escape pod HTML as a string.
 * The escape pod must be built first via `npm run build:offline`.
 */
function escapePodPlugin(): Plugin {
  const VIRTUAL_ID = 'virtual:escape-pod-html'
  const RESOLVED_ID = '\0' + VIRTUAL_ID
  const podPath = resolve(__dirname, 'dist-offline/offline.html')

  return {
    name: 'escape-pod-html',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined
      if (!existsSync(podPath)) {
        return 'export default ""'
      }
      const html = readFileSync(podPath, 'utf-8')
      return `export default ${JSON.stringify(html)}`
    },
  }
}

export default defineConfig(() => ({
  base: '/',
  plugins: [react(), cspPlugin(), escapePodPlugin()],
  define: {
    '__BUILD_COMMIT__': JSON.stringify(getGitCommit()),
    '__VENDOR_HASHES__': JSON.stringify(getVendorHashes()),
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tool: resolve(__dirname, 'tool.html'),
      },
    },
  },
  test: {
    exclude: ['e2e/**', 'node_modules/**'],
    setupFiles: ['./src/test-setup.ts'],
  },
}))
