import FontPicker, { truncateText, getTextColor } from '$lib/utils/FontPicker'
import { hubSizes } from '$lib/utils/WheelConfig'
import type Wheel from '$lib/utils/Wheel'

export type Context = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

export default class WheelPainter {
  imageCache = new Map<string, HTMLCanvasElement | OffscreenCanvas | null>()
  fontPicker = new FontPicker()
  skipShadows = false // For low-end devices
  lastDrawTime = 0
  lastAngle = 0
  
  refresh() {
    // Preserve key cache items to prevent unnecessary redrawing
    const preserveKeys = ['shadow', 'pointer', 'center', 'slices', 'wheel']
    const preserved = new Map<string, HTMLCanvasElement | OffscreenCanvas | null>()
    
    // Save existing cached images
    preserveKeys.forEach(key => {
      const item = this.imageCache.get(key)
      if (item) preserved.set(key, item)
    })
    
    // Clear and restore preserved items
    this.imageCache.clear()
    
    preserved.forEach((value, key) => {
      this.imageCache.set(key, value)
    })
    
    // Only clear font cache when necessary
    this.fontPicker.clearFontCache()
  }
  async draw(context: Context, wheel: Wheel) {
    // Check if we should throttle rendering (30fps instead of 60fps)
    const now = performance.now();
    const FRAME_THROTTLE = 1000 / 30; // Cap at 30fps for smoother performance
    
    // Skip drawing if not enough time has passed and angle hasn't changed significantly
    if (now - this.lastDrawTime < FRAME_THROTTLE && 
        Math.abs(this.lastAngle - wheel.state.angle) < 0.01) {
      return;
    }
    
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    
    // Only draw shadow if not disabled for performance
    if (!this.skipShadows) {
      this.drawShadow(context)
    }
    
    this.drawBackground(context, wheel)
    this.drawWheel(context, wheel)
    this.drawCenterImage(context, wheel)
    this.drawPointer(context)
    
    // Update state after draw
    this.lastDrawTime = now;
    this.lastAngle = wheel.state.angle;
  }

  drawShadow(context: Context) {
    if (!this.imageCache.has('shadow')) {
      this.drawShadowNoCache(createInMemoryImage(context))
    }
    context.drawImage(this.imageCache.get('shadow')!, 0, 0)
  }  drawShadowNoCache(context: Context) {
    const { width, height } = context.canvas
    const x = width / 2
    const y = height / 2
    const radius = getWheelRadius(context)
    
    // Clear any previous drawing
    context.clearRect(0, 0, width, height)
    
    if (this.skipShadows) {
      this.imageCache.set('shadow', context.canvas)
      return
    }
    
    // Draw shadow only inside wheel boundaries
    context.save()
    
    // Create a soft shadow gradient that doesn't exceed wheel boundaries
    const gradient = context.createRadialGradient(
      x, y, radius * 0.95, // Inner radius slightly inside wheel
      x, y, radius // Outer radius exactly at wheel edge
    )
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)')
    gradient.addColorStop(1, 'transparent')
    
    context.fillStyle = gradient
    
    // Apply the gradient only within the wheel's circle
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
    
