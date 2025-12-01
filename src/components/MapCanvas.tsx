import React, { useRef, useEffect, useState } from 'react';
import { Area, LogicData } from '../types';
import { MapRenderer } from '../utils/mapRenderer';

interface MapCanvasProps {
  areas: Area[];
  logic: LogicData;
  highlightedArea: string | null;
  animationProgress?: number;
  currentTurn: number;
  onSelect?: (areaId: string) => void;
  onHover?: (areaId: string | null) => void;
  disabled?: boolean;
  hasSelected?: boolean;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  areas,
  logic,
  highlightedArea,
  animationProgress = 1.0,
  currentTurn,
  onSelect,
  onHover,
  disabled = false,
  hasSelected = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [renderer, setRenderer] = useState<MapRenderer | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize renderer and load assets
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const mapRenderer = new MapRenderer(canvas, currentTurn);
    setRenderer(mapRenderer);

    // Load land mask
    const baseUrl = import.meta.env.BASE_URL;
    mapRenderer.loadLandMask(`${baseUrl}assets/land-mask.png`).then(() => {
      setMapLoaded(true);
    }).catch((err) => {
      console.error('Failed to load land mask:', err);
      setMapLoaded(true); // Continue anyway
    });
  }, [currentTurn]);

  // Load base map image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseUrl = import.meta.env.BASE_URL;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.onerror = () => {
      // Draw fallback background
      ctx.fillStyle = '#2c5f7d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    img.src = `${baseUrl}assets/map-image.png`;
  }, []);

  // Render area overlays
  useEffect(() => {
    if (!renderer || !mapLoaded) return;

    renderer.renderAreas(areas, logic, animationProgress, highlightedArea);
  }, [renderer, areas, logic, animationProgress, highlightedArea, mapLoaded]);

  // Convert screen coordinates to canvas coordinates
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number;
    let clientY: number;

    if ('touches' in e || 'changedTouches' in e) {
      // Touch event - use changedTouches for touchEnd, touches for touchStart/move
      const touch = (e as React.TouchEvent<HTMLCanvasElement>).changedTouches?.[0] || 
                    (e as React.TouchEvent<HTMLCanvasElement>).touches?.[0];
      if (!touch) return null;
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return { x, y };
  };

  // Handle click on map
  const handleMapClick = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled || hasSelected || !onSelect || !renderer) return;

    // Prevent default for touch events to avoid scrolling
    if ('touches' in e || 'changedTouches' in e) {
      e.preventDefault();
    }

    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    const areaId = renderer.getAreaAtPixel(coords.x, coords.y);
    if (areaId) {
      // Play SFX if available
      if ((window as any).playClickSound) {
        (window as any).playClickSound();
      }
      onSelect(areaId);
    }
  };

  // Handle hover on map
  const handleMapHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled || hasSelected || !onHover || !renderer) return;

    const coords = getCanvasCoordinates(e);
    if (!coords) {
      onHover(null);
      return;
    }

    const areaId = renderer.getAreaAtPixel(coords.x, coords.y);
    onHover(areaId);
  };

  // Handle mouse leave
  const handleMapMouseLeave = () => {
    if (disabled || hasSelected || !onHover) return;
    onHover(null);
  };

  const isClickable = !disabled && !hasSelected && !!onSelect;

  return (
    <div className="map-container" role="img" aria-label="World map showing area development">
      <canvas
        ref={canvasRef}
        width={800}
        height={533}
        className="map-base"
        aria-hidden="true"
        style={{ width: '100%', height: '100%' }}
      />
      <canvas
        ref={overlayCanvasRef}
        width={800}
        height={533}
        className={`map-overlay ${isClickable ? 'map-clickable' : ''}`}
        aria-hidden="true"
        style={{ 
          width: '100%', 
          height: '100%',
          cursor: isClickable ? 'pointer' : 'default'
        }}
        onClick={handleMapClick}
        onMouseMove={handleMapHover}
        onMouseLeave={handleMapMouseLeave}
        onTouchEnd={handleMapClick}
        onTouchStart={(e) => e.preventDefault()} // Prevent scrolling on touch start
      />
    </div>
  );
};

