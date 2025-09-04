-- Portfolio Digital Interativo com IA - Database Schema
-- Este arquivo contém o script SQL completo para criar o banco de dados

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de sessões (obrigatória para Replit Auth)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- Tabela de usuários (obrigatória para Replit Auth)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de projetos
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    image_url VARCHAR,
    video_url VARCHAR,
    demo_url VARCHAR,
    github_url VARCHAR,
    technologies TEXT[],
    category_id VARCHAR REFERENCES categories(id),
    owner_id VARCHAR REFERENCES users(id) NOT NULL,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de curtidas nos projetos
CREATE TABLE IF NOT EXISTS project_likes (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Tabela de comentários nos projetos
CREATE TABLE IF NOT EXISTS project_comments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'comment', 'like'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_project_id VARCHAR REFERENCES projects(id) ON DELETE CASCADE,
    related_user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Inserção de categorias padrão
INSERT INTO categories (name, slug, color) VALUES 
('Web Development', 'web-development', '#3B82F6'),
('Mobile Apps', 'mobile-apps', '#10B981'),
('Machine Learning', 'machine-learning', '#8B5CF6'),
('Design', 'design', '#F59E0B'),
('Backend', 'backend', '#EF4444'),
('Frontend', 'frontend', '#06B6D4'),
('DevOps', 'devops', '#84CC16'),
('Database', 'database', '#F97316')
ON CONFLICT (slug) DO NOTHING;

-- Inserção de usuário administrador padrão
INSERT INTO users (id, email, first_name, last_name, profile_image_url) VALUES 
('admin-user-id-123', 'admin@portfolio.dev', 'João', 'Silva', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face')
ON CONFLICT (email) DO NOTHING;

-- Inserção de projetos de demonstração
INSERT INTO projects (title, description, content, image_url, demo_url, github_url, technologies, category_id, owner_id, is_published, is_featured) 
SELECT 
    'E-commerce Platform com IA',
    'Plataforma completa de e-commerce com recomendações inteligentes usando machine learning e chatbot integrado.',
    'Este projeto implementa uma solução completa de e-commerce com recursos avançados de inteligência artificial. Utiliza algoritmos de machine learning para recomendações personalizadas de produtos e inclui um chatbot inteligente para atendimento ao cliente.',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
    'https://ecommerce-demo.example.com',
    'https://github.com/example/ecommerce-ai',
    ARRAY['React', 'Node.js', 'TensorFlow', 'PostgreSQL', 'Stripe'],
    (SELECT id FROM categories WHERE slug = 'web-development'),
    'admin-user-id-123',
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'E-commerce Platform com IA');

INSERT INTO projects (title, description, content, image_url, demo_url, github_url, technologies, category_id, owner_id, is_published, is_featured) 
SELECT 
    'App Mobile Fitness Tracker',
    'Aplicativo mobile para acompanhamento de exercícios com análise de dados em tempo real e gamificação.',
    'Desenvolvido em React Native, este aplicativo permite aos usuários monitorar seus exercícios, definir metas e acompanhar seu progresso. Inclui integração com sensores de saúde e sistema de conquistas para motivar os usuários.',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
    'https://fitness-app-demo.example.com',
    'https://github.com/example/fitness-tracker',
    ARRAY['React Native', 'Firebase', 'Chart.js', 'Health API'],
    (SELECT id FROM categories WHERE slug = 'mobile-apps'),
    'admin-user-id-123',
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'App Mobile Fitness Tracker');

INSERT INTO projects (title, description, content, image_url, demo_url, github_url, technologies, category_id, owner_id, is_published, is_featured) 
SELECT 
    'Sistema de Análise de Sentimentos',
    'Ferramenta de machine learning para análise de sentimentos em redes sociais com dashboard interativo.',
    'Utiliza processamento de linguagem natural para analisar sentimentos em posts de redes sociais. Oferece insights valiosos para marcas entenderem a percepção do público sobre seus produtos e serviços.',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
    'https://sentiment-analysis.example.com',
    'https://github.com/example/sentiment-analysis',
    ARRAY['Python', 'TensorFlow', 'NLTK', 'Django', 'D3.js'],
    (SELECT id FROM categories WHERE slug = 'machine-learning'),
    'admin-user-id-123',
    true,
    false
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Sistema de Análise de Sentimentos');

INSERT INTO projects (title, description, content, image_url, demo_url, github_url, technologies, category_id, owner_id, is_published, is_featured) 
SELECT 
    'Design System Minimalista',
    'Sistema de design completo com componentes reutilizáveis e documentação interativa.',
    'Criação de um design system moderno e minimalista com foco na usabilidade e acessibilidade. Inclui biblioteca de componentes, paleta de cores harmoniosa e guia de tipografia.',
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
    'https://design-system.example.com',
    'https://github.com/example/design-system',
    ARRAY['Figma', 'Storybook', 'CSS', 'JavaScript'],
    (SELECT id FROM categories WHERE slug = 'design'),
    'admin-user-id-123',
    true,
    false
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Design System Minimalista');

-- Inserção de algumas curtidas de demonstração
INSERT INTO project_likes (project_id, user_id) 
SELECT p.id, 'admin-user-id-123'
FROM projects p 
WHERE p.title IN ('E-commerce Platform com IA', 'App Mobile Fitness Tracker')
  AND NOT EXISTS (
    SELECT 1 FROM project_likes pl 
    WHERE pl.project_id = p.id AND pl.user_id = 'admin-user-id-123'
  );

-- Inserção de comentários de demonstração
INSERT INTO project_comments (project_id, user_id, content) 
SELECT p.id, 'admin-user-id-123', 'Projeto incrível! A integração com IA ficou muito bem implementada. Parabéns!'
FROM projects p 
WHERE p.title = 'E-commerce Platform com IA'
  AND NOT EXISTS (
    SELECT 1 FROM project_comments pc 
    WHERE pc.project_id = p.id AND pc.user_id = 'admin-user-id-123'
  );

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_is_published ON projects(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_project_likes_project_id ON project_likes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_likes_user_id ON project_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON project_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Comentários nas tabelas
COMMENT ON TABLE sessions IS 'Tabela de sessões obrigatória para autenticação Replit Auth';
COMMENT ON TABLE users IS 'Tabela de usuários obrigatória para autenticação Replit Auth';
COMMENT ON TABLE categories IS 'Categorias para organização dos projetos';
COMMENT ON TABLE projects IS 'Projetos do portfólio com informações detalhadas';
COMMENT ON TABLE project_likes IS 'Curtidas nos projetos pelos usuários';
COMMENT ON TABLE project_comments IS 'Comentários nos projetos';
COMMENT ON TABLE notifications IS 'Notificações para o proprietário do portfólio';