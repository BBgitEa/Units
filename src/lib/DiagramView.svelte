<script lang="ts">
  import type { RenderableDiagram } from '../types';
  import CurvedArrow from './svg/CurvedArrow.svelte';
  import IDEFBlock from './svg/IDEFBlock.svelte';
  import WrappedText from './svg/WrappedText.svelte';

  interface Props {
    data: RenderableDiagram;
    svgElement?: SVGSVGElement | undefined;
  }
  let { data, svgElement = $bindable() } : Props = $props();


  // viewBox управляет панорамированием и масштабированием
  let viewBox = $state({
    x: 0,
    y: 0,
    w: data.width,
    h: data.height,
  });

  let dragging = $state(false);
  let lastPosition = $state({ x: 0, y: 0 });

  const viewBoxString = $derived(
    `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`
  );

 
  function toSvgCoords(clientX: number, clientY: number) {
    if (!svgElement) return { x: 0, y: 0 };
    const rect = svgElement.getBoundingClientRect();
    const sx = (clientX - rect.left) * (viewBox.w / rect.width) + viewBox.x;
    const sy = (clientY - rect.top) * (viewBox.h / rect.height) + viewBox.y;
    return { x: sx, y: sy };
  }

  // Обработчики событий мыши для панорамирования
  function onPointerDown(e: PointerEvent) {
    if (e.button === 2) { 
      dragging = true;
      lastPosition = { x: e.clientX, y: e.clientY };
      svgElement?.setPointerCapture(e.pointerId);
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (dragging && svgElement) {
      const dx = (e.clientX - lastPosition.x) * (viewBox.w / svgElement.clientWidth);
      const dy = (e.clientY - lastPosition.y) * (viewBox.h / svgElement.clientHeight);
      
      viewBox.x -= dx;
      viewBox.y -= dy;

      lastPosition = { x: e.clientX, y: e.clientY };
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (e.button === 2) {
      dragging = false;
      svgElement?.releasePointerCapture(e.pointerId);
    }
  }

  // Обработчик для масштабирования колесиком мыши
  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const scale = e.deltaY < 0 ? 0.9 : 1.1;
    const mouse = toSvgCoords(e.clientX, e.clientY);

    viewBox.x = mouse.x - (mouse.x - viewBox.x) * scale;
    viewBox.y = mouse.y - (mouse.y - viewBox.y) * scale;
    viewBox.w *= scale;
    viewBox.h *= scale;
  }

  $effect(() => {
    if (svgElement) {
      const preventContextMenu = (e: MouseEvent) => e.preventDefault();
      svgElement.addEventListener('contextmenu', preventContextMenu);
      
      // Функция очистки, которая будет вызвана при размонтировании компонента
      return () => {
        svgElement.removeEventListener('contextmenu', preventContextMenu);
      };
    }
  });

</script>

<style>
    :global(html, body) {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
    }
    .diagram-container {
        width: 100%;
        height: 100vh;
        overflow: hidden;
        position: relative;
        user-select: none;
        touch-action: none;
        background-color: #fdfdfd;
    }
    svg {
        width: 100%;
        height: 100%;
        display: block;
    }
</style>

<div class="diagram-container">
    <svg
        bind:this={svgElement}
        viewBox={viewBoxString}
        onpointerdown={onPointerDown}
        onpointermove={onPointerMove}
        onpointerup={onPointerUp}
        onwheel={onWheel}
    >

        <rect
            x="0"
            y="0"
            width={data.width}
            height={data.height}
            fill="none"
            stroke="#e0e0e0"
            stroke-width="2"
        />

          <!-- ПРОХОД 1: Рендерим все блоки -->
        <g class="blocks">
            {#each data.blocks as block (block.id)}
                <IDEFBlock
                    rect={block.rect}
                    text={block.text}
                    id={block.id}
                    fill="white"
                    stroke="black"
                    stroke-width="1.5"
                    textColor="#111"
                    fontSize="14px"
                    rx={10}
                />
            {/each}
        </g>


        <!-- ПРОХОД 2: Рендерим все линии стрелок -->
        <g class="arrow-lines">
            {#each data.arrows as arrow (arrow.id)}
                <CurvedArrow
                    points={arrow.path}
                    radius={10}
                    stroke="#333"
                    stroke-width="1.5"
                />
            {/each}
        </g>
        
        <!-- ПРОХОД 3: Рендерим все метки поверх всего остального -->
        <g class="arrow-labels">
            {#each data.arrows as arrow (arrow.id + '-label')}
                {#if arrow.label}
                    <WrappedText
                        rect={arrow.label.rect}
                        text={arrow.label.text}
                        centered={true}
                        fill="black"
                        font-size="13px"
                        font-family="sans-serif"
                        paint-order="stroke"
                        stroke="white"
                        stroke-width="4px"
                        stroke-linecap="butt"
                        stroke-linejoin="miter"
                    />
                {/if}
            {/each}
        </g>
    </svg>
</div>