# Quick Start Guide

## Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:3000`

## First Time Setup

All assets and data files are included! The game is ready to play immediately after running `npm run dev`.

## Game Controls

### Desktop
- Click step indicators to see progress
- Hover over choice buttons to preview area highlights on map
- Click a button once to select and confirm

### Mobile
- Tap a choice button once to highlight the area
- Tap again to confirm selection

### Keyboard
- Use Tab to navigate between buttons
- Press Enter or Space to select

## Changing Language

Click the "EN" or "RU" button in the top-right corner to switch between English and Russian.

## Customizing Content

### Edit Game Text
- Edit `public/data/en.json` for English content
- Edit `public/data/ru.json` for Russian content
- Changes require a page refresh

### Adjust Game Balance
- Edit `public/data/logic.json` for:
  - Area starting positions
  - Growth rates
  - Barrier thresholds
  - Animation speed
- Edit `public/data/turnLogic.json` for:
  - Power/Acc gains per choice
  - Turn-by-turn balance

### Create Custom Maps
1. Edit map with your favorite image editor:
   - `public/assets/map-image.png` (decorative map)
   - `public/assets/land-mask.png` (black/white mask)
2. Or run: `python3 scripts/create-placeholder-pngs.py`
3. Or open: `public/assets/generate-map-assets.html` in browser

## Project Structure

```
├── public/
│   ├── data/           # All game content (JSON)
│   └── assets/         # Images and icons
├── src/
│   ├── components/     # React UI components
│   ├── hooks/          # Game state management
│   ├── utils/          # Map rendering engine
│   ├── App.tsx         # Main app
│   └── types.ts        # TypeScript definitions
└── scripts/            # Asset generation tools
```

## Building for Production

```bash
npm run build
npm run preview
```

Production files will be in the `dist/` directory.

## Troubleshooting

### Map not showing?
- Check that `public/assets/map-image.png` exists
- Check browser console for errors
- Try regenerating: `python3 scripts/create-placeholder-pngs.py`

### Overlays not rendering?
- Ensure `public/assets/land-mask.png` exists
- Check that it's a proper black/white mask image

### Content not loading?
- Verify all JSON files in `public/data/` are valid
- Check browser console for parse errors
- Validate JSON at https://jsonlint.com/

### Icons not showing?
- Icons are SVG files with .png extension (works in modern browsers)
- Fallback shows step numbers if icons fail to load

## Development Tips

### Hot Reload
Vite provides instant hot module replacement. Changes to React components update without page refresh.

### TypeScript
All code is fully typed. Your IDE will provide autocomplete and error checking.

### Performance
The map renderer uses Canvas2D and runs at 60 FPS. Each overlay animation completes in ≤3 seconds.

## Game Flow

1. **Phase 1**: Read historical narration → Click "Continue"
2. **Phase 2**: Choose which area develops → Click area button
3. **Phase 3**: Learn the consequences → Click "Next Turn"
4. Repeat for 8 turns
5. View final rankings and restart

Enjoy exploring how geography shaped human history! 🌍

