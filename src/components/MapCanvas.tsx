import React, { useRef, useEffect, useState } from 'react';
import { Area, LogicData } from '../types';
import { MapRenderer } from '../utils/mapRenderer';

interface MapCanvasProps {
  areas: Area[];
  logic: LogicData;
  highlightedArea: string | null;
  animationProgress?: number;
  currentTurn: number;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  areas,
  logic,
  highlightedArea,
  animationProgress = 1.0,
  currentTurn
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
    mapRenderer.loadLandMask('/assets/land-mask.png').then(() => {
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

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.onerror = () => {
      // Draw fallback background
      ctx.fillStyle = '#2c5f7d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    img.src = '/assets/map-image.png';
  }, []);

  // Render area overlays
  useEffect(() => {
    if (!renderer || !mapLoaded) return;

    renderer.renderAreas(areas, logic, animationProgress, highlightedArea);
  }, [renderer, areas, logic, animationProgress, highlightedArea, mapLoaded]);

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
        className="map-overlay"
        aria-hidden="true"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

