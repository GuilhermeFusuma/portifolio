from datetime import datetime, date
from app import app, db
from models import User, Category, Project, Achievement, Tag

def seed_database():
    """Seed the database with initial data"""
    with app.app_context():
        # Create admin user
        admin_email = app.config.get('ADMIN_EMAIL', 'admin@portfolio.com')
        admin = User.query.filter_by(email=admin_email).first()
        if not admin:
            admin = User(
                username='admin',
                email=admin_email,
                first_name='Portfolio',
                last_name='Admin',
                is_admin=True,
                bio='Creative professional passionate about technology and design.'
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
        
        # Create tags
        tags_data = ['React', 'Python', 'JavaScript', 'Flask', 'Bootstrap', 'CSS', 'HTML', 'UI/UX', 'Mobile', 'API']
        for tag_name in tags_data:
            tag = Tag.query.filter_by(name=tag_name.lower()).first()
            if not tag:
                tag = Tag(name=tag_name.lower())
                db.session.add(tag)
        
        db.session.commit()
        
        # Create sample projects
        projects_data = [
            {
                'title': 'E-Commerce Platform',
                'description': 'A full-stack e-commerce platform built with modern technologies',
                'content': '''<h3>Project Overview</h3>
                <p>This comprehensive e-commerce platform demonstrates proficiency in full-stack development, incorporating modern design principles and robust functionality.</p>
                
                <h4>Key Features:</h4>
                <ul>
                    <li>User authentication and authorization</li>
                    <li>Product catalog with search and filtering</li>
                    <li>Shopping cart and checkout process</li>
                    <li>Payment integration</li>
                    <li>Admin dashboard for inventory management</li>
                    <li>Responsive design for all devices</li>
                </ul>
                
                <h4>Technologies Used:</h4>
                <p>Frontend: React, Redux, Bootstrap<br>
                Backend: Python Flask, SQLAlchemy<br>
                Database: PostgreSQL<br>
                Payment: Stripe API</p>
                
                <h4>Challenges Overcome:</h4>
                <p>The main challenge was implementing a secure payment system while maintaining a smooth user experience. This was solved by integrating Stripe's secure payment processing with comprehensive error handling.</p>''',
                'category_id': web_cat.id if web_cat else None,
                'demo_url': 'https://demo-ecommerce.example.com',
                'github_url': 'https://github.com/username/ecommerce-platform',
                'is_published': True,
                'featured': True,
                'tags': ['react', 'python', 'flask', 'javascript']
            },
            {
                'title': 'Portfolio Website Redesign',
                'description': 'Modern, responsive portfolio website with interactive elements',
                'content': '''<h3>Design Philosophy</h3>
                <p>This portfolio redesign focused on creating a clean, modern interface that showcases work effectively while providing an engaging user experience.</p>
                
                <h4>Design Principles:</h4>
                <ul>
                    <li>Minimalist aesthetic with purposeful whitespace</li>
                    <li>Consistent color palette and typography</li>
                    <li>Smooth animations and micro-interactions</li>
                    <li>Mobile-first responsive design</li>
                    <li>Accessibility compliance (WCAG 2.1)</li>
                </ul>
                
                <h4>Technical Implementation:</h4>
                <p>Built using modern web standards with a focus on performance and SEO optimization. The site achieves a 95+ Lighthouse score across all metrics.</p>
                
                <h4>Results:</h4>
                <p>The redesign resulted in a 40% increase in user engagement and significantly improved mobile experience.</p>''',
                'category_id': design_cat.id if design_cat else None,
                'demo_url': 'https://portfolio-redesign.example.com',
                'is_published': True,
                'featured': True,
                'tags': ['ui/ux', 'css', 'html', 'bootstrap']
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
        
        # Create sample achievements
        achievements_data = [
            {
                'title': 'AWS Certified Solutions Architect',
                'description': 'Professional certification demonstrating expertise in AWS cloud architecture',
                'content': '''<h3>Certification Details</h3>
                <p>The AWS Certified Solutions Architect – Professional certification validates advanced technical skills and experience in designing distributed applications and systems on the AWS platform.</p>
                
                <h4>Skills Demonstrated:</h4>
                <ul>
                    <li>Design and deploy dynamically scalable, highly available, fault-tolerant, and reliable applications on AWS</li>
                    <li>Select appropriate AWS services to design and deploy an application based on given requirements</li>
                    <li>Migrate complex, multi-tier applications on AWS</li>
                    <li>Design and deploy enterprise-wide scalable operations on AWS</li>
                </ul>
                
                <h4>Preparation Journey:</h4>
                <p>Dedicated 6 months to preparation including hands-on labs, practice exams, and real-world project implementation. This certification validates my expertise in cloud architecture and AWS services.</p>''',
                'organization': 'Amazon Web Services',
                'date_achieved': date(2024, 6, 15),
                'category_id': cert_cat.id if cert_cat else None,
                'certificate_url': 'https://aws.amazon.com/certification/certified-solutions-architect-professional/',
                'is_published': True,
                'featured': True,
                'tags': ['aws', 'cloud', 'architecture']
            },
            {
                'title': 'Best Innovation Award 2024',
                'description': 'Recognition for innovative approach to user experience design',
                'content': '''<h3>Award Recognition</h3>
                <p>Received the Best Innovation Award at the Annual Design Conference 2024 for the revolutionary user interface design of the FinTech mobile application.</p>
                
                <h4>Innovation Highlights:</h4>
                <ul>
                    <li>Introduced gesture-based navigation reducing user interaction time by 35%</li>
                    <li>Implemented AI-powered personalization features</li>
                    <li>Created an inclusive design supporting accessibility standards</li>
                    <li>Achieved 98% user satisfaction rating in beta testing</li>
                </ul>
                
                <h4>Impact:</h4>
                <p>The design principles developed for this project have been adopted as company standards and have influenced the broader design community through conference presentations and published articles.</p>''',
                'organization': 'Design Conference 2024',
                'date_achieved': date(2024, 8, 10),
                'category_id': awards_cat.id if awards_cat else None,
                'is_published': True,
                'featured': True,
                'tags': ['ui/ux', 'innovation', 'mobile']
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
