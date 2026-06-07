/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Lock, Maximize2, Move, AlertCircle } from 'lucide-react';
import { CanvasElement, CanvasRatio } from '../types';

interface NewsCanvasProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElementPosition: (id: string, x: number, y: number) => void;
  onUpdateElementSize: (id: string, width: number, height: number) => void;
  onCommitHistory: () => void;
  
  ratio: CanvasRatio;
  canvasBg: string; // solid color or gradient computed string
  canvasBgType: 'solid' | 'gradient';
  canvasGradient?: string;
  canvasTexture: string;
}

export const NewsCanvas: React.FC<NewsCanvasProps> = ({
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElementPosition,
  onUpdateElementSize,
  onCommitHistory,
  ratio,
  canvasBg,
  canvasBgType,
  canvasGradient,
  canvasTexture,
}) => {
  const [scale, setScale] = useState(0.65);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Set up the virtual canvas size
  const V_WIDTH = 800;
  const getVirtualHeight = (r: CanvasRatio): number => {
    switch (r) {
      case '1:1': return 800;
      case '4:5': return 1000;
      case '16:9': return 450;
      case '9:16': return 1422;
      default: return 800;
    }
  };
  const V_HEIGHT = getVirtualHeight(ratio);

  // Adjust scaling dynamically to fit the parent container
  useEffect(() => {
    if (!containerRef.current) return;
    
    const scaleCanvas = () => {
      const containerWidth = containerRef.current?.getBoundingClientRect().width || 500;
      const containerHeight = containerRef.current?.getBoundingClientRect().height || 600;
      
      // Calculate scale based both on width and height space, staying comfortable
      const scaleW = (containerWidth - 40) / V_WIDTH;
      const scaleH = (containerHeight - 40) / V_HEIGHT;
      
      // Select the limiting scale
      let computedScale = Math.min(scaleW, scaleH);
      
      // Don't make it too microscopic, but cap the max zoom to clean look
      if (computedScale > 1.25) computedScale = 1.25;
      if (computedScale < 0.2) computedScale = 0.2;
      
      setScale(computedScale);
    };

    // Run measurement
    scaleCanvas();
    
    // Resize observers are robust
    const observer = new ResizeObserver(() => scaleCanvas());
    observer.observe(containerRef.current);
    
    window.addEventListener('resize', scaleCanvas);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', scaleCanvas);
    };
  }, [ratio, V_HEIGHT]);

  // Handle Drag-to-Move
  const handleMouseDown = (e: React.MouseEvent, elem: CanvasElement) => {
    if (elem.locked || elem.visible === false) return;
    e.preventDefault();
    e.stopPropagation();
    onSelectElement(elem.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const originalX = elem.x;
    const originalY = elem.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      // Convert browser actual pixels back to virtual scale
      const virtualDx = Math.round(dx / scale);
      const virtualDy = Math.round(dy / scale);

      // Keep inside a generous boundary check
      let nextX = originalX + virtualDx;
      let nextY = originalY + virtualDy;

      onUpdateElementPosition(elem.id, nextX, nextY);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      onCommitHistory(); // Store final coordinate into Undo history!
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Handle Drag-to-Resize (Corner Anchor)
  const handleResizeStart = (e: React.MouseEvent, elem: CanvasElement) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const originalWidth = elem.width;
    const originalHeight = elem.height;

    const handleResizeMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      // Convert actual translation back to virtual scaling factor
      const virtualDx = Math.round(dx / scale);
      const virtualDy = Math.round(dy / scale);

      // Enforce minimum logical limits (e.g., width 40, height 12)
      const newWidth = Math.max(40, originalWidth + virtualDx);
      const newHeight = Math.max(12, originalHeight + virtualDy);

      onUpdateElementSize(elem.id, newWidth, newHeight);
    };

    const handleResizeUp = () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeUp);
      onCommitHistory(); // Store size change!
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeUp);
  };

  // Compute CSS Background Texture Overlays in safe responsive gradients
  const getTextureStyle = (): React.CSSProperties => {
    const isDark = canvasBgType === 'gradient' || canvasBg.toLowerCase() === '#0f172a' || canvasBg.toLowerCase() === '#020617' || canvasBg.toLowerCase() === '#090d1a' || canvasBg.toLowerCase() === '#1e293b';
    const gridLineColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)';
    const dotColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)';

    switch (canvasTexture) {
      case 'grid':
        return {
          backgroundImage: `linear-gradient(to right, ${gridLineColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridLineColor} 1px, transparent 1px)`,
          backgroundSize: '25px 25px',
        };
      case 'dots':
        return {
          backgroundImage: `radial-gradient(circle, ${dotColor} 1.5px, transparent 1.5px)`,
          backgroundSize: '16px 16px',
        };
      case 'noise':
        return {
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.06\'/%3E%3C/svg%3E")',
        };
      default:
        return {};
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="flex-1 bg-slate-950 flex items-center justify-center p-6 min-h-0 relative select-none overflow-hidden"
      onClick={() => onSelectElement(null)} // Click empty space to deselect
    >
      {/* Centered scaled Artboard wrapper */}
      <div 
        ref={canvasRef}
        id="news-capture-canvas"
        className="shadow-2xl absolute transition-shadow duration-300 relative border border-slate-800"
        style={{
          width: `${V_WIDTH}px`,
          height: `${V_HEIGHT}px`,
          background: canvasBgType === 'gradient' ? canvasGradient : canvasBg,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Background Texture Overlay Container */}
        <div 
          className="absolute inset-0 pointer-events-none select-none" 
          style={getTextureStyle()} 
        />

        {/* Artboard Elements Rendering */}
        {elements
          .filter((elem) => elem.visible !== false)
          .map((elem) => {
            const isSelected = selectedElementId === elem.id;
            
            // Generate styles directly mapping virtual properties
            const elementStyles: React.CSSProperties = {
              position: 'absolute',
              left: `${elem.x}px`,
              top: `${elem.y}px`,
              width: `${elem.width}px`,
              height: `${elem.height}px`,
              color: elem.style.color || 'inherit',
              backgroundColor: elem.style.backgroundColor || 'transparent',
              fontFamily: elem.style.fontFamily || 'sans-serif',
              fontSize: `${elem.style.fontSize}px`,
              lineHeight: elem.style.lineHeight || 'normal',
              fontWeight: elem.style.fontWeight || 'normal',
              fontStyle: elem.style.fontStyle || 'normal',
              textDecoration: elem.style.textDecoration || 'none',
              textAlign: elem.style.textAlign || 'left',
              letterSpacing: elem.style.letterSpacing ? `${elem.style.letterSpacing}px` : undefined,
              borderRadius: elem.style.borderRadius ? `${elem.style.borderRadius}px` : undefined,
              borderWidth: elem.style.borderWidth ? `${elem.style.borderWidth}px` : undefined,
              borderColor: elem.style.borderColor || 'transparent',
              borderStyle: elem.style.borderWidth ? 'solid' : undefined,
              opacity: elem.style.opacity !== undefined ? elem.style.opacity / 100 : undefined,
              boxShadow: elem.style.boxShadow || undefined,
              zIndex: elements.findIndex((e) => e.id === elem.id) + 5,
              cursor: elem.locked ? 'not-allowed' : 'move',
              overflow: elem.type === 'image' ? 'hidden' : 'visible',
            };

            return (
              <div
                key={elem.id}
                style={elementStyles}
                onMouseDown={(e) => handleMouseDown(e, elem)}
                className={`group absolute select-none outline-none ${
                  isSelected 
                    ? 'ring-2 ring-rose-500 ring-offset-1 ring-offset-slate-900 shadow-md z-[999]' 
                    : 'hover:ring-1 hover:ring-slate-400'
                }`}
              >
                {/* Element Specialized Component Renderers */}
                {elem.type === 'text' && (
                  <div className="w-full h-full select-none break-words whitespace-pre-wrap leading-tight">
                    {elem.content}
                  </div>
                )}

                {elem.type === 'logo-header' && (
                  <div className="w-full h-full select-none font-bold truncate leading-none">
                    {elem.content}
                  </div>
                )}

                {elem.type === 'footer' && (
                  <div className="w-full h-full select-none truncate leading-none">
                    {elem.content}
                  </div>
                )}

                {elem.type === 'badge' && (
                  <div 
                    className="w-full h-full flex items-center justify-center text-center truncate break-words px-2"
                    style={{
                      paddingTop: elem.style.paddingY ? `${elem.style.paddingY}px` : undefined,
                      paddingBottom: elem.style.paddingY ? `${elem.style.paddingY}px` : undefined,
                    }}
                  >
                    {elem.content}
                  </div>
                )}

                {elem.type === 'image' && (
                  <div className="w-full h-full relative" style={{ borderRadius: elem.style.borderRadius ? `${elem.style.borderRadius}px` : undefined }}>
                    <img
                      src={elem.content || 'https://images.unsplash.com/photo-1598075702565-d5521683b52f?w=400'}
                      alt="News poster feature"
                      referrerPolicy="no-referrer"
                      className="absolute block select-none pointer-events-none"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: `scale(${elem.imageScale || 1.0}) translate(${elem.imageOffsetX || 0}px, ${elem.imageOffsetY || 0}px)`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.05s ease-out',
                      }}
                    />
                  </div>
                )}

                {elem.type === 'shape' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                    {elem.shapeType === 'rectangle' && <div className="w-full h-full bg-current rounded-[inherit]" style={{ color: elem.style.backgroundColor }} />}
                    {elem.shapeType === 'circle' && <div className="w-[98%] h-[98%] bg-current rounded-full" style={{ color: elem.style.backgroundColor }} />}
                    {elem.shapeType === 'line' && <div className="w-full h-full bg-current shrink-0" style={{ backgroundColor: elem.style.backgroundColor, minHeight: '1px' }} />}
                    {elem.shapeType === 'ribbon' && (
                      <div 
                        className="w-[108%] -left-[4%] h-[90%] bg-current skew-x-12 absolute z-[-1] opacity-90" 
                        style={{ backgroundColor: elem.style.backgroundColor }} 
                      />
                    )}
                  </div>
                )}

                {/* Selection Indicators, Drag HUD overlays, Locked alerts */}
                {isSelected && (
                  <>
                    {/* Locked notice label overlay */}
                    {elem.locked && (
                      <div className="absolute -top-6 left-0 bg-rose-600 text-white font-semibold text-[10px] px-2 py-0.5 rounded shadow flex items-center gap-1 leading-none z-50">
                        <Lock size={10} />
                        <span>লক করা (Locked)</span>
                      </div>
                    )}

                    {/* Resize Handle Block Overlay (Only shown when not locked and has sizing option) */}
                    {!elem.locked && (
                      <>
                        {/* Interactive Drag Handle overlays */}
                        <div className="absolute -top-3.5 -left-3.5 bg-rose-600 text-white border border-white w-5 h-5 rounded-full flex items-center justify-center shadow scale-90" title="টেনে সরান">
                          <Move size={11} />
                        </div>

                        {/* Interactive Bottom-Right Corner Sizer Anchor */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, elem)}
                          className="absolute -bottom-1.5 -right-1.5 bg-rose-600 hover:bg-rose-500 hover:scale-125 transition-transform text-white border border-white w-4.5 h-4.5 rounded shadow cursor-se-resize flex items-center justify-center z-50"
                          title="আকার পরিবর্তন করুন (Resize)"
                        >
                          <Maximize2 size={9} />
                        </div>

                        {/* Size indicator HUD tag */}
                        <div className="absolute -bottom-6 left-0 bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[9px] px-1.5 py-0.5 rounded leading-none shadow">
                          {elem.width}px × {elem.height}px
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
