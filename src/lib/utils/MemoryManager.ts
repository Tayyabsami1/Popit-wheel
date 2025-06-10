/**
 * MemoryManager - A utility class for managing memory efficiently
 * 
 * Helps keep memory usage under control by providing mechanisms to:
 * - Schedule cleanup operations
 * - Clear image and object caches
 * - Optimize large data structures
 * - Handle memory pressure events
 */

// Types for memory pressure indicators
type MemoryPressureLevel = 'low' | 'moderate' | 'critical';

interface MemoryStats {
  lastCleanupTime: number;
  cleanupCount: number;
  pressureLevel: MemoryPressureLevel;
  imageCacheSize: number;
}

/**
 * MemoryManager singleton to manage application memory
 */
class MemoryManager {
  private static instance: MemoryManager;
  private cleanupInterval: number = 30000; // 30 seconds
  private lastCleanupTime: number = 0;
  private imageCaches: Map<string, Map<string, any>> = new Map();
  private objectCaches: Map<string, Map<string, any>> = new Map();
  private cleanupCallbacks: Array<() => void> = [];
  private isObserving: boolean = false;
  private memoryStats: MemoryStats = {
    lastCleanupTime: 0,
    cleanupCount: 0,
    pressureLevel: 'low',
    imageCacheSize: 0
  };

  /**
   * Get the MemoryManager instance (singleton)
   */
  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Private constructor - use getInstance() instead
   */
  private constructor() {
    this.setupEventListeners();
    this.schedulePeriodicCleanup();
  }
  
  /**
   * Set up event listeners for memory pressure
   */
  private setupEventListeners(): void {
    // Check if performance.memory is available (Chrome only)
    if ('performance' in window && 'memory' in (performance as any)) {
      this.isObserving = true;
      // Monitor memory usage periodically
      setInterval(() => this.checkMemoryPressure(), 5000);
    }
    
    // Listen for visibility change to optimize for background tabs
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.forceClearMemory();
      }
    });
  }
  
  /**
   * Check for memory pressure (Chrome only)
   */
  private checkMemoryPressure(): void {
    if (!this.isObserving) return;
    
    const memoryInfo = (performance as any).memory;
    if (memoryInfo) {
      const usedHeapRatio = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;
      
      // Update memory pressure level
      if (usedHeapRatio > 0.8) {
        this.memoryStats.pressureLevel = 'critical';
        this.forceClearMemory();
      } else if (usedHeapRatio > 0.6) {
        this.memoryStats.pressureLevel = 'moderate';
        this.cleanupNonEssentialMemory();
      } else {
        this.memoryStats.pressureLevel = 'low';
      }
    }
  }
  
  /**
   * Schedule periodic memory cleanup
   */
  private schedulePeriodicCleanup(): void {
    const scheduleFunc = window.requestIdleCallback || setTimeout;
    
    const runCleanup = () => {
      const now = performance.now();
      if (now - this.lastCleanupTime > this.cleanupInterval) {
        this.cleanupNonEssentialMemory();
        this.lastCleanupTime = now;
        this.memoryStats.lastCleanupTime = now;
        this.memoryStats.cleanupCount++;
      }
      
      scheduleFunc(() => runCleanup(), { timeout: 10000 });
    };
    
    scheduleFunc(() => runCleanup(), { timeout: 10000 });
  }
  
  /**
   * Register an image cache for management
   */
  public registerImageCache(id: string, cache: Map<string, any>): void {
    this.imageCaches.set(id, cache);
    this.updateCacheStats();
  }
  
  /**
   * Register an object cache for management
   */
  public registerObjectCache(id: string, cache: Map<string, any>): void {
    this.objectCaches.set(id, cache);
  }
  
  /**
   * Register a cleanup callback to be called during memory pressure
   */
  public registerCleanupCallback(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }
  
  /**
   * Force clear memory - for critical situations
   */
  public forceClearMemory(): void {
    // Clear all image caches
    this.imageCaches.forEach(cache => cache.clear());
    
    // Clear object caches with non-essential items
    this.objectCaches.forEach(cache => cache.clear());
    
    // Run all registered cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (e) {
        console.error('Error in cleanup callback:', e);
      }
    });
    
    this.updateCacheStats();
    
    // Suggest garbage collection (only works in debug contexts)
    if (window.gc) {
      try {
        window.gc();
      } catch (e) {
        // Ignore - only works in debug mode
      }
    }
  }
  
  /**
   * Clean up non-essential memory - for moderate pressure situations
   */
  public cleanupNonEssentialMemory(): void {
    // Clear image caches for non-visible elements
    this.imageCaches.forEach(cache => {
      // Keep only the most recently used items
      if (cache.size > 20) {
        // Delete older entries
        const keysToDelete = Array.from(cache.keys()).slice(0, cache.size - 20);
        keysToDelete.forEach(key => cache.delete(key));
      }
    });
    
    this.updateCacheStats();
  }
  
  /**
   * Update cache statistics
   */
  private updateCacheStats(): void {
    let totalSize = 0;
    this.imageCaches.forEach(cache => {
      totalSize += cache.size;
    });
    this.memoryStats.imageCacheSize = totalSize;
  }
  
  /**
   * Get current memory statistics
   */
  public getMemoryStats(): MemoryStats {
    return {...this.memoryStats};
  }
  
  /**
   * Optimize a large array of objects by removing unnecessary properties
   * Useful for large datasets like wheel entries
   */
  public optimizeLargeArray<T>(array: T[], essentialKeys: (keyof T)[]): T[] {
    if (array.length < 50) return array; // Don't optimize small arrays
    
    return array.map(item => {
      const optimized = {} as T;
      essentialKeys.forEach(key => {
        optimized[key] = item[key];
      });
      return optimized;
    });
  }
}

// Define a global reference to make it available to worker contexts
declare global {
  interface Window {
    gc?: () => void;
    requestIdleCallback?: (
      callback: () => void, 
      options?: { timeout: number }
    ) => number;
  }
}

// Export a singleton instance
export default MemoryManager.getInstance();
