import React from 'react';
import { Github, Linkedin, Mail, MapPin, Calendar, Target, Gamepad2, Users, GitFork } from 'lucide-react';
import useGitHub from '../hooks/useGitHub';

const AboutWindow = () => {
  const { userData, loading } = useGitHub('GuilhermeFusuma');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações do GitHub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com foto e nome */}
      <div className="text-center">
        {userData?.avatar_url ? (
          <img 
            src={userData.avatar_url} 
            alt="Guilherme Kenji Fusuma"
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500"
          />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
            GF
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-800">
          {userData?.name || 'Guilherme Kenji Fusuma'}
        </h1>
        <p className="text-gray-600">
          {userData?.bio || 'Estudante & Desenvolvedor'}
        </p>
      </div>

      {/* Informações básicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <MapPin className="text-blue-500" size={20} />
          <div>
            <p className="font-semibold text-gray-800">Localização</p>
            <p className="text-gray-600">
              {userData?.location || 'São Paulo, SP - Brasil'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="text-green-500" size={20} />
          <div>
            <p className="font-semibold text-gray-800">Estudando desde</p>
            <p className="text-gray-600">2024</p>
          </div>
        </div>
      </div>

      {/* Estatísticas do GitHub */}
      {userData && (
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{userData.public_repos}</div>
            <div className="text-sm text-gray-600">Repositórios</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{userData.followers}</div>
            <div className="text-sm text-gray-600">Seguidores</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">{userData.following}</div>
            <div className="text-sm text-gray-600">Seguindo</div>
          </div>
        </div>
      )}

      {/* Sobre mim */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Sobre mim</h2>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Target className="text-purple-500 mt-1" size={20} />
            <div>
              <p className="font-semibold text-gray-800">Objetivos</p>
              <p className="text-gray-600">Continuar aprendendo tudo que posso</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Gamepad2 className="text-red-500 mt-1" size={20} />
            <div>
              <p className="font-semibold text-gray-800">Hobbies</p>
              <p className="text-gray-600">Jogar games, assistir anime e jogar vôlei</p>
            </div>
          </div>
        </div>
      </div>

      {/* Atualmente aprendendo */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">Atualmente aprendendo</h2>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            Python
          </span>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
            AWS
          </span>
        </div>
      </div>

      {/* Links de contato */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">Contato</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={userData?.html_url || "https://github.com/GuilhermeFusuma"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Github size={18} />
            <span>GitHub</span>
          </a>
          
          <a
            href="#"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            <Linkedin size={18} />
            <span>LinkedIn</span>
          </a>
          
          <a
            href="#"
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
          >
            <Mail size={18} />
            <span>Email</span>
          </a>
        </div>
      </div>

      {/* Quote motivacional */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-blue-500">
        <p className="text-gray-700 italic">
          "✨ Creating bugs since 2024"
        </p>
      </div>
    </div>
  );
};

export default AboutWindow;

