import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	articleIdFromParam,
	articlePath,
	articleSlug,
	facebookReelEmbed,
	formatPublicationDate,
	mobilisationCategorie,
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
				Titre: 'Publié',
				Resume: ' Résumé ',
				Texte: null,
				Image_URL: 'javascript:alert(1)',
				Video_URL: 'https://www.facebook.com/reel/1',
				Epingle: false,
				Publie: true
			},
			{
				id: 2,
				created_at: '2026-10-03T00:00:00.000Z',
				Titre: 'Brouillon',
				Resume: null,
				Texte: null,
				Image_URL: '/cone.png',
				Video_URL: null,
				Epingle: true,
				Publie: false
			},
			{
				id: 3,
				created_at: '2026-10-01T00:00:00.000Z',
				Titre: '   ',
				Resume: null,
				Texte: null,
				Image_URL: null,
				Video_URL: null,
				Epingle: false,
				Publie: true
			}
		]);

		assert.equal(articles.length, 1);
		assert.equal(articles[0].titre, 'Publié');
		assert.equal(articles[0].resume, 'Résumé');
		assert.equal(articles[0].imageUrl, null);
		assert.equal(articles[0].lien, null);
		assert.equal(articles[0].abonnement, false);
		assert.equal(
			articles[0].videoEmbed,
			`https://www.facebook.com/plugins/video.php?height=476&href=${encodeURIComponent('https://www.facebook.com/reel/1')}&show_text=false&width=267&t=0`
		);
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
			Titre: 'Recours',
			Resume: null,
			Texte:
				'<article><h2>Titre</h2><p class="date"><time datetime="2026-09-18">18 septembre 2026</time></p><ul><li><strong>Accès</strong> restreint</li></ul><p class="source">Source : <a href="https://www.interfede.be/note.pdf" target="_blank" onclick="alert(1)">PDF</a></p><script>alert(1)</script></article>',
			Image_URL: null,
			Video_URL: null,
			Epingle: false,
			Publie: true
		});

		assert.equal(article?.texteHtml, true);
		assert.match(article?.texte ?? '', /<h2>Titre<\/h2>/);
		assert.match(article?.texte ?? '', /<time datetime="2026-09-18">/);
		assert.match(article?.texte ?? '', /<ul><li><strong>Accès<\/strong>/);
		assert.match(article?.texte ?? '', /href="https:\/\/www.interfede.be\/note.pdf"/);
		assert.doesNotMatch(article?.texte ?? '', /script|onclick|target|class=/);
	});
});

describe('lien externe', () => {
	const base = {
		id: 20,
		created_at: '2026-10-12T00:00:00.000Z',
		Titre: 'Article de presse',
		Resume: null,
		Texte: null,
		Image_URL: null,
		Video_URL: null,
		Epingle: false,
		Publie: true
	};

	it('garde une adresse https et signale l’abonnement', () => {
		const article = presentMobilisation({
			...base,
			Lien: ' https://www.exemple.be/article ',
			abonnement: true
		});

		assert.equal(article?.lien, 'https://www.exemple.be/article');
		assert.equal(article?.abonnement, true);
	});

	it('ignore une adresse dangereuse', () => {
		const article = presentMobilisation({
			...base,
			Lien: 'javascript:alert(1)',
			abonnement: false
		});

		assert.equal(article?.lien, null);
		assert.equal(article?.abonnement, false);
	});
});

describe('formatPublicationDate', () => {
	it('affiche la date de publication en français', () => {
		assert.deepEqual(formatPublicationDate('2026-09-18'), {
			iso: '2026-09-18',
			label: '18 septembre 2026'
		});
		assert.equal(formatPublicationDate(null), null);
		assert.equal(formatPublicationDate('pas-une-date'), null);

		const article = presentMobilisation({
			id: 14,
			created_at: '2026-10-12T00:00:00.000Z',
			Titre: 'Recours',
			Resume: null,
			Texte: null,
			Image_URL: null,
			Video_URL: null,
			Epingle: false,
			Publie: true,
			Date: '2026-09-18'
		});
		assert.equal(article?.publication?.label, '18 septembre 2026');
	});
});

describe('tri par Date', () => {
	it('met les épinglés d’abord, puis la Date, et created_at si la Date est vide', () => {
		const articles = presentMobilisationList([
			{
				id: 1,
				created_at: '2026-10-10T00:00:00.000Z',
				Titre: 'Ancien daté',
				Resume: null,
				Texte: null,
				Image_URL: null,
				Video_URL: null,
				Epingle: false,
				Publie: true,
				Date: '2026-09-01'
			},
			{
				id: 2,
				created_at: '2026-10-02T00:00:00.000Z',
				Titre: 'Sans date',
				Resume: null,
				Texte: null,
				Image_URL: null,
				Video_URL: null,
				Epingle: false,
				Publie: true,
				Date: null
			},
			{
				id: 3,
				created_at: '2026-01-01T00:00:00.000Z',
				Titre: 'Épinglé',
				Resume: null,
				Texte: null,
				Image_URL: null,
				Video_URL: null,
				Epingle: true,
				Publie: true,
				Date: '2026-01-15'
			}
		]);

		assert.deepEqual(
			articles.map((article) => article.id),
			[3, 2, 1]
		);
		assert.equal(articles[1].publication?.label, '2 octobre 2026');
	});
});

describe('catégories', () => {
	it('reconnaît les rubriques connues et ignore le reste', () => {
		assert.equal(mobilisationCategorie('retour_actions'), 'retour_actions');
		assert.equal(mobilisationCategorie('autre'), null);
		assert.equal(mobilisationCategorie(null), null);
	});
});

describe('splitParagraphs', () => {
	it('sépare le texte sur les doubles retours à la ligne', () => {
		assert.deepEqual(splitParagraphs('Un\n\nDeux\nligne\n\n\nTrois'), ['Un', 'Deux\nligne', 'Trois']);
		assert.deepEqual(splitParagraphs('   '), []);
		assert.deepEqual(splitParagraphs(null), []);
	});
});
