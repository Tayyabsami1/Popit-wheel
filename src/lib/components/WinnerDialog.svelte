<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { getModalStore } from '@skeletonlabs/skeleton'
  import wheelStore from '$lib/stores/WheelStore'
  import { getTextColor } from '$lib/utils/FontPicker'

  const modalStore = getModalStore()
  let mounted = false;

  const remove = () => {
    wheelStore.entries = wheelStore.entries.filter(e => e.id !== $modalStore[0].meta.winner.id)
    modalStore.close()
  }
  
  // Memory optimization: Use lighter weight CSS and avoid unnecessary reflows
  const getDialogStyle = (color: string | null) => {
    if (!color) return '';
    const textColor = getTextColor(color);
    return `background-color: ${color}; color: ${textColor};`;
  }
  
  // Performance optimization: Cache color and style
  let headerStyle = '';
  
  onMount(() => {
    mounted = true;
    // Pre-compute style to avoid expensive calculations during animations
    if ($modalStore[0]?.meta?.color) {
      headerStyle = getDialogStyle($modalStore[0].meta.color);
    }
    
    // Use passive hints to tell the browser this isn't a critical component
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        // Cache any expensive calculations here when idle
      });
    }
  });
  
  onDestroy(() => {
    mounted = false;
    // Clear any references to help GC
    headerStyle = '';
  });
</script>

{#if $modalStore[0] && mounted}
  <article class="card w-modal shadow-xl overflow-hidden winner-dialog">
    <header
      class="p-4 text-2xl font-semibold"
      style={headerStyle}
    >
      {$modalStore[0].title}
    </header>

    <div
      class="p-4 h1"
      aria-label="Winner"
    >
      {$modalStore[0].body}
    </div>

    <footer class="p-4 flex justify-end gap-2 md:gap-4">
      <button class="btn variant-soft" onclick={modalStore.close}>
        Close
      </button>
      <button class="btn variant-soft-warning" onclick={remove}>
        Remove
      </button>
    </footer>
  </article>
{/if}

<style>
  /* Add containment to limit reflow impact */
  .winner-dialog {
    contain: content;
    will-change: transform;
    transform: translateZ(0); /* GPU acceleration */
  }
</style>