    context.restore()
    this.imageCache.set('shadow', context.canvas)
  }

  drawBackground(context: Context, wheel: Wheel) {
    if (wheel.config.type !== 'image') return
    if (!this.imageCache.has('background')) {
      this.drawBackgroundNoCache(
        createInMemoryImage(context),
        wheel.config.image
      )
    }
    if (this.imageCache.get('background') === null) return
    context.save()
    const { width, height } = context.canvas
    context.translate(width / 2, height / 2)
    context.rotate(wheel.state.angle)
    context.translate(-width / 2, -height / 2)
    context.drawImage(this.imageCache.get('background')!, 0, 0)
    context.restore()
  }

  async drawBackgroundNoCache(context: Context, dataUri: string) {
    this.imageCache.set('background', null)
    const image = await createImageFromDataUri(dataUri)
    const radius = getWheelRadius(context)
    const scale = radius * 2 / Math.min(image.width, image.height)
    const width = image.width * scale
    const x = (radius * 2 - width) / 2
    const height = image.height * scale
    const y = (radius * 2 - height) / 2
    context.save()
    context.beginPath()
    context.translate(context.canvas.width / 2, context.canvas.height / 2)
    context.arc(0, 0, radius, 0, Math.PI * 2)
    context.clip()
    context.translate(-radius, -radius)
    context.drawImage(image, x, y, width, height)
    context.restore()
    this.imageCache.set('background', context.canvas)
  }

  drawWheel(context: Context, wheel: Wheel) {
    if (!this.imageCache.has('wheel')) {
      this.drawWheelNoCache(createInMemoryImage(context), wheel)
    }
    context.save()
    context.translate(context.canvas.width / 2, context.canvas.height / 2)
    context.rotate(wheel.state.angle)
    context.translate(-context.canvas.width / 2, -context.canvas.height / 2)
    context.drawImage(this.imageCache.get('wheel')!, 0, 0)
    context.restore()
  }  drawWheelNoCache(context: Context, wheel: Wheel) {
    // Clear the entire canvas first
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    
    // Save context and create a clipping path to prevent drawing outside wheel radius
    context.save();
    
    // Set the shadow properties to none to prevent shadows from creating borders
    context.shadowColor = 'transparent';
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    
    // Create a clipping path for the wheel
    context.beginPath();
    context.translate(context.canvas.width/2 , context.canvas.height /2);
    const radius = getWheelRadius(context)+10;
    
    // Create a perfect circle for the wheel boundary
    context.arc(0, 0, radius, 0, Math.PI * 2);
    // context.clip();
    context.translate(-context.canvas.width / 2, -context.canvas.height / 2);
    
    // Draw slices and center within clipping path
    this.drawSlices(context, wheel);
    this.drawCenter(context, wheel);
    
    // Restore context
    context.restore();
    this.imageCache.set('wheel', context.canvas);
  }

  drawSlices(context: Context, wheel: Wheel) {
    if (!this.imageCache.has('slices')) {
      this.drawSlicesNoCache(createInMemoryImage(context), wheel)
    }
    context.drawImage(this.imageCache.get('slices')!, 0, 0)
  }  drawSlicesNoCache(context: Context, wheel: Wheel) {
    // Clear the canvas before drawing slices
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    
    context.save()
    context.translate(context.canvas.width / 2, context.canvas.height / 2)
    const radius = getWheelRadius(context)
    
    // Ensure nothing is drawn outside the wheel radius
    context.beginPath()
    context.arc(0, 0, radius, 0, Math.PI * 2)
    context.closePath()
    
    // Filter empty entries once before processing
    const nonEmptyEntries = wheel.entries.filter(entry => entry.text.trim() !== '')
    
    // Skip work if no entries
    if (nonEmptyEntries.length === 0) {
      context.restore()
      this.imageCache.set('slices', context.canvas)
      return
    }
    
    // Calculate font size once for all slices
    const sliceAngle = 2 * Math.PI / nonEmptyEntries.length
    const hubSize = hubSizes[wheel.config.hubSize]
    
    // Get and set font only once
    context.font = this.fontPicker.getFont(
      context,
      nonEmptyEntries.map(entry => entry.text),
      radius * 15 / 16,
      radius * hubSize * 17 / 16,
      sliceAngle
    )
    
    // Create a temporary wheel with only non-empty entries
    const tempWheel = {
      ...wheel,
      entries: nonEmptyEntries
    }
    
    // Draw all slices
    nonEmptyEntries.forEach((_entry, index) => {
      this.drawSlice(context, tempWheel, index)
      context.rotate(-sliceAngle)
    })
    
    context.restore()
    this.imageCache.set('slices', context.canvas)
  }
  drawSlice(context: Context, wheel: any, index: number) {
    const radius = getWheelRadius(context);
    const radians = 2 * Math.PI / wheel.entries.length;
    
    // Skip drawing if the entry doesn't exist or has no text
    if (!wheel.entries[index] || !wheel.entries[index].text.trim()) {
        return;
    }
    
    if (wheel.config.type === 'color') {
        const colors = ["#3369E8", "#8E44AD", "#009925", "#D50F25", "#EEB211"]; // blue, purple, green, red, yellow
        const colorCount = colors.length;
        
        // Calculate the exact position in your pattern
        const patternIndex = index % (colorCount * 4); // Repeats every 20 segments (4 full cycles)
        const cycleNumber = Math.floor(patternIndex / colorCount);
        
        let colorIndex;
        // First determine which color set to use based on cycle
        switch (cycleNumber % 4) {
            case 0: // blue first
                colorIndex = patternIndex % colorCount;
                break;
            case 1: // purple first
                colorIndex = (patternIndex + 1) % colorCount;
                break;
            case 2: // green first
                colorIndex = (patternIndex + 2) % colorCount;
                break;
            case 3: // red first
                colorIndex = (patternIndex + 3) % colorCount;
                break;
            default:
                colorIndex = patternIndex % colorCount;
        }
        
        const bgColor = colors[colorIndex];
        // Draw the slice background without a stroke
        this.drawSliceBg(context, radius, radians, bgColor);
        this.drawText(
            context, wheel.entries[index].text, radius, getTextColor(bgColor)
        );
    } else {
        this.drawText(
            context, wheel.entries[index].text, radius, 'white', 'black'
        );
    }
}


  drawSliceBg(
    context: Context,
    radius: number,
    radians: number,
    color: string
  ) {
    // Ensure no stroke is applied
    context.strokeStyle = 'transparent'
    
    context.beginPath()
    context.moveTo(0, 0)
    context.arc(0, 0, radius, -radians / 2, radians / 2)
    context.lineTo(0, 0)
    context.fillStyle = color
    context.fill()
    // Important: Do NOT call context.stroke() here as it would create a border
  }

  drawText(
    context: Context,
    text: string,
    radius: number,
    color: string,
    strokeColor?: string
  ) {
    context.lineJoin = 'round'
    context.textBaseline = 'middle'
    context.textAlign = 'end'
    context.fillStyle = color
    const displayText = truncateText(text)
    if (strokeColor) {
      context.strokeStyle = strokeColor
      context.lineWidth = 3
      context.strokeText(displayText, radius * 15 / 16, 0)
    }
    context.fillText(displayText, radius * 15 / 16, 0)
  }

  drawCenter(context: Context, wheel: Wheel) {
    if (wheel.config.type !== 'color') return
    if (!this.imageCache.has('center')) {
      this.drawCenterNoCache(
        createInMemoryImage(context),
        hubSizes[wheel.config.hubSize]
      )
    }
    context.drawImage(this.imageCache.get('center')!, 0, 0)
  }

  drawCenterNoCache(context: Context, hubSize: number) {
    context.translate(context.canvas.width / 2, context.canvas.height / 2)
    context.beginPath()
    context.arc(0, 0, getWheelRadius(context) * hubSize, 0, 2 * Math.PI)
    context.fillStyle = 'white'
    context.fill()
    this.imageCache.set('center', context.canvas)
  }

  async drawCenterImage(context: Context, wheel: Wheel) {
    if (wheel.config.type !== 'color' || !wheel.config.image) return
    if (!this.imageCache.has('center-image')) {
      this.drawCenterImageNoCache(
        createInMemoryImage(context),
        wheel.config.image,
        hubSizes[wheel.config.hubSize]
      )
    }
    if (this.imageCache.get('center-image') === null) return
    context.save()
    const { width, height } = context.canvas
    context.translate(width / 2, height / 2)
    context.rotate(wheel.state.angle)
    const radius = getWheelRadius(context) * hubSizes[wheel.config.hubSize]
    context.translate(-radius, -radius)
    context.drawImage(this.imageCache.get('center-image')!, 0, 0)
    context.restore()
  }

  async drawCenterImageNoCache(
    context: Context, dataUri: string, hubSize: number
  ) {
    this.imageCache.set('center-image', null)
    const image = await createImageFromDataUri(dataUri)
    const radius = getWheelRadius(context) * hubSize
    const scale = radius * 2 / Math.min(image.width, image.height)
    const width = image.width * scale
    const x = (radius * 2 - width) / 2 - radius
    const height = image.height * scale
    const y = (radius * 2 - height) / 2 - radius
    context.save()
    context.beginPath()
    context.translate(radius, radius)
    context.arc(0, 0, radius, 0, Math.PI * 2, true)
    context.clip()
    context.drawImage(image, x, y, width, height)
    context.restore()
    this.imageCache.set('center-image', context.canvas)
  }

  drawPointer(context: Context) {
    if (!this.imageCache.has('pointer')) {
      this.drawPointerNoCache(createInMemoryImage(context))
    }
    context.drawImage(this.imageCache.get('pointer')!, 0, 0)
  }

  drawPointerNoCache(context: Context) {
    context.save()
    const { width, height } = context.canvas
    context.shadowColor = 'transparent'
    context.shadowOffsetY = 4
    context.shadowBlur = 10
    context.fillStyle = 'white'
    context.strokeStyle = 'black'
    context.moveTo(width * 19 / 20, height * 19 / 40)
    context.beginPath()
    context.lineTo(width * 19 / 20, height * 21 / 40)
    context.lineTo(width * 9 / 10, height / 2)
    context.lineTo(width * 19 / 20, height * 19 / 40)
    context.fill()
    context.stroke()
    context.restore()
    this.imageCache.set('pointer', context.canvas)
  }
}

