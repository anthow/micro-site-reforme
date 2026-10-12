import { env } from '$env/dynamic/private';
import { accessTokenValid } from './deputeAccess';

export function deputePagePassword(): string {
	return env.DEPUTE_PAGE_PASSWORD?.trim() ?? '';
}

export function deputeAccessGranted(token: string | undefined, nowMs = Date.now()): boolean {
	return accessTokenValid(token, deputePagePassword(), nowMs);
}
