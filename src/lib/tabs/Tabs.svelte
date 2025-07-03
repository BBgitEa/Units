<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import type { TabInfo, TabsContext } from './tabTypes';

	let { children }: { children: Snippet } = $props();

	let tabs = $state<TabInfo[]>([]);
	let activeTabId = $state<symbol | null>(null);

	const tabRegistry = {
		registerTab: (tab: TabInfo) => {
			tabs.push(tab);
			if (activeTabId === null) {
				activeTabId = tab.id;
			}
		},
		unregisterTab: (id: symbol) => {
			tabs = tabs.filter((t) => t.id !== id);
			if (activeTabId === id) {
				activeTabId = tabs[0]?.id ?? null;
			}
		},
		selectTab: (id: symbol) => {
			activeTabId = id;
		},
		activeTabId: {
			get value() {
				return activeTabId;
			}
		}
	};

	setContext<TabsContext>('tabs-context', tabRegistry);
</script>

<div class="tabs-container">
	<div class="tabs-nav">
		{#each tabs as tab (tab.id)}
			<button
				class="tab-button"
				class:active={activeTabId === tab.id}
				onclick={() => tabRegistry.selectTab(tab.id)}
			>
				{#if tab.icon}
					{@const Icon = tab.icon}
					<Icon size={18} strokeWidth={2.5} />
				{/if}
				{tab.title}
			</button>
		{/each}
	</div>

	<div class="tab-content">
		{@render children()}
	</div>
</div>

<style>
	.tabs-container {
		overflow: hidden;
		height: 100%;
		box-sizing: border-box;
	}

	.tabs-nav {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		border-bottom: 1px solid var(--background-secondary-color);
	}

	.tab-button {
		padding: 10px 18px;
		border: none;
		background-color: transparent;
		cursor: pointer;
		font-size: 16px;
		border-bottom: 3px solid transparent;
		margin-bottom: -1px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		flex: 1;
		transition: background-color 0.1s, color 0.1s;
	}

	.tab-button:hover {
		background-color: var(--background-secondary-color);
	}

	.tab-button.active {
		color: var(--primary-color);
		border-bottom: 3px solid var(--primary-color);
	}

	.tab-content {
		height: 100%;
	}
</style>