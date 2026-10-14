export function reponseRecaptchaValide(corps: unknown): boolean {
	if (!corps || typeof corps !== 'object') return false;
	return (corps as { success?: unknown }).success === true;
}
