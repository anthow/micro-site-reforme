import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { presentCisp, youtubeEmbedUrl } from '../src/lib/cisp.ts';

describe('youtubeEmbedUrl', () => {
	it('accepte un lien court, un watch et un embed', () => {
		assert.equal(
			youtubeEmbedUrl('https://youtu.be/ANV7BPe2miQ?si=8WvHbmdwprzI7ngj'),
			'https://www.youtube.com/embed/ANV7BPe2miQ'
		);
		assert.equal(
			youtubeEmbedUrl('https://www.youtube.com/watch?v=-aoHhar5R90&ab_channel=Interfede'),
			'https://www.youtube.com/embed/-aoHhar5R90'
		);
		assert.equal(
			youtubeEmbedUrl('https://www.youtube.com/embed/AhwlxKzG4z8'),
			'https://www.youtube.com/embed/AhwlxKzG4z8'
		);
		assert.equal(
			youtubeEmbedUrl('https://youtu.be/nJAlYSNn93o?si=a-qC_WyE3UmLtVkx'),
			'https://www.youtube.com/embed/nJAlYSNn93o'
		);
	});

	it('refuse une adresse qui n’est pas une vidéo YouTube', () => {
		assert.equal(youtubeEmbedUrl('https://exemple.org/watch?v=ANV7BPe2miQ'), null);
		assert.equal(youtubeEmbedUrl('javascript:alert(1)'), null);
		assert.equal(youtubeEmbedUrl('https://youtu.be/trop-court'), null);
	});
});

describe('presentCisp', () => {
	it('rend le html des tiroirs et n’y garde pas la vidéo', () => {
		const blocs = presentCisp([
			{
				id: 1,
				Role: 'tiroir',
				Titre: '  C’est quoi ?  ',
				Texte: '<section id="cest-quoi"><p>Les CISP</p><ul><li>une <strong>formation</strong></li></ul><script>alert(1)</script></section>',
				Video_URL: 'https://youtu.be/-aoHhar5R90',
				Image_URL: null,
				Lien: null,
				Source: 'IF'
			},
			{
				id: 2,
				Role: 'outil',
				Titre: 'Vide',
				Texte: '   ',
				Video_URL: 'https://exemple.org/x',
				Image_URL: null,
				Lien: null,
				Source: 'CAIPS'
			},
			{
				id: 3,
				Role: 'outil',
				Titre: 'C’est quoi un CISP ?',
				Texte: null,
				Video_URL: 'https://youtu.be/nJAlYSNn93o?si=a-qC_WyE3UmLtVkx',
				Image_URL: null,
				Lien: null,
				Source: 'IF'
			}
		]);

		assert.equal(blocs.length, 2);
		assert.equal(blocs[0].titre, 'C’est quoi ?');
		assert.equal(blocs[0].videoUrl, null);
		assert.match(blocs[0].texte, /<p>Les CISP<\/p>/);
		assert.match(blocs[0].texte, /<li>une <strong>formation<\/strong><\/li>/);
		assert.doesNotMatch(blocs[0].texte, /section|script/);
		assert.equal(blocs[1].videoUrl, 'https://www.youtube.com/embed/nJAlYSNn93o');
	});
});
