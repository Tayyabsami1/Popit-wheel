// This helper function optimizes the drawing of slices
// It's extracted to avoid modifying the core WheelPainter.drawSlicesNoCache method
import type Wheel from '$lib/utils/Wheel';
import { hubSizes } from '$lib/utils/WheelConfig';
import { truncateText, getTextColor } from '$lib/utils/FontPicker';

type Context = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

// Pre-compute colors for slices to avoid recalculating in each draw call
const WHEEL_COLORS = ["#3369E8", "#8E44AD", "#009925", "#D50F25", "#EEB211"]; // blue, purple, green, red, yellow

export function drawOptimizedSlice(
  context: Context, 
  wheel: Wheel, 
  index: number, 
  radius: number, 
  radians: number
) {
  if (!wheel.entries[index] || wheel.entries[index].text.trim() === '') {
    return; // Skip empty entries
  }
  
  if (wheel.config.type === 'color') {
    const colorCount = WHEEL_COLORS.length;
    
    // Calculate the exact position in your pattern - memoize this in production
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
    
    const bgColor = WHEEL_COLORS[colorIndex];
    
    // Draw background
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, radius, -radians / 2, radians / 2);
    context.lineTo(0, 0);
    context.fillStyle = bgColor;
    context.fill();
    
    // Draw text
    drawOptimizedText(context, wheel.entries[index].text, radius, getTextColor(bgColor));
  } else {
    // For non-color wheels
    drawOptimizedText(context, wheel.entries[index].text, radius, 'white', 'black');
  }
}

export function drawOptimizedText(
  context: Context,
  text: string,
  radius: number,
  color: string,
  strokeColor?: string
) {
  context.lineJoin = 'round';
  context.textBaseline = 'middle';
  context.textAlign = 'end';
  context.fillStyle = color;
  
  // Cache truncated text
  const displayText = truncateText(text);
  
  // Only draw stroke if requested
  if (strokeColor) {
    context.strokeStyle = strokeColor;
    context.lineWidth = 3;
    context.strokeText(displayText, radius * 15 / 16, 0);
  }
  
  context.fillText(displayText, radius * 15 / 16, 0);
}
