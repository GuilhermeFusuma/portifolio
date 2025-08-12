# Overview

A comprehensive Flask-based portfolio website system featuring a modern purple/blue theme with admin panel, authentication, social features, and content management. The application allows portfolio owners to showcase projects and achievements while providing visitors with interactive features like commenting and liking. Built with a focus on responsive design and modern web development practices.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Template Engine**: Jinja2 templates with Bootstrap 5 for responsive UI
- **Styling**: Custom CSS with CSS variables for theming, purple/blue gradient design
- **JavaScript**: Vanilla JS for interactive features, animations, and form validation
- **Rich Text Editor**: CKEditor integration for content creation
- **Responsive Design**: Mobile-first approach with Bootstrap grid system

## Backend Architecture
- **Web Framework**: Flask with blueprints for modular organization
- **Database ORM**: SQLAlchemy with declarative base model
- **Authentication**: Flask-Login with password hashing, OAuth support (Google/LinkedIn)
- **Form Handling**: WTForms with CSRF protection
- **File Uploads**: Werkzeug secure filename handling with file type validation
- **Email System**: Flask-Mail for password reset and notifications

## Data Models
- **User System**: User model with admin privileges, OAuth integration, profile management
- **Content Models**: Projects and Achievements with categories, tags, media attachments
- **Social Features**: Comments with moderation, likes system, notifications
- **Media Management**: ProjectMedia model for file attachments

## Authentication & Authorization
- **Multi-provider Auth**: Email/password and OAuth (Google, LinkedIn)
- **Role-based Access**: Admin-only areas with decorator protection
- **Session Management**: Flask-Login with remember me functionality
- **Password Recovery**: JWT tokens for secure password reset flow

## Content Management System
- **CRUD Operations**: Full create, read, update, delete for projects and achievements
- **Status Management**: Draft/published workflow
- **Media Upload**: Support for images, videos, documents with file type validation
- **SEO Features**: Meta tags, Open Graph, Twitter Cards for social sharing
- **Search & Filtering**: Category and tag-based filtering, search functionality

# External Dependencies

## Core Framework Dependencies
- **Flask**: Web framework with SQLAlchemy, Login, Mail, WTF extensions
- **Bootstrap 5**: Frontend CSS framework via CDN
- **Font Awesome**: Icon library via CDN
- **Google Fonts**: Inter font family for typography

## Rich Text Editing
- **CKEditor 5**: WYSIWYG editor for content creation via CDN
- **Prism.js**: Syntax highlighting for code blocks

## Email Services
- **SMTP Integration**: Configurable mail server (defaults to Gmail SMTP)
- **Email Templates**: HTML email notifications for admin alerts

## OAuth Providers
- **Google OAuth**: User authentication and profile data
- **LinkedIn OAuth**: Professional network integration

## Database Support
- **SQLite**: Default database for development and simple deployments
- **PostgreSQL**: Production database option (configurable via DATABASE_URL)

## File Storage
- **Local File System**: Upload directory for media files
- **File Type Validation**: Support for images (PNG, JPG, GIF), videos (MP4, MOV, AVI), documents (PDF)

## Development Tools
- **Werkzeug**: WSGI utilities and development server
- **Python-dotenv**: Environment variable management (implied from config pattern)