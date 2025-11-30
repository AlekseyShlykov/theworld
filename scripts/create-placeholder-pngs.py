#!/usr/bin/env python3
"""
Generate placeholder PNG images for map and mask
Requires: pillow (pip install pillow)
"""

try:
    from PIL import Image, ImageDraw
    import os
    
    # Create output directory
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets')
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate map-image.png (800x600)
    print("Generating map-image.png...")
    map_img = Image.new('RGB', (800, 600), color='#2c5f7d')
    draw = ImageDraw.Draw(map_img)
    
    # Draw land masses (simplified continents)
    land_color = '#8b7355'
    
    # Eurasia (large ellipse)
    draw.ellipse([120, 130, 680, 370], fill=land_color)
    
    # Africa
    draw.ellipse([270, 320, 430, 520], fill=land_color)
    
    # Americas
    draw.ellipse([90, 60, 210, 340], fill=land_color)
    draw.ellipse([80, 310, 180, 490], fill=land_color)
    
    # Australia
    draw.ellipse([580, 400, 720, 500], fill=land_color)
    
    map_img.save(os.path.join(output_dir, 'map-image.png'))
    print("✓ Created map-image.png")
    
    # Generate land-mask.png (800x600)
    print("Generating land-mask.png...")
    mask_img = Image.new('RGB', (800, 600), color='#000000')
    draw = ImageDraw.Draw(mask_img)
    
    # Draw white land (same shapes)
    land_color = '#FFFFFF'
    
    draw.ellipse([120, 130, 680, 370], fill=land_color)
    draw.ellipse([270, 320, 430, 520], fill=land_color)
    draw.ellipse([90, 60, 210, 340], fill=land_color)
    draw.ellipse([80, 310, 180, 490], fill=land_color)
    draw.ellipse([580, 400, 720, 500], fill=land_color)
    
    # Add some barriers (black lines for rivers/mountains)
    draw.line([(300, 200), (320, 280)], fill='#000000', width=8)
    draw.line([(450, 180), (480, 240)], fill='#000000', width=12)
    
    mask_img.save(os.path.join(output_dir, 'land-mask.png'))
    print("✓ Created land-mask.png")
    
    print("\nAll map assets generated successfully!")
    
except ImportError:
    print("Error: Pillow library not found")
    print("Install it with: pip install pillow")
    print("\nAlternatively, open public/assets/generate-map-assets.html in a browser")
    print("and download the images manually.")

