import { useState, useEffect } from 'react';

const useGitHub = (username) => {
  const [userData, setUserData] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;

    const fetchGitHubData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        const userResponse = await fetch(`https://api.github.com/users/${username}`);
        if (!userResponse.ok) {
          throw new Error('Usuário não encontrado');
        }
        const user = await userResponse.json();

        // Fetch repositories
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
        if (!reposResponse.ok) {
          throw new Error('Erro ao buscar repositórios');
        }
        const repos = await reposResponse.json();

        // Filter out forked repositories and sort by stars
        const filteredRepos = repos
          .filter(repo => !repo.fork)
          .sort((a, b) => b.stargazers_count - a.stargazers_count);

        setUserData(user);
        setRepositories(filteredRepos);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar dados do GitHub:', err);
        
        // Fallback para dados estáticos em caso de erro
        setUserData({
          name: 'Guilherme Kenji Fusuma',
          bio: 'Estudante & Desenvolvedor',
          location: 'São Paulo, SP - Brasil',
          public_repos: 15,
          followers: 26,
          following: 28,
          avatar_url: null,
          html_url: 'https://github.com/GuilhermeFusuma'
        });

        setRepositories([
          {
            id: 1,
            name: "Sistema-Solar",
            description: "Atividade Sistema Solar.",
            language: "CSS",
            html_url: "https://github.com/GuilhermeFusuma/Sistema-Solar",
            stargazers_count: 0,
            forks_count: 0,
            watchers_count: 0,
            topics: ["css", "sistema-solar", "atividade"],
            updated_at: "2024-01-15T10:00:00Z"
          },
          {
            id: 2,
            name: "Formas-css",
            description: "Carro Esportivo",
            language: "CSS",
            html_url: "https://github.com/GuilhermeFusuma/Formas-css",
            stargazers_count: 0,
            forks_count: 0,
            watchers_count: 0,
            topics: ["css", "formas", "carro"],
            updated_at: "2024-01-10T10:00:00Z"
          },
          {
            id: 3,
            name: "Blog_financas",
            description: "Atividade SENAI: criar um blog sobre finanças utilizando Bootstrap",
            language: "HTML",
            html_url: "https://github.com/GuilhermeFusuma/Blog_financas",
            stargazers_count: 0,
            forks_count: 0,
            watchers_count: 0,
            topics: ["html", "bootstrap", "blog", "financas"],
            updated_at: "2024-01-05T10:00:00Z"
          },
          {
            id: 4,
            name: "Tooth_-_Care",
            description: "Projeto do site de clínica odontológica Tooth & Care",
            language: "HTML",
            html_url: "https://github.com/GuilhermeFusuma/Tooth_-_Care",
            stargazers_count: 0,
            forks_count: 0,
            watchers_count: 0,
            topics: ["html", "clinica", "odontologia"],
            updated_at: "2024-01-01T10:00:00Z"
          },
          {
            id: 5,
            name: "Calculadora",
            description: "calculadora simples de soma e multiplicação",
            language: "JavaScript",
            html_url: "https://github.com/GuilhermeFusuma/Calculadora",
            stargazers_count: 0,
            forks_count: 0,
            watchers_count: 0,
            topics: ["javascript", "calculadora"],
            updated_at: "2023-12-20T10:00:00Z"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, [username]);

  return {
    userData,
    repositories,
    loading,
    error,
    refetch: () => {
      if (username) {
        setLoading(true);
        fetchGitHubData();
      }
    }
  };
};

export default useGitHub;

