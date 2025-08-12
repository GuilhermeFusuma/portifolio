import React from 'react';
import { Github, ExternalLink, Star, GitFork, Eye, Calendar } from 'lucide-react';
import useGitHub from '../hooks/useGitHub';

const ProjectsWindow = () => {
  const { repositories, loading, error } = useGitHub('GuilhermeFusuma');

  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: 'bg-yellow-400',
      HTML: 'bg-orange-500',
      CSS: 'bg-blue-500',
      Python: 'bg-green-500',
      TypeScript: 'bg-blue-600',
      React: 'bg-cyan-500',
      Java: 'bg-red-500',
      'C++': 'bg-purple-500'
    };
    return colors[language] || 'bg-gray-400';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando projetos do GitHub...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Github size={48} />
          </div>
          <p className="text-gray-600 mb-4">Erro ao carregar dados do GitHub</p>
          <p className="text-sm text-gray-500">Exibindo dados estáticos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Meus Projetos</h2>
        <div className="flex items-center space-x-2 text-gray-600">
          <Github size={20} />
          <span className="text-sm">{repositories.length} repositórios</span>
        </div>
      </div>

      <div className="grid gap-4">
        {repositories.map((project) => (
          <div
            key={project.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {project.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {project.description || "Sem descrição disponível"}
                </p>
                
                {project.updated_at && (
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <Calendar size={12} className="mr-1" />
                    <span>Atualizado em {formatDate(project.updated_at)}</span>
                  </div>
                )}
              </div>
              <a
                href={project.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Ver no GitHub"
              >
                <ExternalLink size={18} />
              </a>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {project.language && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getLanguageColor(project.language)}`}></div>
                    <span className="text-sm text-gray-600">{project.language}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1" title="Stars">
                  <Star size={14} />
                  <span>{project.stargazers_count}</span>
                </div>
                <div className="flex items-center space-x-1" title="Forks">
                  <GitFork size={14} />
                  <span>{project.forks_count}</span>
                </div>
                <div className="flex items-center space-x-1" title="Watchers">
                  <Eye size={14} />
                  <span>{project.watchers_count}</span>
                </div>
              </div>
            </div>

            {project.topics && project.topics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {project.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <a
          href="https://github.com/GuilhermeFusuma"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Github size={20} />
          <span>Ver todos no GitHub</span>
        </a>
      </div>
    </div>
  );
};

export default ProjectsWindow;

