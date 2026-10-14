import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { idMesureGa } from '../src/lib/analytics.ts';

describe('idMesureGa', () => {
	it('accepte un ID de mesure GA4', () => {
		assert.equal(idMesureGa('G-ABCDEF12'), 'G-ABCDEF12');
		assert.equal(idMesureGa('  g-xyz789  '), 'g-xyz789');
	});

	it('refuse une valeur incorrecte', () => {
		assert.equal(idMesureGa(''), null);
		assert.equal(idMesureGa('UA-123-1'), null);
		assert.equal(idMesureGa('GTM-XXXX'), null);
		assert.equal(idMesureGa('G-'), null);
	});
});
