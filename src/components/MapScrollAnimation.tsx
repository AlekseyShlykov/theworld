import React from 'react';
import './MapScrollAnimation.css';

interface MapScrollAnimationProps {
  imageSrc: string;
  animationKey?: number | string; // Key to force remount and restart animation
  scrollSpeed?: number; // Animation duration in seconds
}

export const MapScrollAnimation: React.FC<MapScrollAnimationProps> = ({ 
  imageSrc,
  animationKey,
  scrollSpeed = 30 // Default fallback
}) => {
  return (
    <div className="map-scroll-animation-container">
      <div 
        className="map-scroll-animation-wrapper"
        style={{ animationDuration: `${scrollSpeed}s` }}
      >
        <img
          key={`${animationKey}-1`} // Forces remount → animation restarts
          src={imageSrc}
          alt="Animated map"
          className="map-scroll-animation-image"
          onError={(e) => {
            // Fallback if image doesn't load
            e.currentTarget.style.display = 'none';
          }}
        />
        <img
          key={`${animationKey}-2`} // Duplicate for seamless looping
          src={imageSrc}
          alt=""
          className="map-scroll-animation-image"
          aria-hidden="true"
          onError={(e) => {
            // Fallback if image doesn't load
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
};



