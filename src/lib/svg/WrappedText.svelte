<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';

  type Rect = { x: number; y: number; w: number; h: number };

  type Props = {
    rect: Rect;
    text: string;
    centered?: boolean;
    lineHeight?: number; 
  } & Omit<SVGAttributes<SVGTextElement>, 'x' | 'y'>;

  const {
    rect,
    text,
    centered = false,
    lineHeight = 1.2,
    ...restProps
  } : Props = $props();

  let measuringEl: SVGTextElement;
  let wrappedLines = $state<string[]>([]);

  $effect(() => {
    if (!measuringEl || !text) {
      wrappedLines = [];
      return;
    }
    const words = text.split(' ');
    const newLines: string[] = [];
    let currentLine = words[0] || '';
    Object.assign(measuringEl.style, {
        fontFamily: restProps['font-family'],
        fontSize: restProps['font-size'],
        fontWeight: restProps['font-weight'],
    });
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = `${currentLine} ${word}`;
      measuringEl.textContent = testLine;
      const testWidth = measuringEl.getComputedTextLength();
      if (testWidth > rect.w && currentLine.length > 0) {
        newLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    newLines.push(currentLine);
    wrappedLines = newLines;
  });

  const xPos = $derived(centered ? rect.x + rect.w / 2 : rect.x);
  const yPos = $derived(centered ? rect.y + rect.h / 2 : rect.y);
  const textAnchor = $derived(centered ? 'middle' : 'start');
  
  const verticalCenteringOffset = $derived.by(() => {
    if (!centered || wrappedLines.length <= 1) {
      // Для одной строки или без центрирования сдвиг не нужен
      return 0;
    }
    // Общая высота блока (минус одна строка) в единицах lineHeight.
    const totalHeightInLineHeights = (wrappedLines.length - 1) * lineHeight;
    // Сдвигаем весь блок вверх на половину его высоты.
    return -(totalHeightInLineHeights / 2);
  });

</script>

<g>
  <text
    {...restProps}
    x={xPos}
    y={yPos}
    text-anchor={textAnchor}
    dominant-baseline={centered ? 'middle' : 'auto'}
  >
    {#each wrappedLines as line, i (line + i)}
      <tspan
        x={xPos}
        dy={i === 0 
            ? (centered ? `${verticalCenteringOffset}em` : '1em') 
            : `${lineHeight}em`
        }
      >{line}</tspan>
    {/each}
  </text>
  
  <text {...restProps} bind:this={measuringEl} visibility="hidden" aria-hidden="true"></text>
</g>