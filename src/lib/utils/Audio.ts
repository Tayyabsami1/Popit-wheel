let loopingAudio: HTMLAudioElement | null = null
const audioCache = new Map<string, HTMLAudioElement>()

export const playTick = (volume: number) => {
  playSound('Tick-DeepFrozenApps-397275646.mp3', volume)
}

export const playSound = (sound: string, volume: number) => {
  if (!audioCache.has(sound)) {
    const audio = new Audio(`/audio/${sound}`)
    audioCache.set(sound, audio)
  }
  
  const audio = audioCache.get(sound)!
  audio.volume = volume
  audio.currentTime = 0
  
  // Using the play promise to handle autoplay restrictions gracefully
  const playPromise = audio.play()
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.warn('Audio playback was prevented:', error)
    })
  }
}

export const playLoopedSound = (sound: string, volume: number) => {
  cancelLoopingSounds()
  
  if (!audioCache.has(`loop_${sound}`)) {
    loopingAudio = new Audio(`/audio/${sound}`)
    audioCache.set(`loop_${sound}`, loopingAudio)
  } else {
    loopingAudio = audioCache.get(`loop_${sound}`)!
  }
  
  loopingAudio.volume = volume
  loopingAudio.loop = true
  loopingAudio.currentTime = 0
  
  const playPromise = loopingAudio.play()
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.warn('Audio loop playback was prevented:', error)
    })
  }
}

export const cancelLoopingSounds = () => {
  if (!loopingAudio) return
  loopingAudio.pause()
  loopingAudio = null
}

export const duringSpinSounds = [
  { name: 'Beyond the Cloudy Sky', file: 'beyond-the-cloudy-sky-shutterstock.mp3' }
]

export const afterSpinSounds = [
  { name: 'Small Crowd Applause', file: 'SMALL_CROWD_APPLAUSE-Yannick_Lemieux-1268806408.mp3' }
]
