from datetime import datetime, date
from app import app, db
from models import User, Category, Project, Achievement, Tag

def seed_database():
    """Seed the database with initial data"""
    with app.app_context():
        # Create admin user - Guilherme Kenji Fusuma
        admin_email = app.config.get('ADMIN_EMAIL', 'guilherme@portfolio.com')
        admin = User.query.filter_by(email=admin_email).first()
        if not admin:
            admin = User(
                username='GuilhermeFusuma',
                email=admin_email,
                first_name='Guilherme Kenji',
                last_name='Fusuma',
                is_admin=True,
                bio='''Atualmente, estou cursando o curso técnico em Análise e Desenvolvimento de Sistemas no SENAI Morvan Figueiredo, onde tenho desenvolvido múltiplos projetos que ampliaram meu conhecimento em desenvolvimento web, bancos de dados e outras áreas da tecnologia.

Além dos estudos no curso técnico, fui selecionado para representar minha escola em competições que levam ao WorldSkills, especificamente na área de Computação em Nuvem. Como parte desse desafio, estou aprofundando meus conhecimentos em Cloud Computing com a AWS, desenvolvendo habilidades essenciais para arquitetura e gerenciamento de serviços em nuvem.

Desde que comecei na área da tecnologia, percebi o quanto sou apaixonado por esse universo. Estou sempre em busca de novos desafios e aprendizados que aprimoram minhas competências e complementam minhas habilidades, impulsionando meu crescimento profissional.'''
            )
            admin.set_password('admin123')
            db.session.add(admin)
        
        # Create categories
        categories_data = [
            {'name': 'Web Development', 'description': 'Frontend and backend web applications', 'color': '#6366f1'},
            {'name': 'Mobile Apps', 'description': 'iOS and Android applications', 'color': '#8b5cf6'},
            {'name': 'Design', 'description': 'UI/UX and graphic design projects', 'color': '#3b82f6'},
            {'name': 'Data Science', 'description': 'Analytics and machine learning projects', 'color': '#06b6d4'},
            {'name': 'Certifications', 'description': 'Professional certifications and courses', 'color': '#10b981'},
            {'name': 'Awards', 'description': 'Recognition and achievements', 'color': '#f59e0b'}
        ]
        
        for cat_data in categories_data:
            category = Category.query.filter_by(name=cat_data['name']).first()
            if not category:
                category = Category(**cat_data)
                db.session.add(category)
        
        db.session.commit()
        
        # Get categories for reference
        web_cat = Category.query.filter_by(name='Web Development').first()
        design_cat = Category.query.filter_by(name='Design').first()
        cert_cat = Category.query.filter_by(name='Certifications').first()
        awards_cat = Category.query.filter_by(name='Awards').first()
        
        # Create tags - Based on Guilherme's GitHub profile
        tags_data = ['HTML5', 'CSS3', 'JavaScript', 'Node.js', 'Python', 'AWS', 'Bootstrap', 'Git', 'GitHub', 'Figma', 'Bash', 'Google Cloud', 'Canva', 'Cloud Computing', 'Web Development']
        for tag_name in tags_data:
            tag = Tag.query.filter_by(name=tag_name.lower()).first()
            if not tag:
                tag = Tag(name=tag_name.lower())
                db.session.add(tag)
        
        db.session.commit()
        
        # Create sample projects - Tailored for Guilherme's profile
        cloud_cat = Category.query.filter_by(name='Data Science').first()  # Using this for cloud projects
        projects_data = [
            {
                'title': 'Sistema de Gerenciamento Web - SENAI',
                'description': 'Aplicação web desenvolvida durante o curso técnico em Análise e Desenvolvimento de Sistemas',
                'content': '''<h3>Visão Geral do Projeto</h3>
                <p>Sistema web desenvolvido como parte dos projetos acadêmicos no SENAI Morvan Figueiredo. O projeto demonstra conhecimentos em desenvolvimento full-stack utilizando tecnologias modernas.</p>
                
                <h4>Principais Funcionalidades:</h4>
                <ul>
                    <li>Sistema de autenticação e autorização de usuários</li>
                    <li>Interface responsiva para dispositivos móveis</li>
                    <li>Gerenciamento de dados com banco de dados</li>
                    <li>Dashboard administrativo</li>
                    <li>Design moderno com Bootstrap</li>
                </ul>
                
                <h4>Tecnologias Utilizadas:</h4>
                <p>Frontend: HTML5, CSS3, JavaScript, Bootstrap<br>
                Backend: Node.js<br>
                Banco de Dados: MySQL<br>
                Ferramentas: Git, GitHub, VS Code</p>
                
                <h4>Aprendizados:</h4>
                <p>Este projeto me permitiu desenvolver habilidades práticas em desenvolvimento web e compreender melhor os conceitos de arquitetura de aplicações web.</p>''',
                'category_id': web_cat.id if web_cat else None,
                'github_url': 'https://github.com/GuilhermeFusuma',
                'is_published': True,
                'featured': True,
                'tags': ['html5', 'css3', 'javascript', 'node.js', 'bootstrap']
            },
            {
                'title': 'Projeto AWS - Preparação WorldSkills',
                'description': 'Estudos e projetos práticos em Cloud Computing com AWS para competição WorldSkills',
                'content': '''<h3>Preparação para WorldSkills</h3>
                <p>Como representante da minha escola na área de Computação em Nuvem, tenho desenvolvido projetos práticos com AWS para aprimorar minhas habilidades em cloud computing.</p>
                
                <h4>Áreas de Estudo:</h4>
                <ul>
                    <li>Arquitetura de serviços em nuvem AWS</li>
                    <li>Gerenciamento de instâncias EC2</li>
                    <li>Configuração de redes e segurança</li>
                    <li>Deploy de aplicações web na nuvem</li>
                    <li>Monitoramento e logging</li>
                </ul>
                
                <h4>Tecnologias AWS:</h4>
                <p>EC2, S3, RDS, VPC, CloudWatch<br>
                Ferramentas: AWS CLI, Console AWS<br>
                Linguagens: Bash, Python</p>
                
                <h4>Objetivo:</h4>
                <p>Desenvolver competências essenciais para arquitetura e gerenciamento de serviços em nuvem, preparando-me para a competição WorldSkills e para o mercado de trabalho.</p>''',
                'category_id': cloud_cat.id if cloud_cat else None,
                'is_published': True,
                'featured': True,
                'tags': ['aws', 'cloud computing', 'python', 'bash']
            },
            {
                'title': 'Interface Responsiva com Bootstrap',
                'description': 'Desenvolvimento de interfaces modernas e responsivas utilizando Bootstrap e design principles',
                'content': '''<h3>Filosofia de Design</h3>
                <p>Projeto focado em criar interfaces limpas e modernas utilizando Bootstrap e boas práticas de UX/UI design.</p>
                
                <h4>Princípios Aplicados:</h4>
                <ul>
                    <li>Design mobile-first e responsivo</li>
                    <li>Paleta de cores consistente</li>
                    <li>Tipografia legível e hierárquica</li>
                    <li>Componentes reutilizáveis</li>
                    <li>Acessibilidade e usabilidade</li>
                </ul>
                
                <h4>Ferramentas Utilizadas:</h4>
                <p>Bootstrap 5, CSS3, Figma para prototipagem<br>
                Canva para elementos gráficos<br>
                Git para versionamento</p>
                
                <h4>Resultados:</h4>
                <p>Interface moderna e funcional que demonstra conhecimento em design responsivo e experiência do usuário.</p>''',
                'category_id': design_cat.id if design_cat else None,
                'is_published': True,
                'featured': False,
                'tags': ['bootstrap', 'css3', 'figma', 'canva']
            }
        ]
        
        for proj_data in projects_data:
            project = Project.query.filter_by(title=proj_data['title']).first()
            if not project:
                tag_names = proj_data.pop('tags', [])
                project = Project(**proj_data)
                
                # Add tags
                for tag_name in tag_names:
                    tag = Tag.query.filter_by(name=tag_name).first()
                    if tag:
                        project.tags.append(tag)
                
                db.session.add(project)
        
        # Create sample achievements - Tailored for Guilherme's academic journey
        achievements_data = [
            {
                'title': 'Selecionado para Competição WorldSkills',
                'description': 'Representante da escola SENAI na área de Computação em Nuvem para competição WorldSkills',
                'content': '''<h3>Conquista Acadêmica</h3>
                <p>Fui selecionado para representar o SENAI Morvan Figueiredo na competição WorldSkills, especificamente na área de Computação em Nuvem. Esta é uma oportunidade única de demonstrar minhas habilidades técnicas em cloud computing.</p>
                
                <h4>Responsabilidades:</h4>
                <ul>
                    <li>Aprofundar conhecimentos em AWS Cloud Computing</li>
                    <li>Desenvolver habilidades em arquitetura de nuvem</li>
                    <li>Praticar gerenciamento de serviços em nuvem</li>
                    <li>Representar minha escola em competição nacional</li>
                </ul>
                
                <h4>Preparação:</h4>
                <p>Dedicando tempo intensivo aos estudos de AWS, incluindo laboratórios práticos e projetos de arquitetura em nuvem. Esta experiência está impulsionando significativamente meu crescimento profissional na área de tecnologia.</p>''',
                'organization': 'SENAI Morvan Figueiredo',
                'date_achieved': date(2024, 3, 1),
                'category_id': awards_cat.id if awards_cat else None,
                'is_published': True,
                'featured': True,
                'tags': ['aws', 'cloud computing', 'worldskills']
            },
            {
                'title': 'Curso Técnico em Análise e Desenvolvimento de Sistemas',
                'description': 'Formação técnica em desenvolvimento de sistemas no SENAI',
                'content': '''<h3>Formação Técnica</h3>
                <p>Atualmente cursando o curso técnico em Análise e Desenvolvimento de Sistemas no SENAI Morvan Figueiredo, onde tenho desenvolvido múltiplos projetos que ampliam meu conhecimento em tecnologia.</p>
                
                <h4>Áreas de Estudo:</h4>
                <ul>
                    <li>Desenvolvimento web frontend e backend</li>
                    <li>Banco de dados e modelagem</li>
                    <li>Análise e projeto de sistemas</li>
                    <li>Programação orientada a objetos</li>
                    <li>Metodologias de desenvolvimento</li>
                </ul>
                
                <h4>Projetos Desenvolvidos:</h4>
                <p>Durante o curso, desenvolvi diversos projetos práticos que consolidaram meu aprendizado e me prepararam para os desafios do mercado de tecnologia.</p>''',
                'organization': 'SENAI Morvan Figueiredo',
                'date_achieved': date(2024, 2, 1),
                'category_id': cert_cat.id if cert_cat else None,
                'is_published': True,
                'featured': True,
                'tags': ['web development', 'javascript', 'html5', 'css3']
            },
            {
                'title': 'Projetos GitHub Publicados',
                'description': 'Portfolio de projetos desenvolvidos e compartilhados na plataforma GitHub',
                'content': '''<h3>Portfolio no GitHub</h3>
                <p>Mantenho um perfil ativo no GitHub (@GuilhermeFusuma) onde compartilho meus projetos e contribuições para a comunidade de desenvolvedores.</p>
                
                <h4>Destaques do Perfil:</h4>
                <ul>
                    <li>27 seguidores e 28 seguindo na plataforma</li>
                    <li>Projetos em HTML5, CSS3, JavaScript e Node.js</li>
                    <li>Uso regular de Git para versionamento</li>
                    <li>Contribuições regulares e commits ativos</li>
                </ul>
                
                <h4>Tecnologias Demonstradas:</h4>
                <p>Meus repositórios demonstram conhecimento em tecnologias web modernas, design responsivo, e boas práticas de desenvolvimento de software.</p>''',
                'organization': 'GitHub',
                'date_achieved': date(2024, 1, 1),
                'category_id': cert_cat.id if cert_cat else None,
                'certificate_url': 'https://github.com/GuilhermeFusuma',
                'is_published': True,
                'featured': False,
                'tags': ['github', 'git', 'web development']
            }
        ]
        
        for ach_data in achievements_data:
            achievement = Achievement.query.filter_by(title=ach_data['title']).first()
            if not achievement:
                tag_names = ach_data.pop('tags', [])
                achievement = Achievement(**ach_data)
                
                # Add tags
                for tag_name in tag_names:
                    tag = Tag.query.filter_by(name=tag_name).first()
                    if tag:
                        achievement.tags.append(tag)
                
                db.session.add(achievement)
        
        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()
