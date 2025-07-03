import type { SvelteComponent, ComponentProps } from 'svelte';
import type { Home } from 'lucide-svelte';

type IconProps = ComponentProps<Home>;
export type IconComponent = typeof SvelteComponent<IconProps>;

export interface TabInfo {
  id: symbol;
  title: string;
  icon?: IconComponent;
}

export interface TabsContext {
  registerTab: (tab: TabInfo) => void;
  unregisterTab: (id: symbol) => void;
  activeTabId: { value: symbol | null };
  selectTab: (id: symbol) => void;
}