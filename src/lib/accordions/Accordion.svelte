<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	const activeId = writable<string | null>(null);

	setContext('accordion-active-id', activeId);
</script>

<style>
	.accordion-container {
		border: 1px solid var(--background-secondary-color, #404040);
		border-radius: 8px;
		overflow: hidden;
	}
</style>

<div class="accordion-container">
	<slot />
</div>