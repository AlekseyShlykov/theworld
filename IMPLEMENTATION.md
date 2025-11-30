# Implementation Details

## Overview

This document provides technical details about the "Guns, Germs & Steel" game implementation.

## Architecture

### Technology Stack
- **React 18** - Component-based UI framework
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool with HMR (Hot Module Replacement)
- **Canvas API** - High-performance map rendering

### Project Structure

```
src/
├── components/          # React components (UI)
│   ├── StepIndicators   # Top progress bar
│   ├── MapCanvas        # Canvas-based map renderer
│   ├── ChoiceButtons    # Area selection interface
│   ├── PhaseContent     # Story and facts display
│   └── Toast            # Notifications
├── hooks/               # React hooks (state management)
│   ├── useGameData      # Load JSON data
│   └── useGameState     # Game state logic
├── utils/               # Core algorithms
│   ├── mapRenderer      # Area growth & rendering
│   └── seededRandom     # Deterministic RNG
└── types.ts             # TypeScript type definitions
```

## Core Algorithms

### Map Rendering Engine

Located in `src/utils/mapRenderer.ts`, this is the most complex part of the system.

#### 1. Land Mask Processing
```typescript
loadLandMask(maskImageUrl: string): Promise<void>
```
- Loads land-mask.png
- Converts to binary mask (white=1, black=0)
- Stores as ImageData for fast pixel access

#### 2. Frontier Propagation Algorithm
```typescript
generateAreaOverlay(area: Area, logic: LogicData, animationProgress: number): Set<string>
```

**How it works:**
1. Start at area's origin point (normalized coordinates)
2. Initialize frontier with starting pixel
3. While frontier not empty:
   - Pop current pixel
   - Check 8 neighboring pixels
   - For each neighbor:
     - Calculate distance with Perlin-like perturbation for smooth edges
     - If distance < maxRadius (based on Acc):
       - Check if on land (mask)
       - If blocked, measure barrier width
       - Classify barrier (river/mountain/ocean)
       - Allow crossing only if Acc ≥ threshold
       - Add to frontier if passable
4. Return set of pixel coordinates

**Growth Calculation:**
```
maxRadius = baseRadius × (growthMultiplier ^ (Acc - 1)) × animationProgress
```
- Default: baseRadius = 50, growthMultiplier = 1.5
- Acc = 1.0 → radius 50
- Acc = 2.0 → radius 75
- Acc = 3.0 → radius 112.5

**Barrier Detection:**
```typescript
measureBarrier(x, y, dx, dy, maxDist): number
```
- Traces line from current position in direction (dx, dy)
- Measures distance until hitting land again
- Returns: barrier width in pixels

**Barrier Classification:**
- width < 5px → River (requires Acc ≥ 1.0)
- width < 15px → Mountain (requires Acc ≥ 3.0)
- width ≥ 15px → Ocean (requires Acc ≥ 7.0)

#### 3. Overlap Resolution
```typescript
renderAreas(areas: Area[], logic: LogicData, ...): Promise<void>
```

For each pixel:
1. Find all areas claiming this pixel
2. If multiple claimants:
   - Find max Power among claimants
   - Filter to only those with max Power
   - If still tied:
     - Use seeded RNG (seed = x*1000 + y + turn)
     - Randomly select winner (deterministic)
3. Render winner's color with opacity based on power rank

#### 4. Power Ranking & Opacity
```typescript
rankAreas(areas: Area[], opacityByRank): Map<string, number>
```
- Sort areas by Power (descending)
- Assign opacity from opacityByRank mapping:
  - Rank 1 → 0.8 alpha
  - Rank 2 → 0.75 alpha
  - Rank 3 → 0.7 alpha
  - Rank 4 → 0.65 alpha
  - Rank 5 → 0.6 alpha

### Seeded Random Number Generator

Located in `src/utils/seededRandom.ts`

**Purpose:** Deterministic random numbers for stable tie-breaking

**Algorithm:** Linear Congruential Generator (LCG)
```
seed = (seed × 9301 + 49297) mod 233280
random = seed / 233280
```

Benefits:
- Same seed → same sequence
- Pixel overlap ties render consistently
- No visual flickering between frames

### Game State Management

Located in `src/hooks/useGameState.ts`

**State Structure:**
```typescript
{
  currentTurn: number,      // 1-8
  currentPhase: GamePhase,  // 'phase1' | 'phase2' | 'phase3' | 'complete'
  areas: Area[],            // Current area stats
  completedSteps: number[], // For UI indicators
  selectedArea: string,     // Last choice
  highlightedArea: string   // Hover preview
}
```

**Key Functions:**
- `selectArea(areaId, turnLogic, logic)` - Apply power/acc deltas
- `nextTurn()` - Advance to next turn or completion screen
- `restartGame()` - Reset to initial state

### Data Loading

Located in `src/hooks/useGameData.ts`

**Loads three JSON files:**
1. `/data/logic.json` - Game parameters
2. `/data/{language}.json` - Localized content
3. `/data/turnLogic.json` - Turn-by-turn deltas

**Features:**
- Parallel loading with Promise.all
- Error handling with fallback UI
- Reactive to language changes

## Animation System

### Overlay Growth Animation

