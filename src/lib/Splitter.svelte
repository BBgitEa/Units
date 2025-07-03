<script lang="ts"> 
  let {
    vertical = false, 
    minA = 100,      
    minB = 100,      
    initial = 0.5,  
  } = $props<{
    vertical?: boolean;
    minA?: number;
    minB?: number;
    initial?: number;
  }>();

  let container: HTMLDivElement | undefined = $state();

  let pos = $state(300); 

  $effect(() => {
    if (container) {
      const rect = container.getBoundingClientRect();
      if (vertical) {
        // Устанавливаем начальную вертикальную позицию с учетом ограничений
        pos = Math.max(minA, Math.min(rect.height * initial, rect.height - minB));
      } else {
        // Устанавливаем начальную горизонтальную позицию
        pos = Math.max(minA, Math.min(rect.width * initial, rect.width - minB));
      }
    }
  });


  function onPointerDown(e: PointerEvent) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!(e.target as HTMLElement).hasPointerCapture(e.pointerId)) return;
    
    if (!container) return;
    const rect = container.getBoundingClientRect();

    if (vertical) {
      let y = e.clientY - rect.top;
      // Применяем ограничения, чтобы панели не становились слишком маленькими
      pos = Math.max(minA, Math.min(y, rect.height - minB));
    } else {
      let x = e.clientX - rect.left;
      pos = Math.max(minA, Math.min(x, rect.width - minB));
    }
  }

  function onPointerUp(e: PointerEvent) {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }
</script>

<style>
  .splitter-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    display: flex; 
  }
  
  .splitter-pane {
    overflow: auto; 

  }

  .pane-a {
    flex-shrink: 0;
  }
  
  .pane-b {
    flex-grow: 1;
  }

  .splitter-bar {
    background: var(--background-secondary-color); 
    z-index: 100;
    flex-shrink: 0; 
    transition: background 0.2s;
    touch-action: none; 
  }

  .splitter-bar:hover {
    background:  var(--primary-color); 
  }
  
  .horizontal .splitter-bar {
    width: 4px;
    cursor: ew-resize;
    height: 100%; 
  }
  
  .vertical .splitter-bar {
    height: 4px;
    cursor: ns-resize;
    width: 100%; 
  }
</style>


<div
  bind:this={container}
  class="splitter-container {vertical ? 'vertical' : 'horizontal'}"
  style:flex-direction={vertical ? 'column' : 'row'}
>
  <div class="splitter-pane pane-a" style={vertical ? `height: ${pos}px;` : `width: ${pos}px;`}>
    <slot name="a" />
  </div>

  <div
    class="splitter-bar"
    on:pointerdown={onPointerDown}
    on:pointermove={onPointerMove}
    on:pointerup={onPointerUp}
  ></div>

  <div class="splitter-pane pane-b">
    <slot name="b" />
  </div>
</div>