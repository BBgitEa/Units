<script lang="ts">
	import { getContext, onDestroy, type Snippet, type SvelteComponent } from 'svelte';
	import type { TabsContext, IconComponent } from './tabTypes';

	let {
		title,
		icon,
		children
	}: {
		title: string;
		icon?: IconComponent; 
		children: Snippet;
	} = $props();

	const id = Symbol('tab');

	const { registerTab, unregisterTab, activeTabId } = getContext<TabsContext>('tabs-context');

	registerTab({ id, title, icon }); 

	onDestroy(() => {
		unregisterTab(id);
	});
</script>

{#if activeTabId.value === id}
	{@render children()}
{/if}