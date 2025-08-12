import React from 'react';
import { Code, Palette, Cloud, Database, Globe, Wrench } from 'lucide-react';

const SkillsWindow = () => {
  const skillCategories = [
    {
      title: "Frontend",
      icon: <Globe className="text-blue-500" size={24} />,
      skills: [
        { name: "HTML5", level: 85, color: "bg-orange-500" },
        { name: "CSS3", level: 80, color: "bg-blue-500" },
        { name: "JavaScript", level: 75, color: "bg-yellow-500" },
        { name: "Bootstrap", level: 70, color: "bg-purple-500" }
      ]
    },
    {
      title: "Backend & Cloud",
      icon: <Cloud className="text-green-500" size={24} />,
      skills: [
        { name: "Python", level: 60, color: "bg-green-500" },
        { name: "AWS", level: 40, color: "bg-orange-600" },
        { name: "Node.js", level: 50, color: "bg-green-600" }
      ]
    },
    {
      title: "Design & Tools",
      icon: <Palette className="text-pink-500" size={24} />,
      skills: [
        { name: "Figma", level: 65, color: "bg-purple-500" },
        { name: "Canva", level: 80, color: "bg-cyan-500" },
        { name: "Inkscape", level: 55, color: "bg-gray-600" }
      ]
    },
    {
      title: "Ferramentas",
      icon: <Wrench className="text-gray-600" size={24} />,
      skills: [
        { name: "Git", level: 70, color: "bg-red-500" },
        { name: "GitHub", level: 75, color: "bg-gray-800" },
        { name: "Bash", level: 60, color: "bg-green-700" },
        { name: "Trello", level: 85, color: "bg-blue-600" }
      ]
    }
  ];

  const SkillBar = ({ skill }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{skill.name}</span>
        <span className="text-sm text-gray-500">{skill.level}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${skill.color} transition-all duration-1000 ease-out`}
          style={{ width: `${skill.level}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Minhas Habilidades</h2>
        <p className="text-gray-600">Tecnologias e ferramentas que utilizo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillCategories.map((category, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              {category.icon}
              <h3 className="text-lg font-semibold text-gray-800">{category.title}</h3>
            </div>
            
            <div className="space-y-3">
              {category.skills.map((skill, skillIndex) => (
                <SkillBar key={skillIndex} skill={skill} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Seção de aprendizado atual */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <Code className="text-blue-500 mr-2" size={20} />
          Atualmente Aprendendo
        </h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Python</span>
          </div>
          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">AWS</span>
          </div>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">15+</div>
          <div className="text-sm text-gray-600">Tecnologias</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-green-600">5+</div>
          <div className="text-sm text-gray-600">Projetos</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">2024</div>
          <div className="text-sm text-gray-600">Início</div>
        </div>
      </div>
    </div>
  );
};

export default SkillsWindow;

