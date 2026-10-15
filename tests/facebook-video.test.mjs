import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { facebookPluginSrc, isDirectVideoUrl } from '../src/lib/facebookVideo.ts';

describe('isDirectVideoUrl', () => {
	it('accepte un mp4 https et un média WordPress sous /uploads/', () => {
		assert.equal(
			isDirectVideoUrl('https://www.interfede.be/wp-content/uploads/2026/10/clip.mp4'),
			true
		);
		assert.equal(
			isDirectVideoUrl('https://www.interfede.be/wp-content/uploads/2026/10/reforme'),
			true
		);
		assert.equal(isDirectVideoUrl('/medias/temoignage.webm'), true);
	});

	it('refuse Facebook et les URL non média', () => {
		assert.equal(isDirectVideoUrl('https://www.facebook.com/reel/836751805955752/'), false);
		assert.equal(isDirectVideoUrl('https://www.interfede.be/actualites/reforme'), false);
		assert.equal(isDirectVideoUrl('javascript:alert(1)'), false);
		assert.equal(isDirectVideoUrl(null), false);
	});
});

describe('facebookPluginSrc', () => {
	it('ne produit un embed que pour Facebook', () => {
		assert.match(
			facebookPluginSrc('https://www.facebook.com/reel/836751805955752/') ?? '',
			/facebook\.com\/plugins\/video\.php/
		);
		assert.equal(
			facebookPluginSrc('https://www.interfede.be/wp-content/uploads/2026/10/reforme.mp4'),
			null
		);
	});
});
