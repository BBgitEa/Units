<script lang="ts">
	import * as monaco from 'monaco-editor';
	import { untrack } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	
	// Импортируем язык
	import '../idefscript.js';

	let {
		value = $bindable(""), 
		language = 'javascript', 
		theme = 'vs-dark', 
	} = $props<{
		value?: string;
		language?: string;
		theme?: 'vs-dark' | 'vs-light';
	}>();

	let container: HTMLDivElement; 
	let editor: monaco.editor.IStandaloneCodeEditor | undefined;
	let resizeObserver: ResizeObserver;

	const dispatch = createEventDispatcher();

	$effect(() => {
		if (container) {
			editor = monaco.editor.create(container, {
				value: untrack(() => value),
				language,
				theme,
				automaticLayout: false,
				glyphMargin: false,
				minimap: {
					enabled: false
				}
			});
			
			// Слушаем изменения в редакторе и обновляем связанное состояние `value`
			editor.onDidChangeModelContent(() => {
				value = editor!.getValue();
				dispatch('input', value);
			});

			// Наблюдаем за изменением размера контейнера и обновляем макет редактора
			resizeObserver = new ResizeObserver(() => {
				editor?.layout();
			});
			resizeObserver.observe(container);
		}

		return () => {
			resizeObserver?.disconnect();
			editor?.dispose();
		};
	});

	$effect(() => {
		if (editor && editor.getValue() !== value) {
			editor.setValue(value);
		}
	});


	$effect(() => {
		if (editor && language) {
			monaco.editor.setModelLanguage(editor.getModel()!, language);
		}
	});

</script>

<div bind:this={container} class="editor-container"></div>

<style>
	.editor-container {
		width: 100%;
		height: 100%;
		display: flex;
	}
</style>

