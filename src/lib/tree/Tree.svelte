<script lang="ts">
	import { setContext } from 'svelte';
	import TreeNode from './TreeNode.svelte';
	import type { TreeNodeData, TreeContext } from './treeTypes';

	let { data = $bindable(), selectedId = $bindable() }: {
		data: TreeNodeData[];
		selectedId?: string;
	} = $props();

	// --- ЛОГИКА МОДИФИКАЦИИ ДЕРЕВА ---

	/** Рекурсивный поиск и удаление узла по ID */
	function findAndRemove(nodes: TreeNodeData[], id: string): TreeNodeData[] {
		// Фильтруем массив, удаляя узел, если ID совпал
		const filtered = nodes.filter(node => node.id !== id);

		// Если длина не изменилась, значит узел не на этом уровне. Ищем в дочерних.
		if (filtered.length === nodes.length) {
			return nodes.map(node => {
				if (node.children) {
					node.children = findAndRemove(node.children, id);
				}
				return node;
			});
		}
		return filtered;
	}

	/** Рекурсивный поиск родителя и добавление дочернего узла */
	function findAndAdd(nodes: TreeNodeData[], parentId: string) {
		for (const node of nodes) {
			if (node.id === parentId) {
				const newNode: TreeNodeData = {
					id: crypto.randomUUID(), // Генерируем уникальный ID
					label: 'Новый узел',
					children: []
				};
				// Инициализируем массив children, если его нет
				if (!node.children) {
					node.children = [];
				}
				node.children.push(newNode);
				return; // Выходим, как только нашли и добавили
			}
			if (node.children) {
				findAndAdd(node.children, parentId);
			}
		}
	}

	const deleteNode = (nodeId: string) => {
		// Svelte 5 требует переприсваивания для запуска реактивности на массивах
		data = findAndRemove(data, nodeId);
	};

	const addNode = (parentId: string) => {
		findAndAdd(data, parentId);
		// Переприсваивание для реактивности
		data = [...data];
	};

	// Передаем функции управления в контекст
	setContext<TreeContext>('tree-context', {
		addNode,
		deleteNode
	});
</script>

<div class="tree-container">
	<ul>
		{#each data as node}
			<TreeNode {node} bind:selectedId />
		{/each}
	</ul>
</div>

<style>
	/* Стили остаются без изменений */
	.tree-container { padding: 10px; height: 100%; }
	ul { padding: 0; margin: 0; }
</style>