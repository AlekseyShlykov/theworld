# Asset Generation Instructions

## Map Images

To generate `map-image.png` and `land-mask.png`:

1. Open `generate-map-assets.html` in this directory with a web browser
2. The page will display two canvases with the generated images
3. Click the download links to save both PNG files
4. Place them in this `public/assets/` directory

Alternatively, you can create your own map images:

### map-image.png (800x600)
- A visual world map with land (brown/tan) and ocean (blue)
- This is the decorative background shown to players

### land-mask.png (800x600)
- A black and white mask image
- White pixels = land (areas can expand here)
- Black pixels = ocean/barriers (areas cannot expand unless they have high Acc)
- Use black lines/gaps to create rivers, mountains, and ocean barriers

## Icons

Icon files are already provided as SVG files with `.png` extension. Modern browsers will render them correctly. If you need actual PNG files, you can:

1. Open each `.png` file (they're actually SVG)
2. Screenshot or export as PNG
3. Or use an SVG-to-PNG converter

The game includes fallback handling for missing icons.