Implemented in `src/App.tsx`:

```typescript
useEffect(() => {
  let startTime = null;
  const duration = logic.overlayAnimationMaxMs; // 3000ms
  
  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    setAnimationProgress(progress);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
}, [currentPhase, currentTurn]);
```

**Performance:**
- Uses requestAnimationFrame for 60 FPS
- Progress passed to renderer (0.0 to 1.0)
- Renderer scales area radius by progress
- Completes in ≤3000ms (configurable)

## Data-Driven Design

### Content Schema

All text and numbers live in JSON files:

**logic.json:**
- Area positions (normalized coordinates)
- Initial power/acc values
- Area colors (hex)
- Barrier thresholds
- Animation timing
- Growth parameters

**en.json / ru.json:**
- UI labels
- Step titles
- Phase 1 narration (historical context)
- Phase 2 questions
- Phase 3 facts (detailed explanations)
- Media file references

**turnLogic.json:**
- Power deltas per choice per turn
- Acc deltas per choice per turn
- Easily tuned for game balance

### Benefits
1. **No code changes** needed to adjust balance
2. **Easy localization** - add new language by copying JSON
3. **Content editing** by non-programmers
4. **A/B testing** different narratives
5. **Rapid iteration** on game feel

## Accessibility Features

### Keyboard Navigation
- All buttons are keyboard-accessible
- Tab order follows visual flow
- Enter/Space to activate buttons
- Focus indicators visible

### ARIA Labels
```tsx
<div role="navigation" aria-label="Game progress">
<div aria-current="step">
<button aria-label="Select Region 1: Fertile Crescent">
<div role="img" aria-label="World map showing area development">
<div role="status" aria-live="polite"> // Toast
```

### Screen Reader Support
- Semantic HTML elements
- Descriptive labels
- Status announcements for game events

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

### Focus Styles
```css
button:focus-visible {
  outline: 3px solid var(--accent-color);
  outline-offset: 3px;
}
```

## Mobile Optimizations

### Touch Interactions
- Two-tap confirm on mobile (first tap highlights, second confirms)
- Desktop: single click to select
- Detection via `window.matchMedia('(pointer: fine)')`

### Responsive Layout
```css
@media (max-width: 768px) {
  /* Smaller text, reduced spacing, stacked layout */
}
```

### Canvas Scaling
- Canvas set to fixed 800×600
- CSS scales to fit container
- Maintains aspect ratio

## Performance Considerations

### Asset Preloading
- Map images loaded before render
- Icons loaded lazily with fallback

### Offscreen Rendering
- All area calculations done in memory
- Final composite to visible canvas
- Minimizes repaints

### Efficient Data Structures
- Set<string> for pixel membership (O(1) lookup)
- Map<string, number> for opacity lookup
- Frontier queue for breadth-first growth

### Optimization Opportunities
1. Web Workers for map calculation
2. OffscreenCanvas for parallel rendering
3. WebGL for GPU acceleration
4. Spatial indexing for overlap detection

## Testing Recommendations

### Unit Tests
- `seededRandom.ts` - Verify determinism
- `rankAreas()` - Test tie-breaking
- Game state transitions

### Integration Tests
- Data loading from JSON
- Language switching
- Turn progression

### Visual Regression Tests
- Screenshot comparison of map renders
- Ensure deterministic output

### Performance Tests
- Render time < 100ms per frame
- Animation maintains 60 FPS
- Memory usage stable over 8 turns

## Extending the Game

### Adding More Areas
1. Add to `logic.json` areas array
2. Add labels to language files
3. Update turnLogic.json with new choices
4. Update UI colors

### Adding More Turns
1. Increment `turns` in logic.json
2. Add step 9 to language JSON
3. Add turn9 to turnLogic.json
4. Create step9 icon

### Custom Rendering Modes
The MapRenderer class is designed to be extended:
```typescript
class CustomRenderer extends MapRenderer {
  // Override methods to customize behavior
}
```

### Alternative Map Projections
Modify `generateAreaOverlay()` to use different coordinate systems (Mercator, Robinson, etc.)

## Known Limitations

1. **Fixed Canvas Size**: 800×600 hardcoded
2. **Client-Side Only**: No multiplayer or persistence
3. **No Undo**: Can only restart entire game
4. **2D Only**: No terrain elevation
5. **Static Barriers**: Can't change over time

## Future Enhancements

### Potential Features
- [ ] Save/load game state
- [ ] Multiple scenarios (different maps)
- [ ] Animated area transitions
- [ ] Sound effects and music
- [ ] Historical images in Phase 3
- [ ] Achievement system
- [ ] Leaderboard (based on final rankings)
- [ ] Tutorial mode
- [ ] Speed control for animations
- [ ] Zoom/pan on map

### Technical Improvements
- [ ] WebGL renderer for better performance
- [ ] Dynamic canvas sizing
- [ ] Better mobile gesture support
- [ ] Offline PWA support
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] E2E tests with Playwright
- [ ] Storybook for component development

## License & Credits

This educational project demonstrates:
- Complex canvas rendering
- Data-driven game design
- React state management
- TypeScript best practices
- Accessibility implementation

Inspired by Jared Diamond's "Guns, Germs & Steel"

