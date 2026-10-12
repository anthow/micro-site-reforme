const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function decodeAttr(value: string): string {
	const named = value
		.replace(/&amp;/gi, '&')
		.replace(/&quot;/gi, '"')
		.replace(/&apos;|&#0*39;/gi, "'")
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>');

	return named.replace(/&#x([0-9a-f]+);|&#([0-9]+);/gi, (_, hex: string | undefined, dec: string | undefined) => {
		const code = hex ? Number.parseInt(hex, 16) : Number.parseInt(dec ?? '', 10);
		if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return '';
		return String.fromCodePoint(code);
	});
}

function normalizeUrl(value: string): string {
	return decodeAttr(value).replace(CONTROL_CHARS, '').trim();
}

export function safeHref(value: string): string | null {
	const href = normalizeUrl(value);
	if (!href) return null;
	if (/^(javascript|data|vbscript):/i.test(href)) return null;
	if (href.startsWith('#')) {
		return /^#[A-Za-z0-9_-]+$/.test(href) ? href : null;
	}

	try {
		const url = new URL(href);
		if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
	} catch {
		return null;
	}

	return null;
}

export function safeResourceUrl(value: string | null | undefined): string | null {
	if (!value) return null;
	const candidate = normalizeUrl(value);
	if (!candidate || /^(javascript|data|vbscript):/i.test(candidate)) return null;
	if (candidate.startsWith('/') && !candidate.startsWith('//') && !candidate.includes('\\')) {
		return candidate;
	}
	return safeHref(candidate);
}
