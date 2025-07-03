<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';

  type Point = { x: number; y: number };

  type Props = {
    points: Point[];
    radius: number;
    arrowheadOffset?: number; 
  } & Omit<SVGAttributes<SVGPathElement>, 'points'>;

  const { points, radius, arrowheadOffset = 11, ...restProps } : Props = $props();

  const pathEndPoint = $derived(() => {
    if (points.length < 2) {
      return null;
    }
    const lastPoint = points[points.length - 1];
    const penultimatePoint = points[points.length - 2];

    const dx = lastPoint.x - penultimatePoint.x;
    const dy = lastPoint.y - penultimatePoint.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    // Если отрезок очень короткий, не делаем отступ, чтобы избежать артефактов
    if (len < arrowheadOffset) {
      return lastPoint;
    }
    
    // Нормализованный вектор направления
    const ux = dx / len;
    const uy = dy / len;

    // Новая конечная точка, сдвинутая назад
    return {
      x: lastPoint.x - ux * arrowheadOffset,
      y: lastPoint.y - uy * arrowheadOffset
    };
  });

  const pathData = $derived(() => {
    if (points.length < 2 || !pathEndPoint()) {
      return '';
    }

    // Первая точка всегда остается прежней
    const pathParts: string[] = [`M ${points[0].x} ${points[0].y}`];
    
    // Определяем, до какого индекса мы строим кривые Безье.
    // Если всего 2 точки, циклу не нужен.
    const lastCurveIndex = points.length - 2;

    for (let i = 1; i <= lastCurveIndex; i++) {
      const p_prev = points[i - 1];
      const p_curr = points[i];
      // В качестве следующей точки для последнего угла используем скорректированную конечную точку
      const p_next = (i === lastCurveIndex) ? pathEndPoint() : points[i + 1];

      const v1 = { x: p_prev.x - p_curr.x, y: p_prev.y - p_curr.y };
      const v2 = { x: p_next.x - p_curr.x, y: p_next.y - p_curr.y };

      const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
      const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
      
      const effectiveRadius = Math.min(radius, len1 / 2, len2 / 2);
      
      // Если радиус слишком большой или сегменты короткие, рисуем просто прямой угол
      if (effectiveRadius <= 0.1) {
        pathParts.push(`L ${p_curr.x} ${p_curr.y}`);
        continue;
      }

      const nv1 = { x: v1.x / len1, y: v1.y / len1 };
      const nv2 = { x: v2.x / len2, y: v2.y / len2 };

      const t1 = { x: p_curr.x + nv1.x * effectiveRadius, y: p_curr.y + nv1.y * effectiveRadius };
      const t2 = { x: p_curr.x + nv2.x * effectiveRadius, y: p_curr.y + nv2.y * effectiveRadius };

      pathParts.push(`L ${t1.x} ${t1.y}`);
      pathParts.push(`Q ${p_curr.x} ${p_curr.y} ${t2.x} ${t2.y}`);
    }

    // Добавляем последний сегмент линии до скорректированной конечной точки
    pathParts.push(`L ${pathEndPoint().x} ${pathEndPoint().y}`);
    return pathParts.join(' ');
  });

  const arrowheadTransform = $derived(() => {
    if (points.length < 2) {
      return '';
    }
    // Позиционируем стрелку на ИСХОДНОЙ конечной точке
    const lastPoint = points[points.length - 1];
    const penultimatePoint = points[points.length - 2];
    const dx = lastPoint.x - penultimatePoint.x;
    const dy = lastPoint.y - penultimatePoint.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return `translate(${lastPoint.x} ${lastPoint.y}) rotate(${angle})`;
  });

  const arrowheadFill = $derived(
    restProps.stroke && restProps.stroke !== 'none' ? restProps.stroke : 'black'
  );

</script>

<g class="curved-arrow">
  <path
    d={pathData()}
    fill="none"
    {...restProps}
  />

  {#if points.length >= 2}
    <path
      class="arrow-head"
      d="M 0 0 L -12 -6 L -12 6 Z"
      transform={arrowheadTransform()}
      fill={arrowheadFill}
    />
  {/if}
</g>