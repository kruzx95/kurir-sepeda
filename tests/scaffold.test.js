import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Project Scaffolding', () => {
  it('has valid package.json with scripts', () => {
    const pkgPath = path.resolve(__dirname, '../package.json');
    expect(fs.existsSync(pkgPath)).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    expect(pkg.scripts.dev).toBe('vite');
    expect(pkg.scripts.test).toBe('vitest run');
  });

  it('has index.html with mount points', () => {
    const htmlPath = path.resolve(__dirname, '../index.html');
    expect(fs.existsSync(htmlPath)).toBe(true);
    const html = fs.readFileSync(htmlPath, 'utf8');
    expect(html).toContain('id="role-switcher-container"');
    expect(html).toContain('id="view-container"');
  });
});
