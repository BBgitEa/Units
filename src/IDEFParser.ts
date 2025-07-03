

import type { IDEF0Diagram, Activity, Flow, FlowEndpoint, BlockSide } from './types';

export class IDEFParser {

  /**
   * Главный метод, который парсит строку с IDF-Script в структурированный объект.
   * @param script Текстовое представление диаграммы.
   * @returns Объект IDEF0Diagram.
   */
  public parse(script: string): IDEF0Diagram {
    const lines = this.preprocessScript(script);

    const diagram: IDEF0Diagram = {
      meta: this.parseMetaBlock(lines),
      activities: this.parseActivitiesBlock(lines),
      flows: this.parseFlowsBlock(lines),
    };

    return diagram;
  }

  /**
   * Подготовка скрипта: удаление комментариев и пустых строк.
   */
  private preprocessScript(script: string): string[] {
    return script
      .split('\n')
      .map(line => line.replace(/#.*$/, '').trim()) 
      .filter(line => line.length > 0); 
  }

  /**
   * Извлекает содержимое блока (например, 'activities { ... }')
   */
  private findBlockContent(blockName: string, lines: string[]): string[] {
    const blockStartIndex = lines.findIndex(line => line.startsWith(`${blockName}`));
    if (blockStartIndex === -1) {
      
      return [];
    }

    const blockEndIndex = lines.findIndex((line, index) => index > blockStartIndex && line === '}');
    if (blockEndIndex === -1) {
      throw new Error(`Syntax Error: Unclosed block '${blockName}'. Missing '}'.`);
    }

    return lines.slice(blockStartIndex + 1, blockEndIndex);
  }

  /**
   * Парсит блок 'diagram' для извлечения метаданных.
   */
  private parseMetaBlock(lines: string[]): { [key: string]: string } {
    const metaContent = this.findBlockContent('diagram', lines);
    const meta: { [key:string]: string } = {};

    const metaRegex = /^\s*([a-zA-Z0-9_]+)\s*:\s*"([^"]+)"\s*$/;

    for (const line of metaContent) {
      const match = line.match(metaRegex);
      if (match) {
        const [, key, value] = match;
        meta[key] = value;
      } else {
        throw new Error(`Syntax Error: Invalid meta data line: "${line}"`);
      }
    }
    return meta;
  }

  /**
   * Парсит блок 'activities'.
   */
  private parseActivitiesBlock(lines: string[]): Activity[] {
    const activitiesContent = this.findBlockContent('activities', lines);
    const activities: Activity[] = [];

    const activityRegex = /^\s*activity\s*\(\s*([A-Za-z0-9_]+)\s*,\s*"([^"]+)"\s*\)\s*$/;

    for (const line of activitiesContent) {
      const match = line.match(activityRegex);
      if (match) {
        const [, id, label] = match;
        activities.push({ id, label });
      } else {
        throw new Error(`Syntax Error: Invalid activity definition: "${line}"`);
      }
    }
    return activities;
  }

  /**
   * Парсит блок 'flows'.
   */
  private parseFlowsBlock(lines: string[]): Flow[] {
    const flowsContent = this.findBlockContent('flows', lines);
    const flows: Flow[] = [];
    
    for (const line of flowsContent) {
      const [endpointsPart, labelPart] = line.split(':', 2).map(s => s.trim());
      if (!endpointsPart || !labelPart) {
        throw new Error(`Syntax Error: Invalid flow definition, missing ':' separator: "${line}"`);
      }
      
      const [sourceStr, targetStr] = endpointsPart.split('->').map(s => s.trim());
      if (!sourceStr || !targetStr) {
        throw new Error(`Syntax Error: Invalid flow definition, missing '->' operator: "${line}"`);
      }
      
      const label = labelPart.replace(/^"|"$/g, ''); 
      
      flows.push({
        source: this.parseEndpoint(sourceStr),
        target: this.parseEndpoint(targetStr),
        label,
      });
    }
    return flows;
  }

  /**
   * Парсит одну конечную точку потока (например, 'external' или 'input(A1)').
   */
  private parseEndpoint(endpointStr: string): FlowEndpoint {
    if (endpointStr === 'external') {
      return { type: 'external' };
    }

    const endpointRegex = /^(input|control|output|mechanism)\s*\(([^)]+)\)$/;
    const match = endpointStr.match(endpointRegex);

    if (match) {
      const [, side, idsStr] = match;
      const activityIds = idsStr.split(',').map(id => id.trim());
      return {
        type: 'block',
        side: side as BlockSide,
        activityIds,
      };
    }

    throw new Error(`Syntax Error: Invalid endpoint format: "${endpointStr}"`);
  }
}