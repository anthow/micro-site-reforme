export const siteTitle = 'Réforme du secteur CISP';

export type OrganizationProfile = {
	name: string;
	legalName?: string;
	description?: string;
	logoPath?: string;
	email?: string;
	sameAs?: string[];
};

/** Vide tant que le nom officiel, le logo et l’URL ne sont pas confirmés. */
export const organizationProfile: OrganizationProfile | null = null;
