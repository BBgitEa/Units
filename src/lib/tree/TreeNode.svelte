<script lang="ts">
	import { getContext } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import TreeNode from './TreeNode.svelte';
	import type { TreeNodeData, TreeContext } from './treeTypes';
	
	// Импортируем иконки
	import { PlusCircle, Trash2 } from 'lucide-svelte';

	let { node, selectedId = $bindable() }: {
		node: TreeNodeData;
		selectedId?: string;
	} = $props();

	// Получаем функции из контекста
	const { addNode, deleteNode } = getContext<TreeContext>('tree-context');

	let expanded = $state(true);

	function toggle(e: MouseEvent) {
		e.stopPropagation(); // Предотвращаем выбор узла при клике на иконку '▾'
		expanded = !expanded;
	}

	function selectNode() {
		selectedId = node.id;
	}

	// --- Функции для кнопок действий ---
	function handleAdd(e: MouseEvent) {
		e.stopPropagation(); // Важно! Останавливаем всплытие, чтобы не сработал selectNode
		addNode(node.id);
		expanded = true; // Раскрываем узел, чтобы увидеть нового потомка
	}

	function handleDelete(e: MouseEvent) {
		e.stopPropagation(); // И здесь тоже
		deleteNode(node.id);
	}
</script>

<li>
	<div
		class="node"
		class:selected={selectedId === node.id}
		onclick={selectNode}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && selectNode()}
		style:--level={node.level ?? 0}
	>
		<!-- Иконка для сворачивания/разворачивания -->
		{#if node.children?.length}
			<div class="icon-toggle" onclick={toggle}>
				{expanded ? '▾' : '▸'}
			</div>
		{:else}
			<div class="icon-toggle spacer"></div>
		{/if}

		<span>{node.label}</span>

		<!-- Кнопки действий, появляются при наведении -->
		<div class="actions">
			<button class="action-btn" title="Добавить дочерний узел" onclick={handleAdd}>
				<PlusCircle size={16} />
			</button>
			<button class="action-btn" title="Удалить узел" onclick={handleDelete}>
				<Trash2 size={16} />
			</button>
		</div>
	</div>

	<!-- Рекурсивный рендеринг дочерних узлов -->
	{#if expanded && node.children?.length}
		<ul transition:slide|local={{ duration: 200, easing: quintOut }}>
			{#each node.children as childNode}
				<TreeNode node={childNode} bind:selectedId />
			{/each}
		</ul>
	{/if}
</li>

<style>
	li { list-style: none; margin: 0; padding: 0; }
	.node {
		display: flex;
		align-items: center;
		padding: 4px 8px;
		cursor: pointer;
		border-radius: 4px;
		user-select: none;
        /* Добавляем position: relative для позиционирования .actions */
        position: relative;
	}
	.node:hover { background-color: var(--background-secondary-color); }
	.node.selected { 
		background-color: var(--background-secondary-color);
		color: var(--primary-color); }
	
    /* Изменил имя класса, чтобы было понятнее */
	.icon-toggle {
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 5px;
		flex-shrink: 0;
	}
	.icon-toggle.spacer { width: 20px; }
	
    /* Стили для кнопок действий */
    .actions {
        display: none; /* Скрыты по умолчанию */
        margin-left: auto; /* Прижимаем к правому краю */
        padding-left: 8px;
        background-color: inherit; /* Наследуем фон от родителя, чтобы перекрыть текст */
    }
    .node:hover .actions {
        display: flex; /* Показываем при наведении на .node */
        align-items: center;
        gap: 4px;
    }
    .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 50%;
        color: whie;
    }
    .action-btn:hover {
        background-color: rgba(255, 255, 255, 0.233);
        color: white;
    }
</style>