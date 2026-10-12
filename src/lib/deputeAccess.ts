import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const DEPUTE_ACCESS_COOKIE = 'depute_acces';
export const DEPUTE_ACCESS_TTL_MS = 12 * 60 * 60 * 1000;

export function passwordsMatch(input: string, expected: string): boolean {
	if (!expected) return false;
	const a = createHash('sha256').update(input, 'utf8').digest();
	const b = createHash('sha256').update(expected, 'utf8').digest();
	return sameBytes(a, b);
}

export function issueAccessToken(password: string, nowMs: number, ttlMs: number): string {
	const payload = String(nowMs + ttlMs);
	const signature = createHmac('sha256', password).update(payload).digest('hex');
	return `${payload}.${signature}`;
}

export function accessTokenValid(
	token: string | undefined,
	password: string,
	nowMs: number
): boolean {
	if (!token || !password) return false;
	const dot = token.indexOf('.');
	if (dot <= 0) return false;

	const payload = token.slice(0, dot);
	const signature = token.slice(dot + 1);
	const expected = createHmac('sha256', password).update(payload).digest('hex');
	const fresh = Number(payload) > nowMs;
	const a = createHash('sha256').update(signature).digest();
	const b = createHash('sha256').update(expected).digest();
	return fresh && sameBytes(a, b);
}

function sameBytes(a: Buffer, b: Buffer): boolean {
	return timingSafeEqual(new Uint8Array(a), new Uint8Array(b));
}
