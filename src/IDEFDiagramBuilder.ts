
import type { IDEF0Diagram, Flow, FlowEndpoint, BlockSide, RenderableDiagram, RenderableBlock, RenderableArrow, Point, Rect, RenderableArrowLabel } from './types';
import { divideSegment, route90DegreePath, doRectsIntersect } from './DiagramBuildUtils';
import { v4 as uuidv4 } from 'uuid';

export interface BuilderConfig {
  diagramWidth: number;
  diagramHeight: number;
  minBlockWidth: number;
  minBlockHeight: number;
  arrowSpacing: number;
  labelWidth: number;
  labelHeight: number;
}

type BlockSideCounts = Record<BlockSide, number>;
type AttachmentPoints = Record<BlockSide, Point[]>;

export class IDEFDiagramBuilder {
    
    private readonly parsedDiagram: IDEF0Diagram;
    private readonly config: BuilderConfig;
    private blockArrowCounts: Map<string, BlockSideCounts> = new Map();
    private blockRects: Map<string, Rect> = new Map();
    private blockAttachmentPoints: Map<string, AttachmentPoints> = new Map();
    private blockAttachmentUsage: Map<string, BlockSideCounts> = new Map();

  constructor(parsedDiagram: IDEF0Diagram, config: BuilderConfig) {
    this.parsedDiagram = parsedDiagram;
    this.config = config;
  }

  public build(): RenderableDiagram {
    this._calculateBlockArrowCounts();
    this._calculateBlockRects();
    this._generateBlockAttachmentPoints();
    
    const renderableBlocks = this._createRenderableBlocks();
    const renderableArrows = this._routeFlows();
    
    return {
      blocks: renderableBlocks,
      arrows: renderableArrows,
      width: this.config.diagramWidth,
      height: this.config.diagramHeight,
    };
  }
  
  
  private _createRenderableBlocks(): RenderableBlock[] {
    return Array.from(this.blockRects.entries()).map(([id, rect]) => ({
      id,
      text: this.parsedDiagram.activities.find(a => a.id === id)?.label || '',
      rect,
    }));
  }
  private _calculateBlockArrowCounts(): void {
    this.parsedDiagram.activities.forEach(a => {
        this.blockArrowCounts.set(a.id, { input: 0, output: 0, control: 0, mechanism: 0 });
        this.blockAttachmentUsage.set(a.id, { input: 0, output: 0, control: 0, mechanism: 0 });
    });
    this.parsedDiagram.flows.forEach(flow => {
      if (flow.source.type === 'block') {
        const sourceBlock = flow.source;
        sourceBlock.activityIds.forEach(id => { this.blockArrowCounts.get(id)![sourceBlock.side]++; });
      }
      if (flow.target.type === 'block') {
        const targetBlock = flow.target;
        targetBlock.activityIds.forEach(id => { this.blockArrowCounts.get(id)![targetBlock.side]++; });
      }
    });
  }
  private _calculateBlockRects(): void {
    const { activities } = this.parsedDiagram;
    const { diagramWidth, diagramHeight, minBlockWidth, minBlockHeight, arrowSpacing } = this.config;
    const n = activities.length;
    const PADDING = Math.min(diagramWidth, diagramHeight) * 0.15;
    const contentRect: Rect = { x: PADDING, y: PADDING, w: diagramWidth - PADDING * 2, h: diagramHeight - PADDING * 2 };
    activities.forEach((activity, i) => {
      const counts = this.blockArrowCounts.get(activity.id)!;
      const dynamicHeight = Math.max(minBlockHeight, Math.max(counts.input, counts.output) * arrowSpacing * 1.5);
      const dynamicWidth = Math.max(minBlockWidth, Math.max(counts.control, counts.mechanism) * arrowSpacing * 1.5);
      const t = n > 1 ? (i + 0.5) / n : 0.5;
      const centerX = contentRect.x + t * contentRect.w;
      const centerY = contentRect.y + t * contentRect.h;
      const rect: Rect = { x: centerX - dynamicWidth / 2, y: centerY - dynamicHeight / 2, w: dynamicWidth, h: dynamicHeight };
      this.blockRects.set(activity.id, rect);
    });
  }
  private _generateBlockAttachmentPoints(): void {
    this.parsedDiagram.activities.forEach(activity => {
        const rect = this.blockRects.get(activity.id)!;
        const counts = this.blockArrowCounts.get(activity.id)!;
        const points: AttachmentPoints = {
          input: divideSegment({ x: rect.x, y: rect.y }, { x: rect.x, y: rect.y + rect.h }, counts.input),
          output: divideSegment({ x: rect.x + rect.w, y: rect.y }, { x: rect.x + rect.w, y: rect.y + rect.h }, counts.output),
          control: divideSegment({ x: rect.x, y: rect.y }, { x: rect.x + rect.w, y: rect.y }, counts.control),
          mechanism: divideSegment({ x: rect.x, y: rect.y + rect.h }, { x: rect.x + rect.w, y: rect.y + rect.h }, counts.mechanism),
        };
        this.blockAttachmentPoints.set(activity.id, points);
      });
  }
  private _createArrowLabel(path: Point[], isExternal: boolean, labelText: string): RenderableArrowLabel {
    let labelCenterPoint: Point;
    if (isExternal) {
        const p0 = path[0], p1 = path[1];
        if (!p1) return { text: labelText, rect: {x:0, y:0, w:0, h:0}};
        const segmentLength = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        const offset = Math.min(this.config.labelWidth / 2 + 15, segmentLength);
        labelCenterPoint = { x: p0.x + offset * (p1.x - p0.x) / segmentLength, y: p0.y + offset * (p1.y - p0.y) / segmentLength };
    } else {
        let longestSegment = { start: path[0], end: path[1], length: 0 };
        for (let i = 0; i < path.length - 1; i++) {
            const len = Math.hypot(path[i+1].x - path[i].x, path[i+1].y - path[i].y);
            if (len > longestSegment.length) {
                longestSegment = { start: path[i], end: path[i+1], length: len };
            }
        }
        labelCenterPoint = { x: (longestSegment.start.x + longestSegment.end.x) / 2, y: (longestSegment.start.y + longestSegment.end.y) / 2 };
    }
    const labelRect: Rect = { x: labelCenterPoint.x - this.config.labelWidth / 2, y: labelCenterPoint.y - this.config.labelHeight / 2, w: this.config.labelWidth, h: this.config.labelHeight };
    return { text: labelText, rect: labelRect };
  }
  
