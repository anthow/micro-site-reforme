<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Article introuvable</title>
	<meta name="description" content="Cet article de mobilisation n'est pas disponible." />
</svelte:head>

<section class="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
	<h1 class="font-heading text-3xl font-bold tracking-tighter text-ink-light dark:text-ink-dark">
		Article introuvable
	</h1>
	<p class="mt-4 font-heading text-base font-medium text-ink-light/80 dark:text-ink-dark/80">
		{page.status === 404
			? "Cet article n'existe pas ou n'est pas publié."
			: "L'article n'a pas pu être affiché."}
	</p>
	<p class="mt-8">
		<a
			href="/mobilisation"
			class="font-heading text-sm font-semibold tracking-tight text-accent underline decoration-accent/40 underline-offset-4"
		>
			Retour à la mobilisation
		</a>
	</p>
</section>
