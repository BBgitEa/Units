
// Описываем структуру одного узла дерева
export interface TreeNodeData {
  id: string;
  label: string;
  children?: TreeNodeData[];
  // Добавим уровень для корректных отступов, если его еще нет
  level?: number; 
}

// Описываем функции, которые мы будем передавать через контекст
export interface TreeContext {
  addNode: (parentId: string) => void;
  deleteNode: (nodeId: string) => void;
}