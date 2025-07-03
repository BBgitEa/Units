<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	const { title } = $props<{ title: string }>();

	const activeIdStore = getContext<Writable<string | null>>('accordion-active-id');
	const id = crypto.randomUUID();
	let isActive = $state(false);

	$effect(() => {
		const unsubscribe = activeIdStore.subscribe((activeId) => {
			isActive = activeId === id;
		});
		return unsubscribe;
	});

	function toggle() {
		activeIdStore.update((current) => (current === id ? null : id));
	}
</script>

<style>
	.item {
		border-bottom: 1px solid var(--background-secondary-color, #404040);
	}

	.item:last-child {
		border-bottom: none;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 1rem;
		background: none;
		border: none;
		color: var(--text-color, #ccc);
		cursor: pointer;
		font-size: 1.1rem;
		text-align: left;
	}

	.header:hover {
		background-color: var(--background-secondary-color, #404040);
	}

	.indicator {
		transition: transform 0.2s ease-in-out;
		font-weight: bold;
	}

	.indicator.active {
		transform: rotate(90deg);
	}

	.content {
		overflow: hidden;
		background-color: #2e2e2e;
	}

	.content-padding {
		padding: 0.5rem 1.5rem 1.5rem 1.5rem;
	}
</style>

<div class="item">
	<button class="header" onclick={toggle}>
		<span>{title}</span>
		<span class="indicator" class:active={isActive}>›</span>
	</button>
	{#if isActive}
		<div class="content" transition:slide={{ duration: 250, easing: quintOut }}>
			<div class="content-padding">
				<slot />
			</div>
		</div>
	{/if}
</div>