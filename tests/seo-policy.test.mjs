import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { faqPageJsonLd, videoObjectJsonLd } from '../src/lib/seo/jsonld.ts';
import {
	buildSitemapXml,
	decideIndexable,
	publicSitemapEntries,
	robotsTxt
} from '../src/lib/seo/policy.ts';

const open = {
	dev: false,
	flag: 'true',
	context: 'production',
	siteUrl: 'https://exemple.org'
};

describe('decideIndexable', () => {
	it('reste fermé par défaut', () => {
		assert.equal(decideIndexable({ ...open, flag: undefined }), false);
		assert.equal(decideIndexable({ ...open, flag: 'false' }), false);
		assert.equal(decideIndexable({ ...open, flag: 'TRUE' }), false);
	});

	it('reste fermé en dev, sans URL, et hors production', () => {
		assert.equal(decideIndexable({ ...open, dev: true }), false);
		assert.equal(decideIndexable({ ...open, siteUrl: '' }), false);
		assert.equal(decideIndexable({ ...open, context: 'deploy-preview' }), false);
		assert.equal(decideIndexable({ ...open, context: 'branch-deploy' }), false);
		assert.equal(decideIndexable({ ...open, context: 'dev' }), false);
	});

	it('s’ouvre seulement en production avec le drapeau exact et une URL', () => {
		assert.equal(decideIndexable(open), true);
		assert.equal(decideIndexable({ ...open, context: undefined }), true);
	});
});

describe('robotsTxt', () => {
	it('interdit tout le site tant que le verrou est fermé', () => {
		assert.equal(robotsTxt(false, 'https://exemple.org'), 'User-agent: *\nDisallow: /\n');
	});

	it('ouvre le site public et laisse la page députés non listée', () => {
		const body = robotsTxt(true, 'https://exemple.org');
		assert.match(body, /Allow: \/\n/);
		assert.match(body, /Disallow: \/contactez-votre-depute\n/);
		assert.match(body, /Sitemap: https:\/\/exemple\.org\/sitemap\.xml\n/);
	});
});

describe('sitemap', () => {
	it('n’expose pas la page députés et date l’avis quand la date est connue', () => {
		const xml = buildSitemapXml('https://exemple.org', publicSitemapEntries('2026-10-07'));
		assert.match(xml, /<loc>https:\/\/exemple\.org\/<\/loc>/);
		assert.match(
			xml,
			/<loc>https:\/\/exemple\.org\/avis-initiative<\/loc>\s*<lastmod>2026-10-07<\/lastmod>/
		);
		assert.doesNotMatch(xml, /contactez-votre-depute/);
	});
});

describe('jsonld', () => {
	it('ignore une FAQ vide et une vidéo incomplète', () => {
		assert.equal(faqPageJsonLd([{ question: '  ', answer: 'réponse' }]), null);
		assert.deepEqual(
			videoObjectJsonLd([
				{
					name: '',
					description: '',
					thumbnailUrl: '',
					uploadDate: '',
					embedUrl: 'https://facebook.com/x'
				}
			]),
			[]
		);
	});
});
