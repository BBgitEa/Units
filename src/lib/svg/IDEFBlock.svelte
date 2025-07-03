<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';
  import WrappedText from './WrappedText.svelte';

  type Rect = { x: number; y: number; w: number; h: number };

  type Props = {
    rect: Rect;
    text: string;
    id: string;
    textColor?: string;
    fontSize?: string;
  } & Omit<SVGAttributes<SVGRectElement>, 'x' | 'y' | 'width' | 'height'>;

  const PADDING = 10;
  const ID_AREA_HEIGHT = 20;
  const ID_FONT_SIZE = '12px';
  
  const {
    rect,
    text,
    id,
    textColor = 'black',
    fontSize = '16px',
    ...restProps
  } : Props = $props();

  let idMeasuringEl: SVGTextElement;

  const mainTextArea = $derived.by(() => ({
    x: rect.x + PADDING,
    y: rect.y + PADDING,
    w: rect.w - PADDING * 2,
    h: rect.h - PADDING * 2 - ID_AREA_HEIGHT,
  }));

  const idAttrs = $derived.by(() => {
    const defaultAttrs = {
      x: rect.x + rect.w - PADDING,
      y: rect.y + rect.h - PADDING,
      textAnchor: 'end' as const,
    };

    if (!idMeasuringEl || !id) {
      return defaultAttrs;
    }

    // Применяем стили для точного измерения
    idMeasuringEl.style.fontSize = ID_FONT_SIZE;
    idMeasuringEl.style.fontFamily = 'monospace';
    idMeasuringEl.textContent = id;
    
    const idWidth = idMeasuringEl.getComputedTextLength();
    const availableWidth = rect.w - PADDING * 2;

    if (idWidth > availableWidth) {
      // ID слишком длинный, выравниваем по левому краю
      return {
        x: rect.x + PADDING,
        y: rect.y + rect.h - PADDING,
        textAnchor: 'start' as const,
      };
    }
    
    // ID помещается, выравниваем по правому краю
    return defaultAttrs;
  });

</script>

<g class="idef-block">
   <rect
    {...restProps}
    fill="#a8a8a8"
    stroke="#a8a8a8"
    x={rect.x + 4}
    y={rect.y + 4}
    width={rect.w}
    height={rect.h}
  />
  <rect
    {...restProps}
    x={rect.x}
    y={rect.y}
    width={rect.w}
    height={rect.h}
  />

  <WrappedText
    rect={mainTextArea}
    text={text}
    centered={true}
    fill={textColor}
    font-size={fontSize}
    font-family="sans-serif"
  />

  <text
    x={idAttrs.x}
    y={idAttrs.y}
    text-anchor={idAttrs.textAnchor}
    fill={textColor}
    font-size={ID_FONT_SIZE}
    font-family="monospace"
    dominant-baseline="alphabetic"
  >
    {id}
  </text>
  

  <text bind:this={idMeasuringEl} visibility="hidden" aria-hidden="true"></text>
</g>