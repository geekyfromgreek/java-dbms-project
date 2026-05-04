import React, { useRef, useState } from 'react';

const SpotlightCard = ({ children, className = '', color = 'rgba(255, 255, 255, 0.1)', mode = 'card' }) => {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    containerRef.current.style.setProperty('--mouse-x', `${x}px`);
    containerRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const baseClass = mode === 'card' ? 'spotlight-card' : 'spotlight-item';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${baseClass} ${className}`}
      style={{
        '--spotlight-color': color,
      }}
    >
      {children}
    </div>
  );
};

export default SpotlightCard;
