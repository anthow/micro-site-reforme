import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	articleIdFromParam,
	articlePath,
	articleSlug,
	facebookReelEmbed,
	presentMobilisation,
	presentMobilisationList,
	sortMobilisation,
	splitParagraphs
} from '../src/lib/mobilisation.ts';

describe('sortMobilisation', () => {
	it('place les articles épinglés avant les autres, puis trie par date', () => {
		const sorted = sortMobilisation([
			{ id: 1, epingle: false, created_at: '2026-10-03T00:00:00.000Z' },
			{ id: 2, epingle: true, created_at: '2026-10-01T00:00:00.000Z' },
			{ id: 3, epingle: false, created_at: '2026-10-05T00:00:00.000Z' },
			{ id: 4, epingle: true, created_at: '2026-10-04T00:00:00.000Z' }
		]);

		assert.deepEqual(
			sorted.map((article) => article.id),
			[4, 2, 3, 1]
		);
	});
});

describe('presentMobilisationList', () => {
	it('ignore les brouillons, les titres vides et les adresses non sûres', () => {
		const articles = presentMobilisationList([
			{
				id: 1,
				created_at: '2026-10-02T00:00:00.000Z',
				titre: 'Publié',
				resume: ' Résumé ',
				texte: null,
				image_url: 'javascript:alert(1)',
				video_url: 'https://www.facebook.com/reel/1',
				epingle: false,
				publie: true
			},
			{
				id: 2,
				created_at: '2026-10-03T00:00:00.000Z',
				titre: 'Brouillon',
				resume: null,
				texte: null,
				image_url: '/cone.png',
				video_url: null,
				epingle: true,
				publie: false
			},
			{
				id: 3,
				created_at: '2026-10-01T00:00:00.000Z',
				titre: '   ',
				resume: null,
				texte: null,
				image_url: null,
				video_url: null,
				epingle: false,
				publie: true
			}
		]);

		assert.equal(articles.length, 1);
		assert.equal(articles[0].titre, 'Publié');
		assert.equal(articles[0].resume, 'Résumé');
		assert.equal(articles[0].imageUrl, null);
		assert.match(articles[0].videoEmbed ?? '', /facebook\.com\/plugins\/video\.php/);
		assert.match(articles[0].videoEmbed ?? '', /width=267/);
	});
});

describe('facebookReelEmbed', () => {
	it('refuse une adresse qui n’est pas une vidéo Facebook', () => {
		assert.equal(facebookReelEmbed('https://exemple.org/video'), null);
		assert.equal(facebookReelEmbed('javascript:alert(1)'), null);
	});
});

describe('articleSlug', () => {
	const titre =
		'Suppression d’un incitant financier essentiel à la formation : les CISP et le RWLP introduisent un recours';

	it('met le titre dans l’adresse et coupe sur un mot si c’est trop long', () => {
		const slug = articleSlug(titre);
		assert.ok(slug.length <= 80);
		assert.equal(slug.endsWith('-'), false);
		assert.match(slug, /^suppression-d-un-incitant-financier/);
		assert.equal(articlePath(14, titre), `/mobilisation/14-${slug}`);
	});

	it('retrouve l’identifiant avec ou sans le titre', () => {
		assert.equal(articleIdFromParam('14'), 14);
		assert.equal(articleIdFromParam(`14-${articleSlug(titre)}`), 14);
		assert.equal(articleIdFromParam('abc'), null);
		assert.equal(articleIdFromParam('0-titre'), null);
	});
});

describe('présent HTML', () => {
	it('interprète les balises autorisées et retire le code dangereux', () => {
		const article = presentMobilisation({
			id: 14,
			created_at: '2026-10-12T00:00:00.000Z',
			titre: 'Recours',
			resume: null,
			texte:
				'<article><h2>Titre</h2><p class="date"><time datetime="2026-09-18">18 septembre 2026</time></p><ul><li><strong>Accès</strong> restreint</li></ul><p class="source">Source : <a href="https://www.interfede.be/note.pdf" target="_blank" onclick="alert(1)">PDF</a></p><script>alert(1)</script></article>',
			image_url: null,
			video_url: null,
			epingle: false,
			publie: true
		});

		assert.equal(article?.texteHtml, true);
		assert.match(article?.texte ?? '', /<h2>Titre<\/h2>/);
		assert.match(article?.texte ?? '', /<time datetime="2026-09-18">/);
		assert.match(article?.texte ?? '', /<ul><li><strong>Accès<\/strong>/);
		assert.match(article?.texte ?? '', /href="https:\/\/www.interfede.be\/note.pdf"/);
		assert.doesNotMatch(article?.texte ?? '', /script|onclick|target|class=/);
	});
});

describe('splitParagraphs', () => {
	it('sépare le texte sur les doubles retours à la ligne', () => {
		assert.deepEqual(splitParagraphs('Un\n\nDeux\nligne\n\n\nTrois'), ['Un', 'Deux\nligne', 'Trois']);
		assert.deepEqual(splitParagraphs('   '), []);
		assert.deepEqual(splitParagraphs(null), []);
	});
});
