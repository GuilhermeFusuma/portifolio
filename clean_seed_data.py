from datetime import datetime, date
from app import app, db
from models import User, Category, Project, Achievement, Tag

def clean_and_seed():
    """Clean database and seed with only authentic Guilherme's information"""
    with app.app_context():
        # Drop all existing data
        db.drop_all()
        db.create_all()
        
        # Create admin user - Guilherme Kenji Fusuma
        admin = User(
            username='GuilhermeFusuma',
            email='guilherme@portfolio.com',
            first_name='Guilherme Kenji',
            last_name='Fusuma',
            is_admin=True,
            bio='''Atualmente, estou cursando o curso técnico em Análise e Desenvolvimento de Sistemas no SENAI Morvan Figueiredo, onde tenho desenvolvido múltiplos projetos que ampliaram meu conhecimento em desenvolvimento web, bancos de dados e outras áreas da tecnologia.

Além dos estudos no curso técnico, fui selecionado para representar minha escola em competições que levam ao WorldSkills, especificamente na área de Computação em Nuvem. Como parte desse desafio, estou aprofundando meus conhecimentos em Cloud Computing com a AWS, desenvolvendo habilidades essenciais para arquitetura e gerenciamento de serviços em nuvem.

Desde que comecei na área da tecnologia, percebi o quanto sou apaixonado por esse universo. Estou sempre em busca de novos desafios e aprendizados que aprimoram minhas competências e complementam minhas habilidades, impulsionando meu crescimento profissional.'''
        )
        admin.set_password('admin123')
        db.session.add(admin)
        
        # Create basic categories
        categories_data = [
            {'name': 'Desenvolvimento Web', 'description': 'Projetos de desenvolvimento web', 'color': '#6366f1'},
            {'name': 'Cloud Computing', 'description': 'Projetos e estudos em nuvem', 'color': '#06b6d4'},
            {'name': 'Formação', 'description': 'Conquistas acadêmicas', 'color': '#10b981'},
            {'name': 'Competições', 'description': 'Participações em competições', 'color': '#f59e0b'}
        ]
        
        for cat_data in categories_data:
            category = Category(**cat_data)
            db.session.add(category)
        
        db.session.commit()
        
        # Get categories
        web_cat = Category.query.filter_by(name='Desenvolvimento Web').first()
        cloud_cat = Category.query.filter_by(name='Cloud Computing').first()
        edu_cat = Category.query.filter_by(name='Formação').first()
        comp_cat = Category.query.filter_by(name='Competições').first()
        
        # Create authentic tags based on your GitHub profile
        tags_data = ['HTML5', 'CSS3', 'JavaScript', 'Node.js', 'AWS', 'Bootstrap', 'Git', 'GitHub', 'Figma', 'Cloud Computing']
        for tag_name in tags_data:
            tag = Tag(name=tag_name.lower())
            db.session.add(tag)
        
        db.session.commit()
        
        # Only authentic achievements
        achievements_data = [
            {
                'title': 'Selecionado para Competição WorldSkills - Computação em Nuvem',
                'description': 'Representante da escola SENAI na área de Computação em Nuvem para competição WorldSkills',
                'content': '''<h3>Conquista Acadêmica</h3>
                <p>Fui selecionado para representar o SENAI Morvan Figueiredo na competição WorldSkills, especificamente na área de Computação em Nuvem.</p>
                
                <h4>Responsabilidades:</h4>
                <ul>
                    <li>Aprofundar conhecimentos em AWS Cloud Computing</li>
                    <li>Desenvolver habilidades em arquitetura de nuvem</li>
                    <li>Praticar gerenciamento de serviços em nuvem</li>
                    <li>Representar minha escola em competição nacional</li>
                </ul>''',
                'organization': 'SENAI Morvan Figueiredo',
                'date_achieved': date(2024, 3, 1),
                'category_id': comp_cat.id,
                'is_published': True,
                'featured': True
            },
            {
                'title': 'Curso Técnico em Análise e Desenvolvimento de Sistemas - SENAI',
                'description': 'Formação técnica em desenvolvimento de sistemas no SENAI Morvan Figueiredo',
                'content': '''<h3>Formação Atual</h3>
                <p>Cursando o curso técnico em Análise e Desenvolvimento de Sistemas no SENAI Morvan Figueiredo.</p>
                
                <h4>Áreas de Estudo:</h4>
                <ul>
                    <li>Desenvolvimento web frontend e backend</li>
                    <li>Banco de dados e modelagem</li>
                    <li>Análise e projeto de sistemas</li>
                    <li>Programação orientada a objetos</li>
                </ul>''',
                'organization': 'SENAI Morvan Figueiredo',
                'date_achieved': date(2024, 2, 1),
                'category_id': edu_cat.id,
                'is_published': True,
                'featured': True
            }
        ]
        
        for ach_data in achievements_data:
            achievement = Achievement(**ach_data)
            db.session.add(achievement)
        
        # No fake projects - user can add their real ones through the admin panel
        
        db.session.commit()
        print("Database cleaned and seeded with authentic information only!")

if __name__ == "__main__":
    clean_and_seed()