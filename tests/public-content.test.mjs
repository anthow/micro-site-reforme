import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	linesOf,
	presentCarousel,
	presentPosition,
	presentSlogans,
	sanitizeFaq
} from '../src/lib/publicContent.ts';

describe('lignes', () => {
	it('découpe slogans et points clés, une ligne chacun', () => {
		assert.deepEqual(presentSlogans('Un\r\n\nDeux\n  Trois  '), ['Un', 'Deux', 'Trois']);
		assert.deepEqual(linesOf(''), []);
		assert.deepEqual(linesOf(null), []);
	});
});

describe('sanitizeFaq', () => {
	it('rend le html des réponses et retire les balises dangereuses', () => {
		const faq = sanitizeFaq([
			{
				id: 1,
				Question: '  Une question ?  ',
				Réponse:
					'<section id="x"><p>Les CISP</p><ul><li>une <strong>formation</strong></li></ul><script>alert(1)</script></section>'
			},
			{
				id: 2,
				Question: 'Vide',
				Réponse: '   '
			}
		]);

		assert.equal(faq.length, 1);
		assert.equal(faq[0].Question, 'Une question ?');
		assert.match(faq[0].Réponse, /<p>Les CISP<\/p>/);
		assert.match(faq[0].Réponse, /<li>une <strong>formation<\/strong><\/li>/);
		assert.doesNotMatch(faq[0].Réponse, /section|script/);
	});
});

describe('présentations vides', () => {
	it('masque une position vide et un slide inactif ou sans titre', () => {
		assert.equal(
			presentPosition({ Titre: '  ', Texte: '\n\n', PDF_URL: null, Mis_a_jour_le: null }),
			null
		);

		const slides = presentCarousel([
			{
				id: 1,
				Titre: 'Visible',
				Texte: 'Court',
				Image_URL: '/cone.png',
				Lien: 'javascript:alert(1)',
				Ordre: 2,
				Actif: true
			},
			{
				id: 2,
				Titre: 'Inactif',
				Texte: null,
				Image_URL: null,
				Lien: null,
				Ordre: 1,
				Actif: false
			},
			{
				id: 3,
				Titre: '   ',
				Texte: null,
				Image_URL: null,
				Lien: null,
				Ordre: 0,
				Actif: true
			}
		]);

		assert.equal(slides.length, 1);
		assert.equal(slides[0].titre, 'Visible');
		assert.equal(slides[0].lien, null);
		assert.equal(slides[0].imageUrl, '/cone.png');
	});
});
