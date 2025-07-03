<script lang="ts">
	import type { ConfigMetadata } from '../types';
    import type { BuilderConfig } from '../IDEFDiagramBuilder';

	let {
		config,
		metadata
	}: {
		config: BuilderConfig;
		metadata: ConfigMetadata;
	} = $props();
</script>

<div class="settings-list">
	{#each Object.entries(metadata) as [key, meta]}
		<div class="setting-item">
			<label for={key}>{meta.label}</label>

			{#if meta.type === 'number'}
				<input
					type="number"
					id={key}
					min={meta.min}
					max={meta.max}
					step={meta.step ?? 1}
					bind:value={config[key]}
				/>
			{:else if meta.type === 'string'}
				<input
					type="text"
					id={key}
					maxlength={meta.maxLength}
					bind:value={config[key]}
				/>
			{/if}
		</div>
	{/each}
</div>

<style>
	.settings-list { 
        display: flex; 
        flex-direction: column; 
        gap: 1rem; 
        padding: 1rem;
    }

	.setting-item { 
        display: grid; 
        grid-template-columns: 1fr 1fr;
         align-items: start; 
         gap: 1rem; 
    }

	label { 
        text-align: left; 
    }
	input { 
        padding: 8px; 
        border: 1px solid var(--secondary-color); 
        border-radius: 4px; 
        background-color: var(--background-secondary-color);
        font-size: 1rem; width: 100%; box-sizing: border-box; }
</style>