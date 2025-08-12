import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Minus, Square, X, Maximize2, Minimize2 } from 'lucide-react';

const Window = ({ 
  id, 
  title, 
  children, 
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 400, height: 300 },
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  isMinimized = false,
  isMaximized = false,
  zIndex = 1
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const windowRef = useRef(null);

  // Handle dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('.window-controls')) return; // Não arrastar se clicar nos controles
    
    setIsDragging(true);
    onFocus && onFocus(); // Trazer janela para frente
    
    const rect = windowRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging && !isMaximized) {
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y));
      
      setPosition({
        x: newX,
        y: newY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, size, isMaximized]);

  if (isMinimized) {
    return null;
  }

  const windowStyle = isMaximized 
    ? { 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: 'calc(100vh - 40px)', // Deixar espaço para taskbar
        zIndex 
      }
    : { 
        position: 'fixed', 
        left: position.x, 
        top: position.y, 
        width: size.width, 
        height: size.height,
        zIndex 
      };

  return (
    <motion.div
      ref={windowRef}
      className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden"
      style={windowStyle}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onClick={() => onFocus && onFocus()}
    >
      {/* Title Bar */}
      <div
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 flex items-center justify-between cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="flex items-center space-x-2 window-controls">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize && onMinimize();
            }}
            className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors"
          >
            <Minus size={10} className="text-yellow-800" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMaximize && onMaximize();
            }}
            className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors"
          >
            {isMaximized ? <Minimize2 size={8} className="text-green-800" /> : <Maximize2 size={8} className="text-green-800" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose && onClose();
            }}
            className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
          >
            <X size={10} className="text-red-800" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-auto bg-white" style={{ height: 'calc(100% - 40px)' }}>
        {children}
      </div>
    </motion.div>
  );
};

export default Window;

