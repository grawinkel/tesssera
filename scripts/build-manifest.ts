import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join, relative } from 'node:path';

const DIST_DIR = join(import.meta.dirname, '..', 'dist');

async function getFilesRecursive(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await getFilesRecursive(fullPath);
      files.push(...nested);
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function hashFile(filePath: string): Promise<string> {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
}

async function main() {
  const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
    encoding: 'utf-8',
  }).trim();

  const commitFull = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf-8',
  }).trim();

  const files = await getFilesRecursive(DIST_DIR);
  const fileHashes: Record<string, string> = {};

  for (const file of files.sort()) {
    const relativePath = relative(DIST_DIR, file);
    if (relativePath === 'BUILD_MANIFEST.json') continue;
    fileHashes[relativePath] = await hashFile(file);
  }

  const manifest = {
    commit,
    commitFull,
    buildDate: new Date().toISOString(),
    files: fileHashes,
  };

  await writeFile(
    join(DIST_DIR, 'BUILD_MANIFEST.json'),
    JSON.stringify(manifest, null, 2),
  );

  const fileCount = Object.keys(fileHashes).length;
  process.stdout.write(`BUILD_MANIFEST.json: ${commit}, ${fileCount} files hashed\n`);
}

main();
