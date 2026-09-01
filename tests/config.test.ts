import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('static deployment policy', () => {
  it('ships the CSP in the public build input', () => {
    const root = JSON.parse(readFileSync('staticwebapp.config.json', 'utf8'));
    const shipped = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8'));
    expect(shipped).toEqual(root);
    expect(shipped.globalHeaders['Content-Security-Policy']).toContain("script-src 'self'");
    expect(shipped.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
  });

  it('sets immutable caching for built assets and keeps the 404 rewrite', () => {
    const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8'));
    expect(config.routes.find((route: { route: string }) => route.route === '/assets/*').headers['Cache-Control']).toContain('immutable');
    expect(config.responseOverrides['404'].rewrite).toBe('/404.html');
  });
});
