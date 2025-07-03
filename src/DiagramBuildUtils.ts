
import type { BlockSide, Point, Rect} from './types';

export function divideSegment(p1: Point, p2: Point, count: number): Point[] {
  
  if (count <= 0) return [];
  const points: Point[] = [];
  const totalSegments = count + 1;
  for (let i = 1; i <= count; i++) {
    const t = i / totalSegments;
    const x = p1.x + t * (p2.x - p1.x);
    const y = p1.y + t * (p2.y - p1.y);
    points.push({ x, y });
  }
  return points;
}

/**
 * Алгоритм маршрутизации стрелок.
 */
export function route90DegreePath(
  start: { point: Point; dir: BlockSide | 'external' },
  end: { point: Point; dir: BlockSide | 'external' },
  buffer: number = 20
): Point[] {
  const path: Point[] = [start.point];
  const p1 = start.point;
  const p2 = end.point;

  const isStartHorizontal = start.dir === 'input' || start.dir === 'output';
  const isEndHorizontal = end.dir === 'input' || end.dir === 'output';

  
  if (isStartHorizontal !== isEndHorizontal) {
    if (isStartHorizontal) {
      path.push({ x: p2.x, y: p1.y });
    } else {
      path.push({ x: p1.x, y: p2.y });
    }
  }
  
  else {
    if (isStartHorizontal) { 
      const midX = p1.x + (p2.x - p1.x) / 2;
      path.push({ x: midX, y: p1.y });
      path.push({ x: midX, y: p2.y });
    } else { 
      const midY = p1.y + (p2.y - p1.y) / 2;
      path.push({ x: p1.x, y: midY });
      path.push({ x: p2.x, y: midY });
    }
  }
  
  path.push(p2);
  return path;
}


/**
 * Проверяет, пересекаются ли два прямоугольника.
 */
export function doRectsIntersect(r1: Rect, r2: Rect): boolean {
  return !(
    r2.x > r1.x + r1.w || 
    r2.x + r2.w < r1.x || 
    r2.y > r1.y + r1.h || 
    r2.y + r2.h < r1.y    
  );
}