import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	CONTACT_RECIPIENT,
	DELAI_MIN_MS,
	FENETRE_MS,
	JETON_DUREE_MS,
	MAX_ENVOIS,
	identique,
	lireContact,
	lireJeton,
	priseEnCompte,
	signerJeton
} from '../src/lib/contactForm.ts';
import { reponseRecaptchaValide } from '../src/lib/contactRecaptcha.ts';

const secret = 'secret-de-test-assez-long-pour-signer';
const valide = {
	nom: 'Anne Lulling',
	email: 'anne@exemple.be',
	message: 'Nous souhaitons être recontactés au sujet de la réforme.',
	organisme: ''
};

describe('message de contact', () => {
	it('accepte un message complet et fixe le destinataire', () => {
		assert.equal(CONTACT_RECIPIENT, 'communication@interfede.be');
		assert.deepEqual(lireContact(valide), {
			kind: 'pret',
			nom: 'Anne Lulling',
			email: 'anne@exemple.be',
			message: valide.message
		});
	});

	it('ignore un robot qui remplit le champ caché, sans signaler l’erreur', () => {
		assert.deepEqual(lireContact({ ...valide, organisme: 'spam inc' }), { kind: 'piege' });
	});

	it('refuse un nom vide, un e-mail invalide et un message trop court', () => {
		const decision = lireContact({
			nom: ' ',
			email: 'pas-un-email',
			message: 'court',
			organisme: ''
		});
		assert.equal(decision.kind, 'invalide');
		if (decision.kind !== 'invalide') return;
		assert.ok(decision.champs.nom);
		assert.ok(decision.champs.email);
		assert.ok(decision.champs.message);
	});

	it('retire les sauts de ligne d’un nom ou d’un e-mail', () => {
		const decision = lireContact({
			...valide,
			nom: 'Anne\r\nBcc: pirate@exemple.be',
			email: 'anne@exemple.be\nBcc: pirate@exemple.be'
		});
		assert.equal(decision.kind, 'invalide');
		if (decision.kind !== 'invalide') return;
		assert.ok(decision.champs.email);
	});

	it('refuse un message qui n’est qu’une liste de liens', () => {
		const decision = lireContact({
			...valide,
			message: 'https://a.be https://b.be https://c.be https://d.be'
		});
		assert.equal(decision.kind, 'invalide');
	});
});

describe('jeton du formulaire', () => {
	it('accepte le jeton après le délai et refuse une copie modifiée', () => {
		const emis = 1_000_000;
		const jeton = signerJeton(secret, emis, emis + JETON_DUREE_MS);
		assert.equal(lireJeton(secret, jeton, emis + DELAI_MIN_MS), 'ok');
		assert.equal(lireJeton(secret, jeton, emis + 500), 'trop_tot');
		assert.equal(lireJeton(secret, jeton, emis + JETON_DUREE_MS + 1), 'expire');
		assert.equal(lireJeton(secret, `${jeton}x`, emis + DELAI_MIN_MS), 'invalide');
		assert.equal(identique(jeton, jeton), true);
		assert.equal(identique(jeton, `${jeton}x`), false);
	});
});

describe('quota d’envoi', () => {
	it('bloque au-delà de cinq envois dans la fenêtre', () => {
		let instants = [];
		for (let i = 0; i < MAX_ENVOIS; i += 1) {
			const tour = priseEnCompte(instants, 10_000 + i, FENETRE_MS, MAX_ENVOIS);
			assert.equal(tour.autorise, true);
			instants = tour.suivants;
		}
		const bloque = priseEnCompte(instants, 10_000 + MAX_ENVOIS, FENETRE_MS, MAX_ENVOIS);
		assert.equal(bloque.autorise, false);
	});
});

describe('reCAPTCHA', () => {
	it('accepte uniquement une réponse Google réussie', () => {
		assert.equal(reponseRecaptchaValide({ success: true }), true);
		assert.equal(reponseRecaptchaValide({ success: false, 'error-codes': ['invalid-input-response'] }), false);
		assert.equal(reponseRecaptchaValide(null), false);
	});
});