const getWheelRadius = (context: Context) =>( Math.min(
  context.canvas.width, context.canvas.height
) /2)-10

const createInMemoryImage = (context: Context) => new OffscreenCanvas(
  context.canvas.width, context.canvas.height
).getContext('2d')!

const createImageFromDataUri = async (dataUri: string) => {
  const image = new Image()
  image.src = dataUri
  await image.decode()
  return image
}

export const compressImage = async (file: File) => (
  readBlobAsDataUri(file, async event => {
    const dataUri = event.target!.result as string
    const image = await createImageFromDataUri(dataUri)
    const scale = 700 / Math.min(image.width, image.height)
    const canvas = new OffscreenCanvas(
      image.width * scale, image.height * scale
    )
    const context = canvas.getContext('2d')!
    context.drawImage(image, 0, 0, image.width * scale, image.height * scale)
    const blob = await canvas.convertToBlob(
      { type: 'image/jpeg', quality: 0.7 }
    )
    return readBlobAsDataUri(blob!)
  })
)

const readBlobAsDataUri = (
  blob: Blob,
  onLoad?: (event: ProgressEvent<FileReader>) => Promise<string>
) => new Promise<string>(resolve => {
  const reader = new FileReader()
  reader.onloadend = (event => resolve(
    onLoad ? onLoad(event) : event.target!.result as string
  ))
  reader.readAsDataURL(blob)
})

