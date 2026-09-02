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

  it('sets immutable caching only for hashed build assets and keeps the 404 rewrite', () => {
    const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8'));
    expect(config.routes.find((route: { route: string }) => route.route === '/assets/*').headers['Cache-Control']).toContain('immutable');
    expect(config.routes.find((route: { route: string }) => route.route === '/*.webp')).toBeUndefined();
    expect(config.responseOverrides['404'].rewrite).toBe('/404.html');
  });
});

describe('claims registry', () => {
  it('maps every registered claim to exactly one test tag', () => {
    const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8')) as { id: string }[];
    const tests = ['tests/app.e2e.ts', 'tests/config.test.ts', 'tests/game.test.ts'].map(file => readFileSync(file, 'utf8')).join('\n');
    const registered = new Set(claims.map(claim => claim.id));
    const tagged = [...tests.matchAll(/@claim:([a-z0-9-]+)/g)].map(match => match[1]);
    expect(new Set(tagged)).toEqual(registered);
    for (const id of registered) expect(tagged.filter(tag => tag === id)).toHaveLength(1);
  });
});
