import { Area, LogicData } from '../types';
import { SeededRandom } from './seededRandom';

/**
 * MapRenderer handles the complex area overlay rendering with growth algorithm,
 * barriers, power-based ranking, and smooth boundaries.
 */
export class MapRenderer {
  private ctx: CanvasRenderingContext2D;
  private landMask: ImageData | null = null;
  private width: number;
  private height: number;
  private rng: SeededRandom;
  // Store pixel-to-area mapping for click detection
  private pixelToAreaMap: Map<string, string> = new Map();

  constructor(canvasParam: HTMLCanvasElement, seed: number = 42) {
    // Extract properties from canvas - we don't need to store the canvas itself
    const ctx = canvasParam.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2d context');
    this.ctx = ctx;
    this.width = canvasParam.width;
    this.height = canvasParam.height;
    this.rng = new SeededRandom(seed);
  }

  /**
   * Load and process the land mask image
   */
  async loadLandMask(maskImageUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.width;
        tempCanvas.height = this.height;
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.drawImage(img, 0, 0, this.width, this.height);
        this.landMask = tempCtx.getImageData(0, 0, this.width, this.height);
        resolve();
      };
      img.onerror = reject;
      img.src = maskImageUrl;
    });
  }

  /**
   * Check if a pixel is on land (white in mask)
   */
  private isLand(x: number, y: number): boolean {
    if (!this.landMask) return true;
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    
    const idx = (Math.floor(y) * this.width + Math.floor(x)) * 4;
    return this.landMask.data[idx] > 128; // White = land
  }

  /**
   * Measure barrier width in a given direction
   */
  private measureBarrier(x: number, y: number, dx: number, dy: number, maxDist: number = 50): number {
    let distance = 0;
    let cx = x;
    let cy = y;
    
    while (distance < maxDist) {
      cx += dx;
      cy += dy;
      distance += Math.sqrt(dx * dx + dy * dy);
      
      if (cx < 0 || cx >= this.width || cy < 0 || cy >= this.height) {
        return maxDist; // Hit edge, treat as ocean
      }
      
      if (this.isLand(cx, cy)) {
        return distance; // Found land again
      }
    }
    
    return maxDist; // Very wide barrier
  }

  /**
   * Classify barrier type based on width
   */
  private classifyBarrier(width: number, _thresholds: LogicData['barrierThresholds']): 'river' | 'mountain' | 'ocean' | null {
    if (width < 5) return 'river';
    if (width < 15) return 'mountain';
    return 'ocean';
  }

  /**
   * Check if an area can cross a barrier based on Acc
   */
  private canCrossBarrier(acc: number, barrierType: 'river' | 'mountain' | 'ocean' | null, thresholds: LogicData['barrierThresholds']): boolean {
    if (!barrierType) return true;
    
    switch (barrierType) {
      case 'river':
        return acc >= thresholds.river;
      case 'mountain':
        return acc >= thresholds.mountain;
      case 'ocean':
        return acc >= thresholds.ocean;
      default:
        return false;
    }
  }

  /**
   * Generate area overlay using frontier propagation
   */
  private generateAreaOverlay(
    area: Area,
    logic: LogicData,
    animationProgress: number = 1.0
  ): Set<string> {
    const pixels = new Set<string>();
    const startX = Math.floor(area.start.x * this.width);
    const startY = Math.floor(area.start.y * this.height);
    
    if (!this.isLand(startX, startY)) return pixels;

    // Calculate growth radius based on Acc and animation progress
    const baseRadius = logic.baseGrowthRadius;
    const growthFactor = Math.pow(logic.growthMultiplier, area.acc - 1);
    const maxRadius = baseRadius * growthFactor * animationProgress;

    // Frontier propagation with distance field
    const frontier: Array<{x: number, y: number, dist: number}> = [{x: startX, y: startY, dist: 0}];
    const visited = new Set<string>([`${startX},${startY}`]);
    
    while (frontier.length > 0) {
      const current = frontier.shift()!;
      pixels.add(`${current.x},${current.y}`);
      
      // Explore neighbors in 8 directions
      const directions = [
        [-1, -1], [0, -1], [1, -1],
        [-1,  0],          [1,  0],
        [-1,  1], [0,  1], [1,  1]
      ];
      
      for (const [dx, dy] of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;
        const key = `${nx},${ny}`;
        
        if (visited.has(key)) continue;
        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;
        
        // Calculate distance with slight Perlin-like perturbation for smoothness
        const distInc = Math.sqrt(dx * dx + dy * dy);
        const perturbation = (this.rng.next() - 0.5) * 2;
        const newDist = current.dist + distInc + perturbation;
        
        if (newDist > maxRadius) continue;
        
        // Check if on land
        if (!this.isLand(nx, ny)) {
          // Check if we can cross this barrier
          const barrierWidth = this.measureBarrier(current.x, current.y, dx, dy);
          const barrierType = this.classifyBarrier(barrierWidth, logic.barrierThresholds);
          
          if (!this.canCrossBarrier(area.acc, barrierType, logic.barrierThresholds)) {
            continue; // Can't cross this barrier
          }
          
          // If we can cross, allow a narrow corridor
          if (barrierWidth < 10 && this.rng.next() > 0.5) {
            visited.add(key);
            pixels.add(key);
          }
          continue;
        }
        
        visited.add(key);
        frontier.push({x: nx, y: ny, dist: newDist});
      }
    }
    
    return pixels;
  }

  /**
   * Rank areas by power and assign opacity
   */
  private rankAreas(areas: Area[], opacityByRank: Record<string, number>): Map<string, number> {
    const sorted = [...areas].sort((a, b) => b.power - a.power);
    const opacityMap = new Map<string, number>();
    
    sorted.forEach((area, index) => {
      const rank = (index + 1).toString();
      const opacity = opacityByRank[rank] || 0.5;
      opacityMap.set(area.id, opacity);
    });
    
    return opacityMap;
  }

  /**
   * Render all area overlays with proper overlap handling
   */
  async renderAreas(
    areas: Area[],
    logic: LogicData,
    animationProgress: number = 1.0,
    highlightedAreaId: string | null = null
  ): Promise<void> {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Rank areas and get opacity values
    const opacityMap = this.rankAreas(areas, logic.opacityByRank);
    
    // Generate overlays for each area
    const areaOverlays = new Map<string, Set<string>>();
    for (const area of areas) {
      const progress = animationProgress;
      const overlay = this.generateAreaOverlay(area, logic, progress);
      areaOverlays.set(area.id, overlay);
    }
    
    // Render pixel by pixel with proper precedence
    const imageData = this.ctx.createImageData(this.width, this.height);
    // Clear pixel-to-area mapping
    this.pixelToAreaMap.clear();
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const key = `${x},${y}`;
        
        // Find all areas claiming this pixel
        const claimingAreas = areas.filter(area => 
          areaOverlays.get(area.id)?.has(key)
        );
        
        if (claimingAreas.length === 0) continue;
        
        // Determine winner by power, then random tie-break
        let winner = claimingAreas[0];
        if (claimingAreas.length > 1) {
          const maxPower = Math.max(...claimingAreas.map(a => a.power));
          const topAreas = claimingAreas.filter(a => a.power === maxPower);
          
          if (topAreas.length > 1) {
            // Deterministic random selection
            this.rng.setSeed(x * 1000 + y + logic.turns);
            const index = this.rng.nextInt(0, topAreas.length);
            winner = topAreas[index];
          } else {
            winner = topAreas[0];
          }
        }
        
        // Store pixel-to-area mapping for click detection
        this.pixelToAreaMap.set(key, winner.id);
        
        // Get color and opacity
        const color = this.hexToRgb(winner.color);
        const opacity = opacityMap.get(winner.id) || 0.5;
        
        // Apply highlight effect
        let finalOpacity = opacity;
        if (highlightedAreaId === winner.id) {
          finalOpacity = Math.min(1.0, opacity + 2.0);
        }
        
        // Set pixel
        const idx = (y * this.width + x) * 4;
        imageData.data[idx] = color.r;
        imageData.data[idx + 1] = color.g;
        imageData.data[idx + 2] = color.b;
        imageData.data[idx + 3] = finalOpacity * 255;
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): {r: number, g: number, b: number} {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : {r: 0, g: 0, b: 0};
  }

  /**
   * Get the area ID at a given pixel coordinate (in canvas coordinates)
   * Returns null if no area is at that pixel
   */
  getAreaAtPixel(x: number, y: number): string | null {
    const pixelX = Math.floor(x);
    const pixelY = Math.floor(y);
    
    // Check bounds
    if (pixelX < 0 || pixelX >= this.width || pixelY < 0 || pixelY >= this.height) {
      return null;
    }
    
    const key = `${pixelX},${pixelY}`;
    return this.pixelToAreaMap.get(key) || null;
  }
}

