import React, { useState, useCallback } from 'react';
import Window from './Window';

const WindowManager = ({ children }) => {
  const [windows, setWindows] = useState([]);
  const [nextZIndex, setNextZIndex] = useState(1);

  const openWindow = useCallback((windowConfig) => {
    const newWindow = {
      id: windowConfig.id || Date.now().toString(),
      title: windowConfig.title,
      content: windowConfig.content,
      initialPosition: windowConfig.initialPosition || { 
        x: Math.random() * 200 + 100, 
        y: Math.random() * 200 + 100 
      },
      initialSize: windowConfig.initialSize || { width: 400, height: 300 },
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const closeWindow = useCallback((windowId) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
  }, []);

  const minimizeWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
    ));
  }, []);

  const maximizeWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const bringToFront = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, zIndex: nextZIndex } : w
    ));
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  return (
    <div className="relative w-full h-full">
      {/* Background/Desktop */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        {children}
      </div>

      {/* Windows */}
      {windows.map(window => (
        <Window
          key={window.id}
          id={window.id}
          title={window.title}
          initialPosition={window.initialPosition}
          initialSize={window.initialSize}
          isMinimized={window.isMinimized}
          isMaximized={window.isMaximized}
          zIndex={window.zIndex}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onMaximize={() => maximizeWindow(window.id)}
          onFocus={() => bringToFront(window.id)}
        >
          {window.content}
        </Window>
      ))}

      {/* Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-blur-sm text-white p-2 flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          {windows.map(window => (
            <button
              key={window.id}
              onClick={() => minimizeWindow(window.id)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                window.isMinimized 
                  ? 'bg-gray-600 hover:bg-gray-500' 
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {window.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WindowManager;

