<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';

  type Props = {
    text: string;
    centered?: boolean;
  } & SVGAttributes<SVGTextElement>;

  const { text, centered = false, ...restProps } : Props= $props();

  const textAnchor = $derived(centered ? 'middle' : 'start');

</script>

<text {...restProps} text-anchor={textAnchor}>
  {text}
</text>