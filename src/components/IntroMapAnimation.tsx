import React from 'react';
import './IntroMapAnimation.css';

interface IntroMapAnimationProps {
  isActive: boolean;
  imageSource: string;
  animationKey?: number | string; // Key to force remount and restart animation
}

export const IntroMapAnimation: React.FC<IntroMapAnimationProps> = ({ 
  isActive, 
  imageSource,
  animationKey 
}) => {
  if (!isActive) return null;

  return (
    <div className="intro-map-animation-container intro-image-top-spacing">
      <img
        key={animationKey} // Forces remount → animation restarts
        src={imageSource}
        alt="Animated map"
        className="intro-map-animation-image"
        onError={(e) => {
          // Fallback if image doesn't load
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

