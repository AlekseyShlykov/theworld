import React from 'react';
import './MapScrollAnimation.css';

interface MapScrollAnimationProps {
  imageSrc: string;
  animationKey?: number | string; // Key to force remount and restart animation
}

export const MapScrollAnimation: React.FC<MapScrollAnimationProps> = ({ 
  imageSrc,
  animationKey 
}) => {
  return (
    <div className="map-scroll-animation-container">
      <img
        key={animationKey} // Forces remount → animation restarts
        src={imageSrc}
        alt="Animated map"
        className="map-scroll-animation-image"
        onError={(e) => {
          // Fallback if image doesn't load
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};



