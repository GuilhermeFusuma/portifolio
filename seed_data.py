import os
import json
from datetime import datetime, date
from app import app, db
from models import User, Project, Achievement, Category, Tag, Comment, Like

def seed_database():
    """Seed the database with initial data"""
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        print("Seeding database...")
        
        # Create admin user
        admin = User()
        admin.username = 'admin'
        admin.email = app.config.get('ADMIN_EMAIL', 'admin@example.com')
        admin.first_name = 'Portfolio'
        admin.last_name = 'Admin'
        admin.bio = 'Full-stack developer passionate about creating amazing web experiences.'
        admin.is_admin = True
        admin.set_password('admin123')
        db.session.add(admin)
        
        # Create sample users
        user1 = User()
        user1.username = 'johndoe'
        user1.email = 'john@example.com'
        user1.first_name = 'John'
        user1.last_name = 'Doe'
        user1.bio = 'Frontend developer and UI/UX enthusiast.'
        user1.set_password('password123')
        db.session.add(user1)
        
        user2 = User()
        user2.username = 'janesmith'
        user2.email = 'jane@example.com'
        user2.first_name = 'Jane'
        user2.last_name = 'Smith'
        user2.bio = 'Backend developer specializing in Python and databases.'
        user2.set_password('password123')
        db.session.add(user2)
        
        db.session.commit()
        
        # Create categories
        web_dev = Category()
        web_dev.name = 'Web Development'
        web_dev.slug = 'web-development'
        web_dev.description = 'Frontend and backend web development projects'
        web_dev.color = '#3b82f6'
        
        mobile_dev = Category()
        mobile_dev.name = 'Mobile Development'
        mobile_dev.slug = 'mobile-development'
        mobile_dev.description = 'iOS and Android mobile applications'
        mobile_dev.color = '#10b981'
        
        data_science = Category(
            name='Data Science',
            slug='data-science',
            description='Machine learning and data analysis projects',
            color='#8b5cf6'
        )
        
        design = Category(
            name='Design',
            slug='design',
            description='UI/UX design and graphics',
            color='#f59e0b'
        )
        
        certifications = Category(
            name='Certifications',
            slug='certifications',
            description='Professional certifications and courses',
            color='#ef4444'
        )
        
        db.session.add_all([web_dev, mobile_dev, data_science, design, certifications])
        db.session.commit()
        
        # Create tags
        tags_data = [
            'Python', 'JavaScript', 'React', 'Flask', 'Django', 'Node.js',
            'HTML', 'CSS', 'Bootstrap', 'Tailwind', 'Vue.js', 'Angular',
            'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Docker', 'AWS',
            'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
            'UI/UX', 'Figma', 'Photoshop', 'Illustrator', 'Adobe XD'
        ]
        
        tags = []
        for tag_name in tags_data:
            tag = Tag(
                name=tag_name,
                slug=tag_name.lower().replace('.', '').replace('/', '-').replace(' ', '-')
            )
            tags.append(tag)
            db.session.add(tag)
        
        db.session.commit()
        
        # Create sample projects
        project1 = Project(
            title='E-Commerce Platform',
            slug='ecommerce-platform',
            description='A full-stack e-commerce platform built with React and Flask, featuring user authentication, product catalog, shopping cart, and payment integration.',
            content='''
            <h3>Project Overview</h3>
            <p>This e-commerce platform demonstrates modern web development practices with a React frontend and Flask backend. The application includes comprehensive features for both customers and administrators.</p>
            
            <h3>Key Features</h3>
            <ul>
                <li>User registration and authentication</li>
                <li>Product catalog with search and filtering</li>
                <li>Shopping cart and checkout process</li>
                <li>Payment integration with Stripe</li>
                <li>Admin dashboard for product management</li>
                <li>Order tracking and history</li>
                <li>Responsive design for all devices</li>
            </ul>
            
            <h3>Technical Implementation</h3>
            <p>The frontend is built with React and styled using Tailwind CSS for a modern, responsive design. The backend uses Flask with SQLAlchemy for database operations and includes RESTful API endpoints for all functionality.</p>
            
            <h3>Challenges Solved</h3>
            <p>One of the main challenges was implementing real-time inventory updates and ensuring data consistency during concurrent transactions. This was solved using database locks and optimistic concurrency control.</p>
            ''',
            demo_url='https://demo-ecommerce.example.com',
            github_url='https://github.com/example/ecommerce-platform',
            technologies=json.dumps(['React', 'Flask', 'PostgreSQL', 'Tailwind CSS', 'Stripe API']),
            status='published',
            is_featured=True,
            category_id=web_dev.id,
            user_id=admin.id,
            views_count=245,
            created_at=datetime.now()
        )
        
        project2 = Project(
            title='Task Management App',
            slug='task-management-app',
            description='A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.',
            content='''
            <h3>Project Overview</h3>
            <p>A comprehensive task management solution designed for teams to collaborate effectively. The application provides intuitive interfaces for task creation, assignment, and tracking.</p>
            
            <h3>Features</h3>
            <ul>
                <li>Kanban-style task boards</li>
                <li>Real-time collaboration</li>
                <li>Drag-and-drop task management</li>
                <li>Team member assignments</li>
                <li>Due date tracking and notifications</li>
                <li>Project progress analytics</li>
            </ul>
            
            <h3>Technology Stack</h3>
            <p>Built with Vue.js frontend, Flask backend, and WebSocket integration for real-time updates. The application uses PostgreSQL for data persistence and Redis for caching.</p>
            ''',
            demo_url='https://demo-tasks.example.com',
            github_url='https://github.com/example/task-management',
            technologies=json.dumps(['Vue.js', 'Flask', 'WebSockets', 'PostgreSQL', 'Redis']),
            status='published',
            is_featured=True,
            category_id=web_dev.id,
            user_id=admin.id,
            views_count=189,
            created_at=datetime.now()
        )
        
        project3 = Project(
            title='Data Visualization Dashboard',
            slug='data-visualization-dashboard',
            description='Interactive dashboard for data visualization and analytics with multiple chart types, real-time data updates, and export capabilities.',
            content='''
            <h3>Project Overview</h3>
            <p>An advanced data visualization dashboard that transforms complex datasets into intuitive, interactive charts and graphs. Perfect for business intelligence and data analysis.</p>
            
            <h3>Visualization Types</h3>
            <ul>
                <li>Line and area charts for trends</li>
                <li>Bar and column charts for comparisons</li>
                <li>Pie and donut charts for distributions</li>
                <li>Scatter plots for correlations</li>
                <li>Heat maps for multi-dimensional data</li>
                <li>Geographic maps for location data</li>
            </ul>
            
            <h3>Technical Features</h3>
            <p>Built with D3.js for custom visualizations and Chart.js for standard charts. The backend processes data using Python and Pandas, with caching for improved performance.</p>
            ''',
            demo_url='https://demo-dashboard.example.com',
            github_url='https://github.com/example/data-dashboard',
            technologies=json.dumps(['Python', 'D3.js', 'Pandas', 'Flask', 'Chart.js']),
            status='published',
            is_featured=False,
            category_id=data_science.id,
            user_id=admin.id,
            views_count=156,
            created_at=datetime.now()
        )
        
        db.session.add_all([project1, project2, project3])
        db.session.commit()
        
        # Add tags to projects
        project1.tags.extend([tags[0], tags[1], tags[2], tags[3], tags[8]])  # Python, JavaScript, React, Flask, Bootstrap
        project2.tags.extend([tags[1], tags[10], tags[3], tags[14], tags[16]])  # JavaScript, Vue.js, Flask, PostgreSQL, Redis
        project3.tags.extend([tags[0], tags[1], tags[22], tags[21], tags[20]])  # Python, JavaScript, Pandas, TensorFlow, Machine Learning
        
        db.session.commit()
        
        # Create sample achievements
        achievement1 = Achievement(
            title='AWS Certified Solutions Architect',
            slug='aws-certified-solutions-architect',
            description='Successfully obtained AWS Solutions Architect Professional certification, demonstrating expertise in designing distributed systems on AWS.',
            content='''
            <h3>Certification Details</h3>
            <p>The AWS Certified Solutions Architect – Professional certification validates advanced technical skills and experience in designing distributed applications and systems on the AWS platform.</p>
            
            <h3>Skills Demonstrated</h3>
            <ul>
                <li>Designing and deploying dynamically scalable, highly available, fault-tolerant systems</li>
                <li>Selecting appropriate AWS services to design and deploy applications</li>
                <li>Migrating complex, multi-tier applications to AWS</li>
                <li>Designing and deploying enterprise-wide scalable operations</li>
                <li>Implementing cost-control strategies</li>
            </ul>
            
            <h3>Preparation Journey</h3>
            <p>Spent 6 months preparing through hands-on practice, online courses, and practice exams. Built several projects on AWS to gain practical experience.</p>
            ''',
            date_achieved=date(2023, 8, 15),
            organization='Amazon Web Services',
            certificate_url='https://aws.amazon.com/certification/verify',
            status='published',
            is_featured=True,
            category_id=certifications.id,
            user_id=admin.id,
            created_at=datetime.now()
        )
        
        achievement2 = Achievement(
            title='Google UX Design Certificate',
            slug='google-ux-design-certificate',
            description='Completed Google UX Design Professional Certificate, gaining comprehensive skills in user experience design and research.',
            content='''
            <h3>Program Overview</h3>
            <p>A comprehensive 6-month program covering the complete UX design process from user research to high-fidelity prototyping.</p>
            
            <h3>Skills Acquired</h3>
            <ul>
                <li>User research and persona development</li>
                <li>Information architecture and wireframing</li>
                <li>Visual design and prototyping</li>
                <li>Usability testing and iteration</li>
                <li>Accessibility and inclusive design</li>
                <li>Design systems and style guides</li>
            </ul>
            
            <h3>Capstone Projects</h3>
            <p>Completed three major design projects including a mobile app, responsive website, and cross-platform experience.</p>
            ''',
            date_achieved=date(2023, 6, 20),
            organization='Google',
            certificate_url='https://coursera.org/verify/certificate',
            status='published',
            is_featured=True,
            category_id=certifications.id,
            user_id=admin.id,
            created_at=datetime.now()
        )
        
        db.session.add_all([achievement1, achievement2])
        db.session.commit()
        
        # Add tags to achievements
        achievement1.tags.extend([tags[17], tags[16]])  # AWS, Docker
        achievement2.tags.extend([tags[23], tags[24], tags[25]])  # UI/UX, Figma, Photoshop
        
        db.session.commit()
        
        # Create sample comments
        comment1 = Comment(
            content='This is an amazing project! The implementation is very clean and the user interface is intuitive. Great work on the real-time features.',
            is_approved=True,
            user_id=user1.id,
            project_id=project1.id,
            created_at=datetime.now()
        )
        
        comment2 = Comment(
            content='I love the data visualization capabilities. The charts are interactive and very informative. Would love to see more chart types in future updates.',
            is_approved=True,
            user_id=user2.id,
            project_id=project3.id,
            created_at=datetime.now()
        )
        
        comment3 = Comment(
            content='Congratulations on the AWS certification! This is a significant achievement. How long did it take you to prepare for the exam?',
            is_approved=True,
            user_id=user1.id,
            achievement_id=achievement1.id,
            created_at=datetime.now()
        )
        
        db.session.add_all([comment1, comment2, comment3])
        db.session.commit()
        
        # Create sample likes
        like1 = Like(user_id=user1.id, project_id=project1.id)
        like2 = Like(user_id=user2.id, project_id=project1.id)
        like3 = Like(user_id=user1.id, project_id=project2.id)
        like4 = Like(user_id=user2.id, achievement_id=achievement1.id)
        
        # Anonymous likes
        like5 = Like(ip_address='192.168.1.100', project_id=project1.id)
        like6 = Like(ip_address='192.168.1.101', project_id=project3.id)
        
        db.session.add_all([like1, like2, like3, like4, like5, like6])
        db.session.commit()
        
        print("Database seeded successfully!")
        print(f"Admin user created: {admin.email} / admin123")
        print(f"Sample users: john@example.com / password123, jane@example.com / password123")
        print(f"Created {Project.query.count()} projects")
        print(f"Created {Achievement.query.count()} achievements")
        print(f"Created {Category.query.count()} categories")
        print(f"Created {Tag.query.count()} tags")
        print(f"Created {Comment.query.count()} comments")
        print(f"Created {Like.query.count()} likes")

if __name__ == '__main__':
    seed_database()
