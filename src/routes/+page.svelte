<script lang="ts">
  import {
    RadioGroup, RadioItem, getModalStore, type ModalSettings
  } from '@skeletonlabs/skeleton'
  import Toolbar from '$lib/components/Toolbar.svelte'
  import Wheel from '$lib/components/Wheel.svelte'
  import WheelMultiThread from '$lib/components/WheelMultiThread.svelte'
  import EditorColumn from '$lib/components/EditorColumn.svelte'
  import wheelStore from '$lib/stores/WheelStore'
  import fullscreenStore from '$lib/stores/FullscreenStore.svelte'
  import debugStore from '$lib/stores/DebugStore.svelte'
  import { launchConfetti } from '$lib/utils/ConfettiLauncher'
  import type { OnStoppedData } from '$lib/utils/Wheel'
  import AboutCards from '$lib/components/AboutCards.svelte'

  const modalStore = getModalStore()

  const createWinnerModal = (data: OnStoppedData): ModalSettings => ({
    type: 'component',
    component: 'winnerDialog',
    title: wheelStore.config.winnerMessage || 'We have a winner!',
    body: data.winner.text,
    meta: data
  })
  
  const openWinnerModal = async (e: CustomEvent<OnStoppedData>) => {
    const winner = e.detail;
    
    // Use a staggered approach for displaying results to prevent UI jank
    if (!wheelStore.config.displayWinnerDialog) {
      // If we're not showing a dialog, just show confetti after a minimal delay
      window.requestAnimationFrame(() => {
        launchConfetti(wheelStore.config.confetti, $state.snapshot(wheelStore.config.colors))
      });
      return;
    }
    
    // Two-phase approach: first prepare the confetti, then show dialog
    // This splits up CPU-intensive tasks to avoid main thread blocking
    
    // First phase: prepare confetti system but with minimal particles
    // This pre-warms the system without heavy CPU usage
    const confettiConfig = {...wheelStore.config.confetti, particles: 10};
    setTimeout(() => {
      launchConfetti(confettiConfig, $state.snapshot(wheelStore.config.colors))
      
      // Second phase: show the dialog, then increase confetti particles
      setTimeout(() => {
        modalStore.trigger(createWinnerModal(winner));
        
        // After dialog appears, increase confetti if enabled
        if (wheelStore.config.confetti.enabled && wheelStore.config.confetti.particles > 10) {
          setTimeout(() => {
            launchConfetti(wheelStore.config.confetti, $state.snapshot(wheelStore.config.colors))
          }, 100);
        }
      }, 30);
    }, 0);
  }

  const openOpenDialog = () => modalStore.trigger({
    type: 'component', component: 'openDialog'
  })

  const openSaveDialog = () => modalStore.trigger({
    type: 'component', component: 'saveDialog'
  })

  const openCustomizeDialog = () => modalStore.trigger({
    type: 'component', component: 'customizeDialog'
  })

  const openShareDialog = () => modalStore.trigger({
    type: 'component', component: 'shareDialog'
  })

  const openAccountDialog = async () => modalStore.trigger({
    type: 'component', component: 'accountDialog'
  })

  let WheelComponent = $state(Wheel)
</script>

<svelte:head>
  {#if wheelStore.config.title}
    <title>{wheelStore.config.title} -  Pop It Wheel | Random Question Generator</title>
  {:else}
    <title> Pop It Wheel | Random Question Generator</title>
  {/if}
  <meta
    property="og:image"
    content="https://sveltewheel.com/images/sveltewheel.webp"
  >
  <meta name="theme-color" content="#022a4f">
</svelte:head>

<div class="min-h-screen flex flex-col">
  <Toolbar
    on:new={wheelStore.reset}
    on:open={openOpenDialog}
    on:save={openSaveDialog}
    on:customize={openCustomizeDialog}
    on:share={openShareDialog}
    on:account={openAccountDialog}
    on:debug={debugStore.toggle}
  />

  <main class="flex-grow flex flex-col xl:grid grid-cols-4">
    <div class="col-span-1 pb-0 p-4 xl:pb-4 xl:pr-0 flex flex-col justify-between">
      {#if !fullscreenStore.active}
        <div>
          <h2 class="text-3xl" aria-label="Wheel title">
            {wheelStore.config.title}
          </h2>
          <p class="text-lg" aria-label="Wheel description">
            {wheelStore.config.description}
          </p>
          {#if debugStore.active}
            <RadioGroup>
              <RadioItem
                name="wheel"
                value={Wheel}
                bind:group={WheelComponent}
              >
                Single Thread
              </RadioItem>
              <RadioItem
                name="wheel"
                value={WheelMultiThread}
                bind:group={WheelComponent}
              >
                Multi Thread
              </RadioItem>
            </RadioGroup>
          {/if}
        </div>
      {/if}
    </div>

    <div class="col-span-2 flex-1 flex flex-col justify-center items-center">
      <WheelComponent
        on:stop={openWinnerModal}
      />
    </div>

    <div class="col-span-1 pt-0 p-4 xl:pt-4 xl:pl-0 flex flex-col">
      {#if !fullscreenStore.active}
        <EditorColumn />
      {/if}
    </div>
  </main>
</div>

{#if !fullscreenStore.active}
  <hr>

  <aside class="p-4 flex justify-center">
    <AboutCards />
  </aside>
{/if}
