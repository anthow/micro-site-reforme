alter table public."Mobilisation"
	add column lien text,
	add column abonnement boolean not null default false;

comment on column public."Mobilisation".lien is
	'Si renseigné, la carte ouvre cette adresse et il n''y a pas de page article.';

comment on column public."Mobilisation".abonnement is
	'La lecture sur le site d''origine demande un abonnement.';
