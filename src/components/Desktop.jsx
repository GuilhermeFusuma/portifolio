import React from 'react';
import { User, FolderOpen, Code, Mail, BarChart3 } from 'lucide-react';

const Desktop = ({ onOpenWindow }) => {
  const desktopIcons = [
    {
      id: 'about',
      title: 'Sobre Mim',
      icon: <User size={32} className="text-blue-600" />,
      position: { x: 50, y: 50 }
    },
    {
      id: 'projects',
      title: 'Projetos',
      icon: <FolderOpen size={32} className="text-green-600" />,
      position: { x: 50, y: 150 }
    },
    {
      id: 'skills',
      title: 'Habilidades',
      icon: <Code size={32} className="text-purple-600" />,
      position: { x: 50, y: 250 }
    },
    {
      id: 'contact',
      title: 'Contato',
      icon: <Mail size={32} className="text-red-600" />,
      position: { x: 50, y: 350 }
    }
  ];

  const handleIconDoubleClick = (iconId) => {
    onOpenWindow(iconId);
  };

  return (
    <div className="relative w-full h-full">
      {/* Background com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        {/* Padrão de pontos para dar textura */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      {/* Ícones do desktop */}
      {desktopIcons.map((icon) => (
        <div
          key={icon.id}
          className="absolute cursor-pointer select-none group"
          style={{ left: icon.position.x, top: icon.position.y }}
          onDoubleClick={() => handleIconDoubleClick(icon.id)}
        >
          <div className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-200 group-hover:scale-105">
            <div className="p-3 bg-white bg-opacity-90 rounded-lg shadow-lg group-hover:shadow-xl transition-shadow">
              {icon.icon}
            </div>
            <span className="text-white text-sm font-medium text-center drop-shadow-lg">
              {icon.title}
            </span>
          </div>
        </div>
      ))}

      {/* Informações do sistema no canto */}
      <div className="absolute top-4 right-4 text-white text-right">
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-3">
          <div className="text-sm font-medium">Guilherme Kenji Fusuma</div>
          <div className="text-xs opacity-80">Portfólio Interativo</div>
          <div className="text-xs opacity-60 mt-1">
            {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Instruções de uso */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <div className="bg-black bg-opacity-50 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm">
          <span className="opacity-80">Clique duas vezes nos ícones para abrir as janelas</span>
        </div>
      </div>
    </div>
  );
};

export default Desktop;

