import React, { useState, useCallback } from 'react';
import './App.css';
import Window from './components/Window';
import Desktop from './components/Desktop';
import MobileLayout from './components/MobileLayout';
import AboutWindow from './components/AboutWindow';
import ProjectsWindow from './components/ProjectsWindow';
import SkillsWindow from './components/SkillsWindow';
import ContactWindow from './components/ContactWindow';
import useResponsive from './hooks/useResponsive';

function App() {
  const [windows, setWindows] = useState([]);
  const [nextZIndex, setNextZIndex] = useState(1);
  const { isMobile } = useResponsive();

  const windowComponents = {
    about: AboutWindow,
    projects: ProjectsWindow,
    skills: SkillsWindow,
    contact: ContactWindow
  };

  const windowTitles = {
    about: 'Sobre Mim',
    projects: 'Meus Projetos',
    skills: 'Habilidades',
    contact: 'Contato'
  };

  const openWindow = useCallback((windowType) => {
    // Verificar se a janela já está aberta
    const existingWindow = windows.find(w => w.type === windowType);
    if (existingWindow) {
      // Se já existe, trazer para frente
      bringToFront(existingWindow.id);
      return;
    }

    const WindowComponent = windowComponents[windowType];
    if (!WindowComponent) return;

    const newWindow = {
      id: Date.now().toString(),
      type: windowType,
      title: windowTitles[windowType],
      content: <WindowComponent />,
      initialPosition: { 
        x: Math.random() * 300 + 100, 
        y: Math.random() * 200 + 100 
      },
      initialSize: { 
        width: Math.min(600, window.innerWidth - 100), 
        height: Math.min(500, window.innerHeight - 100) 
      },
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
  }, [windows, nextZIndex]);

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

  // Renderizar layout mobile em telas pequenas
  if (isMobile) {
    return <MobileLayout />;
  }

  // Layout desktop
  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* Desktop */}
      <Desktop onOpenWindow={openWindow} />

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
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 backdrop-blur-sm text-white p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 bg-blue-600 rounded text-sm font-medium">
            Portfolio
          </div>
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
        
        <div className="text-xs opacity-70">
          {new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