  private _resolveLabelCollisions(arrows: RenderableArrow[]): void {
    
    
    const labels = arrows.map(a => a.label).filter(Boolean) as RenderableArrowLabel[];

    
    if (labels.length < 2) {
      return;
    }

    const MAX_ITERATIONS = 0; 
    const REPULSION_STRENGTH = 2; 

    const getRectCenter = (rect: Rect) => ({
      x: rect.x + rect.w / 2,
      y: rect.y + rect.h / 2,
    });

    
    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
      let collisionsFound = false;

      
      for (let i = 0; i < labels.length; i++) {
        for (let j = i + 1; j < labels.length; j++) {
          const labelA = labels[i];
          const labelB = labels[j];

          if (doRectsIntersect(labelA.rect, labelB.rect)) {
            collisionsFound = true;

            

            
            const centerA = getRectCenter(labelA.rect);
            const centerB = getRectCenter(labelB.rect);

            
            let vecX = centerB.x - centerA.x;
            let vecY = centerB.y - centerA.y;

            
            const distance = Math.sqrt(vecX * vecX + vecY * vecY);

            
            
            
            const pushAmount = REPULSION_STRENGTH / 2;
            let pushX = 0;
            let pushY = 0;
            
            if (distance > 0) {
              pushX = (vecX / distance) * pushAmount;
              pushY = (vecY / distance) * pushAmount;
            } else {
              
              pushY = pushAmount;
            }
            
            
            
            labelA.rect.x -= pushX;
            labelA.rect.y -= pushY;

            
            labelB.rect.x += pushX;
            labelB.rect.y += pushY;
          }
        }
      }

      
      if (!collisionsFound) {
        break;
      }
    }
  }


  /**
   * Логика маршрутизации для корректной обработки разветвленных стрелок.
   */
  private _routeFlows(): RenderableArrow[] {
    const arrows: RenderableArrow[] = [];
    const { diagramWidth, diagramHeight } = this.config;

    this.parsedDiagram.flows.forEach(flow => {
        let labelAdded = false;
        const externalDirMap: Record<BlockSide, BlockSide> = { input: 'output', output: 'input', control: 'mechanism', mechanism: 'control' };

        
        if (flow.source.type === 'block' && flow.target.type === 'block') {
            const sourceBlock = flow.source;
            const targetBlock = flow.target;

            
            const sourceUsageCount = this.blockAttachmentUsage.get(sourceBlock.activityIds[0])![sourceBlock.side]++;
            const sourcePoint = this.blockAttachmentPoints.get(sourceBlock.activityIds[0])![sourceBlock.side][sourceUsageCount];
            const source = { point: sourcePoint, dir: sourceBlock.side };

            targetBlock.activityIds.forEach(targetId => {
                const targetUsageCount = this.blockAttachmentUsage.get(targetId)![targetBlock.side]++;
                const targetPoint = this.blockAttachmentPoints.get(targetId)![targetBlock.side][targetUsageCount];
                const target = { point: targetPoint, dir: targetBlock.side };
                
                const path = route90DegreePath(source, target);
                const label = !labelAdded && flow.label ? this._createArrowLabel(path, false, flow.label) : undefined;
                if (label) labelAdded = true;
                arrows.push({ id: uuidv4(), path, label });
            });
        }
        
        
        else if (flow.source.type === 'external' && flow.target.type === 'block') {
            const targetBlock = flow.target;

            
            const anchorId = targetBlock.activityIds[0];
            const anchorSide = targetBlock.side;
            const anchorUsageCount = this.blockAttachmentUsage.get(anchorId)![anchorSide];
            const anchorPoint = this.blockAttachmentPoints.get(anchorId)![anchorSide][anchorUsageCount];

            
            let sourcePoint: Point;
            switch(anchorSide) {
                case 'input':     sourcePoint = { x: 0, y: anchorPoint.y }; break;
                case 'control':   sourcePoint = { x: anchorPoint.x, y: 0 }; break;
                case 'mechanism': sourcePoint = { x: anchorPoint.x, y: diagramHeight }; break;
                default:          sourcePoint = { x: 0, y: anchorPoint.y };
            }
            const source = { point: sourcePoint, dir: externalDirMap[anchorSide] };

            
            targetBlock.activityIds.forEach(targetId => {
                const usageCount = this.blockAttachmentUsage.get(targetId)![targetBlock.side]++;
                const targetPoint = this.blockAttachmentPoints.get(targetId)![targetBlock.side][usageCount];
                const target = { point: targetPoint, dir: targetBlock.side };

                const path = route90DegreePath(source, target);
                const label = !labelAdded && flow.label ? this._createArrowLabel(path, true, flow.label) : undefined;
                if (label) labelAdded = true;
                arrows.push({ id: uuidv4(), path, label });
            });
        }

        
        else if (flow.source.type === 'block' && flow.target.type === 'external') {
            const sourceBlock = flow.source;

            
            const anchorId = sourceBlock.activityIds[0];
            const anchorSide = sourceBlock.side;
            const anchorUsageCount = this.blockAttachmentUsage.get(anchorId)![anchorSide];
            const anchorPoint = this.blockAttachmentPoints.get(anchorId)![anchorSide][anchorUsageCount];
            const source = { point: anchorPoint, dir: anchorSide };

            
            let targetPoint: Point;
            switch(anchorSide) {
                case 'output': targetPoint = { x: diagramWidth, y: anchorPoint.y }; break;
                default:       targetPoint = { x: diagramWidth, y: anchorPoint.y };
            }
            const target = { point: targetPoint, dir: externalDirMap[anchorSide] };
            
            
            sourceBlock.activityIds.forEach(id => { this.blockAttachmentUsage.get(id)![sourceBlock.side]++; });
            
            const path = route90DegreePath(source, target);
            const label = flow.label ? this._createArrowLabel(path, true, flow.label) : undefined;
            arrows.push({ id: uuidv4(), path, label });
        }
    });

    this._resolveLabelCollisions(arrows);
    return arrows;
  }
}