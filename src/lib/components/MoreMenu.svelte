<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { LightSwitch } from '@skeletonlabs/skeleton'
  import busyStore from '$lib/stores/BusyStore.svelte'
  import debugStore from '$lib/stores/DebugStore.svelte'

  const dispatch = createEventDispatcher<{
    account: null,
    debug: null
  }>()
</script>

<div class="card flex flex-col w-fit shadow-xl p-2">
  <button
    class="btn text-xl hover:variant-soft-primary"
    onclick={() => dispatch('account')}
    disabled={busyStore.spinning}
  >
    <i class="fas fa-user w-6"></i>
    <span class="flex-grow text-left">Account</span>
  </button>

  <a
    href="/faq"
    class="btn text-xl hover:variant-soft-primary"
  >
    <i class="fas fa-question w-6"></i>
    <span class="flex-grow text-left">FAQ</span>
  </a>

  <a
    href="/privacy-policy"
    class="btn text-xl hover:variant-soft-primary"
  >
  <i class="fas fa-shield-alt"></i>
    <span class="flex-grow text-left">Privacy Policy</span>
  </a>

  <div class="btn text-xl">
    <LightSwitch />
    <span class="flex-grow text-left">Theme</span>
  </div>
</div>
