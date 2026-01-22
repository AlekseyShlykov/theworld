import React from 'react';
import './IntroMapAnimation.css';

interface IntroMapAnimationProps {
  isActive: boolean;
  imageSource: string;
  animationKey?: number | string; // Key to force remount and restart animation
  scrollSpeed?: number; // Animation duration in seconds
}

export const IntroMapAnimation: React.FC<IntroMapAnimationProps> = ({ 
  isActive, 
  imageSource,
  animationKey,
  scrollSpeed = 30 // Default fallback
}) => {
  if (!isActive) return null;

  return (
    <div className="intro-map-animation-container intro-image-top-spacing">
      <div 
        className="intro-map-animation-wrapper"
        style={{ animationDuration: `${scrollSpeed}s` }}
      >
        <img
          key={`${animationKey}-1`} // Forces remount → animation restarts
          src={imageSource}
          alt="Animated map"
          className="intro-map-animation-image"
          onError={(e) => {
            // Fallback if image doesn't load
            e.currentTarget.style.display = 'none';
          }}
        />
        <img
          key={`${animationKey}-2`} // Duplicate for seamless looping
          src={imageSource}
          alt=""
          className="intro-map-animation-image"
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

