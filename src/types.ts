


export type BlockSide = 'input' | 'control' | 'output' | 'mechanism';

export type FlowEndpoint =
  | { type: 'external' }
  | { type: 'block'; side: BlockSide; activityIds: string[] };

export interface Activity {
  id: string;
  label: string;
}

export interface Flow {
  source: FlowEndpoint;
  target: FlowEndpoint;
  label: string;
}

export interface IDEF0Diagram {
  meta: { [key: string]: string };
  activities: Activity[];
  flows: Flow[];
}


export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };

export interface RenderableBlock {
  id: string;
  text: string;
  rect: Rect;
}

export interface RenderableArrowLabel {
  text: string;
  rect: Rect;
}

export interface RenderableArrow {
  id: string;
  path: Point[];
  label?: RenderableArrowLabel;
}

export interface RenderableDiagram {
  blocks: RenderableBlock[];
  arrows: RenderableArrow[];
  width: number;
  height: number;
}

interface BaseMetadata {
  label: string;
}

export interface NumberMetadata extends BaseMetadata {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

export interface StringMetadata extends BaseMetadata {
  type: 'string';
  maxLength?: number;
}

export type SettingMetadata = NumberMetadata | StringMetadata;


export type ConfigMetadata = {
  [key: string]: SettingMetadata;
};

export type BuilderConfig = {
  [key: string]: number | string;
};