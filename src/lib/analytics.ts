const MESURE = /^G-[A-Z0-9]+$/i;

/** Accepte uniquement un ID de mesure GA4 (G-…). */
export function idMesureGa(value: string | null | undefined): string | null {
	const id = value?.trim() ?? '';
	return MESURE.test(id) ? id : null;
}

declare global {
	interface Window {
		dataLayer: unknown[];
		gtag: (...args: unknown[]) => void;
	}
}

export {};
