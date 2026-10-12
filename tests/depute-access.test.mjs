import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { accessTokenValid, issueAccessToken, passwordsMatch } from '../src/lib/deputeAccess.ts';

const secret = 'phrase-de-test';
const now = 1_700_000_000_000;
const ttl = 60_000;

describe('accès page députés', () => {
	it('refuse un mot de passe vide, absent ou différent', () => {
		assert.equal(passwordsMatch('phrase-de-test', ''), false);
		assert.equal(passwordsMatch('', secret), false);
		assert.equal(passwordsMatch('autre', secret), false);
	});

	it('accepte le mot de passe exact', () => {
		assert.equal(passwordsMatch(secret, secret), true);
	});

	it('ouvre une session avec le bon secret et la referme ensuite', () => {
		const token = issueAccessToken(secret, now, ttl);
		assert.equal(accessTokenValid(token, secret, now + ttl - 1), true);
		assert.equal(accessTokenValid(token, secret, now + ttl), false);
		assert.equal(accessTokenValid(token, 'autre', now + 1), false);
		assert.equal(accessTokenValid(undefined, secret, now + 1), false);
		assert.equal(accessTokenValid('pas-un-jeton', secret, now + 1), false);
	});

	it('refuse un jeton modifié', () => {
		const token = issueAccessToken(secret, now, ttl);
		const tampered = `${now + ttl + 86_400_000}${token.slice(token.indexOf('.'))}`;
		assert.equal(accessTokenValid(tampered, secret, now + 1), false);
	});
});
