import { useEffect, useRef } from 'react';

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number, height: number;
    let stars: Array<{ x: number; y: number; z: number }> = [];
    const numStars = 200;
    const speed = 0.2;
    let centerX: number, centerY: number;
    let animationFrameId: number;

    function initStars() {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      // Create initial stars
      for(let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width - centerX,
          y: Math.random() * height - centerY,
          z: Math.random() * width
        });
      }
      
      animateStars();
    }

    function resizeCanvas() {
      if (!canvas) return; // Guard against null canvas
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      centerX = width / 2;
      centerY = height / 2;
    }

    function animateStars() {
      if (!ctx) return; // Guard against null context
      
      // Clear with slight fade effect for trails, or solid black
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = 'white';
      
      for(let i = 0; i < numStars; i++) {
        let star = stars[i];
        
        // Move star closer (decrease z)
        star.z -= speed;
        
        // Reset star if it passes the screen or hits the center too close
        if(star.z <= 0) {
          resetStar(star);
        }
        
        // Project 3D to 2D
        // The constant 128.0 determines the FOV
        let k = 128.0 / star.z;
        let px = star.x * k + centerX;
        let py = star.y * k + centerY;
        
        // Calculate size based on proximity
        let size = (1 - star.z / width) * 1.5; // Smaller size
        
        // Draw if within bounds
        if(px >= 0 && px <= width && py >= 0 && py <= height && size > 0) {
          // Create a safe zone in the center for image and text
          const dx = px - centerX;
          const dy = py - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const safeRadius = 300; // Radius around center where stars fade out
          
          if (dist > safeRadius) {
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
          } else if (dist > safeRadius - 100) {
            // Fade out near the edge of safe zone
            const alpha = (dist - (safeRadius - 100)) / 100;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(animateStars);
    }

    function resetStar(star: { x: number; y: number; z: number }) {
      star.x = Math.random() * width - centerX;
      star.y = Math.random() * height - centerY;
      star.z = width; // Reset to far away
    }

    initStars();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas 
      id="starfield" 
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        backgroundColor: '#000',
        pointerEvents: 'none'
      }}
    />
  );
}

