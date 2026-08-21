export const MAIL_SUBJECT = 'Réforme des CISP : laissez-nous travailler';

export function buildMessage(nom: string, sexe: 'M' | 'F' | null = null): string {
	const ouverture = sexe === 'F' ? `Madame ${nom}` : sexe === 'M' ? `Monsieur ${nom}` : `Madame, Monsieur ${nom}`;
	const cloture = sexe === 'F' ? 'Madame' : sexe === 'M' ? 'Monsieur' : 'Madame, Monsieur';

	return `${ouverture},

Je vous contacte au sujet de la réforme des Centres d’Insertion Socioprofessionnelle (CISP) envisagée par le Gouvernement wallon.

Chaque année, des milliers de Wallonnes et de Wallons éloignés de l’emploi sont accompagnés par les CISP. Depuis plus de quarante ans, ce modèle s’appuie sur un accompagnement global et sur le temps nécessaire à chacun pour construire un projet durable — pas seulement sur un retour immédiat vers le marché du travail.

Je vous demande de défendre ce modèle d’insertion, afin qu’il ne soit pas affaibli par des parcours uniquement calés sur les besoins immédiats des entreprises et par une réduction de l’autonomie des acteurs de terrain.

Je vous prie d’agréer, ${cloture}, l’expression de ma haute considération.`;
}

export function buildMailLinks(options: {
	to: string;
	subject: string;
	body: string;
	bcc?: string | null;
}): { mailto: string; gmail: string; outlook: string } {
	const to = encodeURIComponent(options.to);
	const subject = encodeURIComponent(options.subject);
	const body = encodeURIComponent(options.body);
	const bccValue = options.bcc?.trim() ?? '';
	const bcc = bccValue ? encodeURIComponent(bccValue) : '';

	const mailtoParams = [`subject=${subject}`, `body=${body}`];
	const gmailParams = [`view=cm`, `fs=1`, `to=${to}`, `su=${subject}`, `body=${body}`];
	const outlookParams = [`to=${to}`, `subject=${subject}`, `body=${body}`];

	if (bcc) {
		mailtoParams.push(`bcc=${bcc}`);
		gmailParams.push(`bcc=${bcc}`);
		outlookParams.push(`bcc=${bcc}`);
	}

	return {
		mailto: `mailto:${options.to}?${mailtoParams.join('&')}`,
		gmail: `https://mail.google.com/mail/?${gmailParams.join('&')}`,
		outlook: `https://outlook.live.com/mail/0/deeplink/compose?${outlookParams.join('&')}`
	};
}

export type DestinataireRole = 'depute' | 'ministre';

const PARTI_ORDRE = ['mr', 'les engages', 'ps', 'ptb', 'ecolo'];
const PARTIS_MAJORITE = new Set(['mr', 'les engages']);

function normalizeParti(parti: string | null | undefined): string {
	return (parti ?? '')
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{M}/gu, '');
}

export function estPartiMajorite(parti: string | null | undefined): boolean {
	return PARTIS_MAJORITE.has(normalizeParti(parti));
}

function partiRank(parti: string | null | undefined): number {
	const index = PARTI_ORDRE.indexOf(normalizeParti(parti));
	return index === -1 ? PARTI_ORDRE.length : index;
}

export function compareDestinatairesParPartiPuisNom<T extends { nom: string; parti: string | null }>(
	a: T,
	b: T
): number {
	const byParti = partiRank(a.parti) - partiRank(b.parti);
	if (byParti !== 0) return byParti;
	return a.nom.localeCompare(b.nom, 'fr');
}

export function sortByPartiPuisNom<T extends { nom: string; parti: string | null }>(items: T[]): T[] {
	return [...items].sort(compareDestinatairesParPartiPuisNom);
}

export function destinataireDetail(options: {
	role: DestinataireRole;
	circonscription: string | null;
	fonction: string | null;
	parti: string | null;
}): string {
	const lieuOuFonction =
		options.role === 'ministre' ? options.fonction?.trim() : options.circonscription?.trim();
	const parts = [lieuOuFonction, options.parti?.trim()].filter(Boolean);
	return parts.join(' · ');
}

export function destinataireLabel(options: {
	nom: string;
	role: DestinataireRole;
	circonscription: string | null;
	fonction: string | null;
	parti: string | null;
}): string {
	const detail = destinataireDetail(options);
	return detail ? `${options.nom} — ${detail}` : options.nom;
}

export function destinataireLabelDansCirconscription(options: {
	nom: string;
	parti: string | null;
}): string {
	const parti = options.parti?.trim();
	return parti ? `${options.nom} — ${parti}` : options.nom;
}

export function listCirconscriptions(items: { circonscription: string | null }[]): string[] {
	const names = new Set<string>();
	for (const item of items) {
		const name = item.circonscription?.trim();
		if (name) names.add(name);
	}
	return [...names].sort((a, b) => a.localeCompare(b, 'fr'));
}
