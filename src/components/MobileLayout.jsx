import React, { useState } from 'react';
import { User, FolderOpen, Code, Mail, Menu, X } from 'lucide-react';
import AboutWindow from './AboutWindow';
import ProjectsWindow from './ProjectsWindow';
import SkillsWindow from './SkillsWindow';
import ContactWindow from './ContactWindow';

const MobileLayout = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: 'about', title: 'Sobre', icon: User, component: AboutWindow },
    { id: 'projects', title: 'Projetos', icon: FolderOpen, component: ProjectsWindow },
    { id: 'skills', title: 'Skills', icon: Code, component: SkillsWindow },
    { id: 'contact', title: 'Contato', icon: Mail, component: ContactWindow }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AboutWindow;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      {/* Header */}
      <div className="bg-white bg-opacity-95 backdrop-blur-sm shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Guilherme K. Fusuma</h1>
            <p className="text-sm text-gray-600">Portfólio Interativo</p>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-4 h-full overflow-auto">
          <ActiveComponent />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white bg-opacity-95 backdrop-blur-sm border-t border-gray-200">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-500 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{tab.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;

